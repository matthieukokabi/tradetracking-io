"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ServerStatus from "./ServerStatus";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => {
    return pathname === path ? "text-foreground font-semibold" : "text-zinc-500 hover:text-foreground";
  };

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex h-16 items-center px-4 md:px-8 max-w-7xl mx-auto">
        <Link href="/" className="text-xl font-bold tracking-tight mr-8">
          TradeTracking.io
        </Link>

        {session && (
          <div className="flex gap-6 text-sm">
            <Link href="/dashboard" className={isActive("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/journal" className={isActive("/journal")}>
              Journal
            </Link>
            <Link href="/reports" className={isActive("/reports")}>
              Reports
            </Link>
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          <ServerStatus />

          {status === "loading" ? (
            <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">{session.user?.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-zinc-500 hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/auth/login" className="hover:opacity-80">
                Log in
              </Link>
              <Link href="/auth/register" className="bg-foreground text-background px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
