import type { Metadata } from "next";
import { Momo_Trust_Display, Poppins } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import TawkChat from "@/components/tawk-chat";
import { AppProviders } from "@/components/app-providers";
import "./globals.css";

const momoTrustDisplay = Momo_Trust_Display({
  variable: "--font-momo-trust-display",
  subsets: ["latin"],
  weight: "400",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SoCal Truck Trade",
  description:
    "Buy and sell commercial trucks, work vehicles, and fleet vehicles in Southern California. Downsizing your fleet? Sell your commercial trucks with SoCal Truck Trade.",
  keywords: [
    "2016 and above",
    "Plumber truck",
    "Plumber van",
    "Utility bed",
    "Utility truck",
    "Work truck",
    "Lifted truck",
    "Contractor truck",
    "Welding truck",
    "Construction truck",
    "Cargo van",
    "Water truck",
    "Chipper truck",
    "Dump truck",
    "Lariat",
    "Laramie",
    "Platinum",
    "King Ranch",
    "Denali",
    "Raptor",
    "TRX",
    "F150 F250 F350 F450 F550 F650",
    "Ram 1500, 2500, 3500, 4500, 5500",
    "Chevy GMC 1500 2500 3500",
    "Dually",
    "Dual rear wheel",
    "Single rear wheel",
  ],
  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    apple: "/logo.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const socketUrl = process.env.SOCKET_PUBLIC_URL || process.env.NEXT_PUBLIC_SOCKET_URL || "";

  return (
    <html
      lang="en"
      className={`${momoTrustDisplay.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white font-sans text-black">
        {socketUrl ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__SOCAL_SOCKET_URL__=${JSON.stringify(socketUrl)};`,
            }}
          />
        ) : null}
        <AppProviders>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <TawkChat />
        </AppProviders>
      </body>
    </html>
  );
}
