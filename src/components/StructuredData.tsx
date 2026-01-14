import { Helmet } from "react-helmet-async";

const SITE_URL = "https://bar-bridge-connect.lovable.app";

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Lawyer Referral Program",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.png`,
    description:
      "Modern lawyer referral program software built for bar associations. Streamline intake, matching, and reporting with ethics-aware infrastructure.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@lawyerreferralprogram.com",
      contactType: "sales",
      availableLanguage: "English",
    },
    sameAs: [],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Software Application Schema
export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lawyer Referral Program",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    description:
      "Lawyer referral program management software for bar associations with intake management, attorney matching, and compliance reporting.",
    offers: {
      "@type": "Offer",
      category: "Subscription",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: [
      "Intake Management Dashboard",
      "Smart Attorney Matching",
      "Compliance Reporting",
      "Payment Logging",
      "Audit Trail",
      "White-label Deployment",
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// FAQ Page Schema
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQPageSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// HowTo Schema
interface HowToStep {
  name: string;
  text: string;
}

export function HowToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Service Schema
export function ServiceSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Lawyer Referral Program Management",
    serviceType: "Legal Technology Platform",
    provider: {
      "@type": "Organization",
      name: "Lawyer Referral Program",
      url: SITE_URL,
    },
    description:
      "Comprehensive software platform for managing lawyer referral programs, including intake management, attorney matching, compliance reporting, and payment tracking.",
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Service Plans",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Local Bar Plan",
            description: "For county and city bar associations",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Regional Bar Plan",
            description: "For larger associations with multi-county coverage",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Statewide Program",
            description: "For state bar associations and large-scale operations",
          },
        },
      ],
    },
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// WebPage with Speakable Schema (for Voice SEO)
export function WebPageSchema({
  name,
  description,
  speakableSelectors = [],
}: {
  name: string;
  description: string;
  speakableSelectors?: string[];
}) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    isPartOf: {
      "@type": "WebSite",
      name: "Lawyer Referral Program",
      url: SITE_URL,
    },
  };

  if (speakableSelectors.length > 0) {
    schema.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: speakableSelectors,
    };
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
