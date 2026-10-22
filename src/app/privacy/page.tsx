import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy | SoCal Truck Trade",
  description: "How SoCal Truck Trade collects, uses, and shares information on the truck marketplace.",
};

const SECTIONS = [
  {
    heading: "Who we are",
    paragraphs: [
      "SoCal Truck Trade is a truck-only marketplace based in Anaheim, California. Buyers and sellers use the site to list trucks, request offers, browse inventory, and message each other. This policy explains what we collect when you use socaltrucktrade.com, create an account, post a listing, request an offer, or contact us.",
    ],
  },
  {
    heading: "Information you give us",
    paragraphs: [
      "Account details include your name, email, phone number, and password. If you sell, we also store the truck details you post: year, make, model, mileage, price, photos, VIN or plate if you provide them, location, and description.",
      "Offer and contact forms collect the name, email, phone, and message or truck details you submit, even if you do not create an account. Messages between buyers and sellers are stored so both people can read the conversation.",
    ],
  },
  {
    heading: "Information collected automatically",
    paragraphs: [
      "We store a guest identifier in a cookie so an offer or listing started before signup can be tied to you later. We also keep basic technical data such as browser type, pages visited, and the time of a request. We use that to keep the site working, limit abuse, and understand which pages people use.",
    ],
  },
  {
    heading: "How we use information",
    paragraphs: [
      "We use your information to run the marketplace: create accounts, publish listings, deliver messages, respond to offer and contact requests, and follow up by phone or email. We also use it to prevent fraud, enforce our Terms and Conditions, and improve the site.",
      "A listing you publish is meant to be seen by other users. Your public listing shows the truck details and photos you chose to post. We do not publish your password or private account email on a listing.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: [
      "Buyers and sellers see the messages and listing details needed to complete a conversation. We use service providers for hosting, email, and photo storage. Those providers only process information so we can operate the site.",
      "We may share information if the law requires it, or to protect users, our staff, or the marketplace from fraud or abuse. We do not sell your personal information.",
    ],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "We use a guest cookie and sign-in cookies so the site remembers your session. You can block cookies in your browser. If you do, login, saved listings, and guest offers may not work.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep account, listing, message, offer, and contact records for as long as your account is open and for a reasonable time after, so we can finish a deal, answer a dispute, or meet a legal duty. You can ask us to delete your account by emailing info@socaltrucktrade.com.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can update your profile in your account and choose what goes on a listing. California residents can ask what personal information we hold, ask us to delete it, and ask us not to sell it. We do not sell personal information. Email info@socaltrucktrade.com or call +1 310-962-9113.",
    ],
  },
  {
    heading: "Children",
    paragraphs: [
      "The marketplace is for adults arranging the sale of trucks. We do not knowingly collect information from anyone under 18.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      "SoCal Truck Trade, Anaheim, California. Email info@socaltrucktrade.com or call +1 310-962-9113. Questions about this policy can go to the same address.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updated="October 22, 2026"
      intro="This policy covers the SoCal Truck Trade marketplace, including accounts, listings, offers, messages, and the contact form."
      sections={SECTIONS}
    />
  );
}
