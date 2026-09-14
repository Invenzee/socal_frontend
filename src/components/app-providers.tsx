"use client";

import { AuthProvider } from "@/providers/auth-provider";
import { AuthDialogProvider } from "@/providers/auth-dialog-provider";
import { OfferDialogProvider } from "@/providers/offer-dialog-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import AuthDialog from "@/components/auth/auth-dialog";
import OfferPopup from "@/components/offer/offer-popup";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <AuthProvider>
        <AuthDialogProvider>
          <OfferDialogProvider>
            {children}
            <AuthDialog />
            <OfferPopup />
            <Toaster richColors position="top-right" />
          </OfferDialogProvider>
        </AuthDialogProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}
