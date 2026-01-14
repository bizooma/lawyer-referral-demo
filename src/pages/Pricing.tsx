import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { FAQPageSchema, BreadcrumbSchema, WebPageSchema } from "@/components/StructuredData";
import { CheckCircle, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Local Bar",
    description: "For county and city bar associations with focused referral programs",
    features: [
      "Up to 100 panel attorneys",
      "Single practice area focus or general",
      "Standard intake workflow",
      "Basic reporting & exports",
      "Email notifications",
      "Standalone or embedded deployment",
      "Email support"
    ],
    cta: "Contact Sales",
    highlighted: false
  },
  {
    name: "Regional Bar",
    description: "For larger associations with multi-county coverage and diverse practice areas",
    features: [
      "Up to 500 panel attorneys",
      "Multi-county geographic coverage",
      "Multiple practice area panels",
      "Advanced matching rules",
      "Payment logging & tracking",
      "Custom branding",
      "Priority email & phone support",
      "Quarterly business reviews"
    ],
    cta: "Contact Sales",
    highlighted: true
  },
  {
    name: "Statewide Program",
    description: "For state bar associations and large-scale referral operations",
    features: [
      "Unlimited panel attorneys",
      "Full state geographic coverage",
      "Unlimited practice area panels",
      "Enterprise matching engine",
      "Advanced analytics & reporting",
      "API access for integrations",
      "Dedicated account manager",
      "Custom SLA",
      "On-site training available"
    ],
    cta: "Contact Sales",
    highlighted: false
  }
];

const faqs = [
  {
    question: "Why don't you list prices?",
    answer: "Every bar association has unique needs, volumes, and configurations. We prefer to understand your specific requirements before providing a tailored quote that reflects the true value we can deliver."
  },
  {
    question: "What's included in the base price?",
    answer: "All tiers include hosting, maintenance, security updates, and standard support. Implementation and training services may be additional depending on scope."
  },
  {
    question: "Are there per-referral fees?",
    answer: "No. We charge a flat subscription fee based on your tier. There are no per-referral or per-transaction fees that would create misaligned incentives."
  },
  {
    question: "Can we switch tiers later?",
    answer: "Yes. As your program grows, you can upgrade to a higher tier. We'll work with you to migrate your data and configurations seamlessly."
  }
];

export default function Pricing() {
  return (
    <div className="flex flex-col">
      <SEO
        title="Pricing - Local, Regional & Statewide Plans"
        description="Flexible pricing for bar associations of all sizes. From local bars to statewide programs, find the right plan for your referral service."
        canonical="/pricing"
      />
      <FAQPageSchema faqs={faqs} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Pricing", url: "/pricing" }
        ]}
      />
      <WebPageSchema
        name="Pricing - Local, Regional & Statewide Plans"
        description="Flexible pricing for bar associations of all sizes"
        speakableSelectors={[".voice-pricing-intro"]}
      />
      
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Pricing
          </h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Flexible plans designed for bar associations of all sizes
          </p>
        </div>
      </section>

      {/* Voice-Optimized Pricing Intro */}
      <section className="py-12 bg-muted/30 voice-pricing-intro">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>How much does lawyer referral software cost?</strong> Bar Bridge Connect offers three pricing tiers based on your organization's size. Local Bar plans support up to 100 attorneys. Regional Bar plans handle up to 500 attorneys with multi-county coverage. Statewide Programs include unlimited attorneys with enterprise features. All plans use flat subscription pricing with no per-referral fees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`flex flex-col ${tier.highlighted ? 'border-primary shadow-lg scale-105' : ''}`}
              >
                <CardHeader>
                  {tier.highlighted && (
                    <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded w-fit mb-2">
                      Most Popular
                    </div>
                  )}
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-base">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link to="/contact">
                      <Button 
                        variant={tier.highlighted ? "hero" : "outline"} 
                        className="w-full"
                        size="lg"
                      >
                        {tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <Card key={faq.question}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{faq.question}</h3>
                    <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Learn More?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's discuss your program's needs and create a custom proposal
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="hero" size="xl">
                Request a Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg">
                Try the Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
