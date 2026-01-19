import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <h1 className="text-5xl font-bold tracking-tight mb-4">TradeTracking.io</h1>
      <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-8">
        Advanced Trading Analytics Platform
      </p>
      <div className="flex gap-4">
        <Link
          href="/auth/register"
          className="rounded-full bg-foreground text-background px-8 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Get Started
        </Link>
        <Link
          href="/auth/login"
          className="rounded-full border border-zinc-200 dark:border-zinc-800 px-8 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
