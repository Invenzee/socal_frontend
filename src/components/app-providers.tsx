"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { AuthDialogProvider } from "@/providers/auth-dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AuthDialog from "@/components/auth/auth-dialog";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <AuthProvider>
        <AuthDialogProvider>
          {children}
          <AuthDialog />
          <Toaster richColors position="top-right" />
        </AuthDialogProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}
