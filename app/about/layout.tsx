import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Traveler Experiences & Host Stays | Bhilwara Farms",
  description: "Discover the concept behind Bhilwara Farms. Learn how we connect nature retreat stays with seamless owner tools and OpenAI concierge support.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
