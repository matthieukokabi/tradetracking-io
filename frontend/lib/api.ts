import { getSession } from "next-auth/react";
import { Trade, DashboardStats, JournalResponse, EquityCurveResponse } from "../types";
import { TradeFilters } from "../types/filters";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const session = await getSession();
    const token = (session as any)?.accessToken;

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private buildQueryString(filters?: TradeFilters, limit?: number): string {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());

    if (filters) {
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.symbol) params.append("symbol", filters.symbol);
      if (filters.side) params.append("side", filters.side);
      if (filters.status) params.append("status", filters.status);
    }

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  }

  // Public Routes (No Auth Needed)
  async healthCheck(): Promise<{ status: string; service: string }> {
    // Override fetch to skip auth for health check if desired, or let it fail if protected (it's public in backend)
    const url = `${this.baseUrl}/api/v1/health`;
    const response = await fetch(url);
    return response.json();
  }

  async register(username: string, email: string, password: string): Promise<any> {
    const url = `${this.baseUrl}/api/v1/auth/register`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password: password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Registration failed");
    }
    return response.json();
  }

  // Protected Routes
  async getDashboardStats(filters?: TradeFilters): Promise<DashboardStats> {
    return this.fetch<DashboardStats>(`/api/v1/dashboard/stats${this.buildQueryString(filters)}`);
  }

  // Journal
  async getJournalStats(filters?: TradeFilters): Promise<JournalResponse> {
    return this.fetch<JournalResponse>(`/api/v1/journal/stats${this.buildQueryString(filters)}`);
  }

  // Reports
  async getEquityCurve(filters?: TradeFilters): Promise<EquityCurveResponse> {
    return this.fetch<EquityCurveResponse>(`/api/v1/reports/equity${this.buildQueryString(filters)}`);
  }

  // Trades
  async getTrades(limit: number = 100, filters?: TradeFilters): Promise<Trade[]> {
    return this.fetch<Trade[]>(`/api/v1/trades${this.buildQueryString(filters, limit)}`);
  }

  async importTrades(file: File): Promise<{ status: string; imported: number; message: string }> {
    const session = await getSession();
    const token = (session as any)?.accessToken;

    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseUrl}/api/v1/trades/import`;
    const response = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Import failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getTrade(id: string): Promise<Trade> {
    return this.fetch<Trade>(`/api/v1/trades/${id}`);
  }

  async createTrade(trade: Omit<Trade, "_id">): Promise<Trade> {
    return this.fetch<Trade>("/api/v1/trades", {
      method: "POST",
      body: JSON.stringify(trade),
    });
  }

  async updateTrade(id: string, trade: Partial<Trade>): Promise<Trade> {
    return this.fetch<Trade>(`/api/v1/trades/${id}`, {
      method: "PUT",
      body: JSON.stringify(trade),
    });
  }

  async deleteTrade(id: string): Promise<{ status: string; message: string }> {
    return this.fetch<{ status: string; message: string }>(`/api/v1/trades/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiClient(API_URL);
