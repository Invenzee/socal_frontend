import type { Metadata } from "next";
import { Momo_Trust_Display, Poppins } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
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
  description: "Get a fast, fair offer on your truck today.",
  icons: {
    icon: [{ url: "/logo.webp", type: "image/webp" }],
    apple: "/logo.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${momoTrustDisplay.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white font-sans text-black">
        <AppProviders>
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
