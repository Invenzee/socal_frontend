import type { Metadata } from "next";
import LegalDocument from "@/components/legal-document";

export const metadata: Metadata = {
  title: "Terms and Conditions | SoCal Truck Trade",
  description: "The rules for buying, selling, and requesting offers on SoCal Truck Trade.",
};

const SECTIONS = [
  {
    heading: "The marketplace",
    paragraphs: [
      "SoCal Truck Trade is a truck-only marketplace based in Anaheim, California. Sellers can list a truck or ask us for an offer. Buyers can search listings and message the seller. Unless we send you a written offer to buy your truck, the sale is between the buyer and the seller. We do not own the trucks listed by users.",
    ],
  },
  {
    heading: "Accounts",
    paragraphs: [
      "You must give a real name, email, and phone number. You are responsible for activity under your login. Do not share your password. We can suspend an account that is false, abusive, or used to break these terms.",
    ],
  },
  {
    heading: "Listings",
    paragraphs: [
      "If you post a truck, you confirm that the details and photos are accurate and that you have the right to sell it. Do not list a truck you do not control. We can edit, refuse, or remove a listing that is misleading, incomplete, or not a truck we cover.",
      "Creating an account and browsing listings is free. If a listing fee applies, we will say so before you are charged.",
    ],
  },
  {
    heading: "Offers",
    paragraphs: [
      "An offer request is a request for us to contact you. It is not a promise that we will buy the truck, and it is not a finished sale. A price we quote is only binding when both sides confirm it in writing and the truck matches what you described. You are free to decline an offer.",
    ],
  },
  {
    heading: "Buying",
    paragraphs: [
      "Buyers deal with the seller named on the listing. Inspect the truck, confirm the title, and agree on payment before you hand over money. We do not guarantee the condition, mileage, title, or history of a user-posted truck. Photos and descriptions are provided by the seller.",
    ],
  },
  {
    heading: "Messages and contact",
    paragraphs: [
      "Use messages and the contact form for real questions about a truck or our service. Do not send spam, threats, or unrelated advertising. We may read messages if we need to investigate abuse or a support request.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "Do not scrape the site, break into an account, post malware, or use the marketplace for fraud. Do not copy another seller’s photos or pretend a truck is yours.",
    ],
  },
  {
    heading: "Our content",
    paragraphs: [
      "The SoCal Truck Trade name, logo, and site design belong to us. You keep ownership of the photos and text you upload, and you give us permission to show them on the marketplace for as long as the listing or message needs to stay up.",
    ],
  },
  {
    heading: "Disclaimers and liability",
    paragraphs: [
      "The site is provided as available. We do not promise that every listing is error-free or that a buyer and seller will complete a deal. To the extent the law allows, we are not liable for a loss that comes from a deal between users, a truck’s condition, or a delay on the site.",
      "Nothing in these terms limits liability that cannot be limited under California law.",
    ],
  },
  {
    heading: "Changes and contact",
    paragraphs: [
      "We can update these terms by posting a new version on this page. If you keep using the site after the update, the new terms apply.",
      "SoCal Truck Trade, Anaheim, California. Email info@socaltrucktrade.com or call +1 310-962-9113.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms and Conditions"
      updated="October 22, 2026"
      intro="These terms cover accounts, listings, messages, and offer requests on SoCal Truck Trade. Using the site means you agree to them."
      sections={SECTIONS}
    />
  );
}
