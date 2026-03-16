export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "ItsRyan.ai",
    url: "https://www.itsryan.ai",
    logo: "https://www.itsryan.ai/chatgptportrait.png",
    description:
      "Free AI tools, automations, and websites for Atlanta small businesses.",
    founder: {
      "@type": "Person",
      name: "Ryan Widgeon",
    },
    areaServed: {
      "@type": "City",
      name: "Atlanta",
      "@id": "https://www.wikidata.org/wiki/Q23556",
    },
    serviceType: [
      "AI Chatbot Development",
      "Business Automation",
      "Website Development",
      "AI Consulting",
    ],
    priceRange: "Free",
    sameAs: [
      "https://github.com/wacemindu123",
      "https://linkedin.com/in/ryan-widgeon",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
