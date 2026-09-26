import { defineConfig } from "geoaeo";

export default defineConfig({
  siteName: "Reply Kit",
  siteUrl: "https://example.com",
  description: "Draft replies for social posts.",
  platforms: ["X", "LinkedIn"],
  tools: [
    {
      name: "Engagement rate calculator",
      url: "/tools/engagement-rate-calculator",
      description: "Calculate the interaction rate for a post or profile.",
    },
  ],
  plans: [
    { name: "Free", price: 0, description: "Basic use." },
    { name: "Pro", price: 9, description: "Higher limits." },
  ],
  faq: [{ question: "Does it post automatically?", answer: "No. You review and send each draft." }],
  pages: ["pricing", "faq"],
});
