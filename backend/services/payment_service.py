"""
Stripe Payment Service for TradeTracking.io
Handles subscription management, checkout, and webhooks
"""

import stripe
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

# Product/Price IDs (should be configured in Stripe Dashboard)
SUBSCRIPTION_TIERS = {
    "starter": {
        "name": "Starter",
        "price_monthly": 0,
        "price_yearly": 0,
        "stripe_price_monthly": None,  # Free tier
        "stripe_price_yearly": None,
        "features": ["1 exchange", "Basic analytics", "Public leaderboard"]
    },
    "pro": {
        "name": "Pro",
        "price_monthly": 19,
        "price_yearly": 149,
        "stripe_price_monthly": os.getenv("STRIPE_PRO_MONTHLY_PRICE_ID"),
        "stripe_price_yearly": os.getenv("STRIPE_PRO_YEARLY_PRICE_ID"),
        "features": ["5 exchanges", "AI Sentiment Pro", "Trade Replay", "Priority support"]
    },
    "elite": {
        "name": "Elite",
        "price_monthly": 29,
        "price_yearly": 229,
        "stripe_price_monthly": os.getenv("STRIPE_ELITE_MONTHLY_PRICE_ID"),
        "stripe_price_yearly": os.getenv("STRIPE_ELITE_YEARLY_PRICE_ID"),
        "features": ["Unlimited exchanges", "Multi-Agent Suite", "API Access", "24/7 support"]
    }
}


class CheckoutSessionRequest(BaseModel):
    tier: str
    billing_cycle: str  # 'monthly' or 'yearly'
    success_url: str
    cancel_url: str


class SubscriptionInfo(BaseModel):
    tier: str
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    stripe_subscription_id: Optional[str] = None


async def create_checkout_session(
    user_id: str,
    email: str,
    tier: str,
    billing_cycle: str,
    success_url: str,
    cancel_url: str
) -> Dict[str, Any]:
    """Create a Stripe Checkout session for subscription."""
    if tier not in SUBSCRIPTION_TIERS:
        return {"success": False, "error": f"Invalid tier: {tier}"}

    tier_info = SUBSCRIPTION_TIERS[tier]

    if tier == "starter":
        return {"success": False, "error": "Starter is a free tier, no payment needed"}

    price_key = f"stripe_price_{billing_cycle}"
    price_id = tier_info.get(price_key)

    if not price_id:
        return {"success": False, "error": f"Price not configured for {tier} {billing_cycle}"}

    try:
        session = stripe.checkout.Session.create(
            customer_email=email,
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "user_id": user_id,
                "tier": tier,
                "billing_cycle": billing_cycle
            },
            subscription_data={
                "metadata": {
                    "user_id": user_id,
                    "tier": tier
                }
            }
        )

        return {
            "success": True,
            "session_id": session.id,
            "checkout_url": session.url
        }
    except stripe.error.StripeError as e:
        return {"success": False, "error": str(e)}


async def create_customer_portal_session(
    stripe_customer_id: str,
    return_url: str
) -> Dict[str, Any]:
    """Create a Stripe Customer Portal session for managing subscription."""
    try:
        session = stripe.billing_portal.Session.create(
            customer=stripe_customer_id,
            return_url=return_url
        )

        return {
            "success": True,
            "portal_url": session.url
        }
    except stripe.error.StripeError as e:
        return {"success": False, "error": str(e)}


async def get_subscription_status(stripe_subscription_id: str) -> SubscriptionInfo:
    """Get current subscription status from Stripe."""
    try:
        subscription = stripe.Subscription.retrieve(stripe_subscription_id)

        tier = subscription.metadata.get("tier", "starter")

        return SubscriptionInfo(
            tier=tier,
            status=subscription.status,
            current_period_start=datetime.fromtimestamp(subscription.current_period_start),
            current_period_end=datetime.fromtimestamp(subscription.current_period_end),
            cancel_at_period_end=subscription.cancel_at_period_end,
            stripe_subscription_id=stripe_subscription_id
        )
    except stripe.error.StripeError:
        return SubscriptionInfo(tier="starter", status="none")


async def cancel_subscription(stripe_subscription_id: str, immediate: bool = False) -> Dict[str, Any]:
    """Cancel a subscription."""
    try:
        if immediate:
            subscription = stripe.Subscription.delete(stripe_subscription_id)
        else:
            subscription = stripe.Subscription.modify(
                stripe_subscription_id,
                cancel_at_period_end=True
            )

        return {
            "success": True,
            "status": subscription.status,
            "cancel_at_period_end": subscription.cancel_at_period_end if not immediate else None
        }
    except stripe.error.StripeError as e:
        return {"success": False, "error": str(e)}


async def handle_webhook_event(payload: bytes, sig_header: str) -> Dict[str, Any]:
    """Handle Stripe webhook events."""
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError:
        return {"success": False, "error": "Invalid payload"}
    except stripe.error.SignatureVerificationError:
        return {"success": False, "error": "Invalid signature"}

    event_type = event["type"]
    data = event["data"]["object"]

    result = {
        "success": True,
        "event_type": event_type,
        "action": None,
        "user_id": None,
        "tier": None
    }

    if event_type == "checkout.session.completed":
        # User completed checkout
        user_id = data.get("metadata", {}).get("user_id")
        tier = data.get("metadata", {}).get("tier")
        result.update({
            "action": "subscription_created",
            "user_id": user_id,
            "tier": tier,
            "stripe_customer_id": data.get("customer"),
            "stripe_subscription_id": data.get("subscription")
        })

    elif event_type == "customer.subscription.updated":
        # Subscription was updated (upgrade/downgrade)
        user_id = data.get("metadata", {}).get("user_id")
        tier = data.get("metadata", {}).get("tier")
        result.update({
            "action": "subscription_updated",
            "user_id": user_id,
            "tier": tier,
            "status": data.get("status")
        })

    elif event_type == "customer.subscription.deleted":
        # Subscription was cancelled
        user_id = data.get("metadata", {}).get("user_id")
        result.update({
            "action": "subscription_cancelled",
            "user_id": user_id,
            "tier": "starter"  # Downgrade to free
        })

    elif event_type == "invoice.payment_failed":
        # Payment failed
        customer_id = data.get("customer")
        result.update({
            "action": "payment_failed",
            "stripe_customer_id": customer_id
        })

    return result


def get_pricing_info() -> Dict[str, Any]:
    """Get pricing information for frontend display."""
    return {
        tier_id: {
            "name": info["name"],
            "price_monthly": info["price_monthly"],
            "price_yearly": info["price_yearly"],
            "features": info["features"]
        }
        for tier_id, info in SUBSCRIPTION_TIERS.items()
    }
