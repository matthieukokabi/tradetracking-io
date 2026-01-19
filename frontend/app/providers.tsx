"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { StyleProvider } from "@/contexts/StyleContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StyleProvider>
        {children}
        <Toaster position="bottom-right" richColors />
      </StyleProvider>
    </SessionProvider>
  );
}
