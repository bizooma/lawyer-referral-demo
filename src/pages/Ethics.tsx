import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema, WebPageSchema, FAQPageSchema } from "@/components/StructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Shield, 
  Scale, 
  FileText, 
  History,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Lock,
  Eye,
  Users
} from "lucide-react";

const principles = [
  {
    icon: Scale,
    title: "Bar-Controlled Rules",
    description: "Your organization maintains complete control over matching criteria, eligibility requirements, and referral policies. We provide the infrastructure — you set the rules."
  },
  {
    icon: Lock,
    title: "No Fee Sharing",
    description: "The platform is designed to facilitate referrals, not profit from them. There are no arrangements that could create improper fee-sharing concerns."
  },
  {
    icon: History,
    title: "Complete Audit Trail",
    description: "Every action in the system is logged with timestamps and user attribution. This provides the transparency needed for compliance reviews and oversight."
  },
  {
    icon: FileText,
    title: "Configurable Disclaimers",
    description: "Customize all public-facing disclaimers and disclosures to meet your jurisdiction's requirements. We provide templates, but you control the language."
  },
  {
    icon: Eye,
    title: "Data Ownership",
    description: "All data belongs to your organization. You can export your data at any time, and we never use client information for marketing or third-party purposes."
  },
  {
    icon: Users,
    title: "Attorney Panel Control",
    description: "You determine which attorneys are eligible for referrals, set capacity limits, and can instantly remove attorneys from the panel when needed."
  }
];

const complianceFeatures = [
  "ABA Model Rule 7.2 compliance considerations built-in",
  "Configurable fee structures (flat fee, sliding scale, or no fee)",
  "Eligibility verification workflow support",
  "Geographic jurisdiction enforcement",
  "Conflict-of-interest flagging capabilities",
  "Multi-level approval workflows for sensitive cases"
];

const ethicsFaqs = [
  {
    question: "Does Bar Bridge Connect comply with ABA Model Rule 7.2?",
    answer: "The platform is designed with ABA Model Rule 7.2 compliance considerations in mind. It supports proper fee structures, avoids improper fee-sharing, and provides the transparency needed for oversight. However, ultimate compliance responsibility rests with the operating bar association."
  },
  {
    question: "Who owns the data in the system?",
    answer: "Your organization owns all data. We act as a data processor, not a data owner. You can export your data at any time in standard formats, and we never use client information for marketing or share it with third parties."
  },
  {
    question: "How do you prevent fee-sharing concerns?",
    answer: "The platform charges a flat subscription or usage-based fee to the bar association for software services only. There are no per-referral fees to attorneys, no revenue sharing based on case outcomes, and no arrangements that could create improper fee-sharing concerns."
  },
  {
    question: "Can we customize disclaimers for our jurisdiction?",
    answer: "Yes, all public-facing disclaimers, disclosures, and terms are fully customizable. We provide sample language as a starting point, but your organization controls the final text to ensure it meets your specific jurisdiction's requirements."
  },
  {
    question: "What audit capabilities are available?",
    answer: "Every action in the system is logged with timestamps, user attribution, and detailed context. You can generate audit reports for any time period, review individual intake histories, and export compliance documentation as needed for oversight reviews."
  }
];

export default function Ethics() {
  return (
    <div className="flex flex-col">
      <SEO
        title="Ethics & Compliance for Lawyer Referral Programs"
        description="Built with bar association ethics requirements at the foundation. ABA Model Rule compliant with configurable policies and audit trails."
        canonical="/ethics"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Ethics & Compliance", url: "/ethics" }
        ]}
      />
      <WebPageSchema
        name="Ethics & Compliance - Bar Bridge Connect"
        description="Ethics-aware design principles for lawyer referral programs"
        speakableSelectors={[".ethics-intro", ".ethics-faq"]}
      />
      <FAQPageSchema faqs={ethicsFaqs} />
      
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Ethics & Compliance
          </h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Built with bar association ethics requirements at the foundation
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 bg-info/10 border-y border-info/20">
        <div className="section-container">
          <div className="flex items-start gap-4 max-w-3xl mx-auto">
            <AlertTriangle className="h-6 w-6 text-info flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-info">Important Notice</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                <strong>This platform is not a law firm and does not provide legal advice.</strong> The Lawyer Referral Program is infrastructure software operated by your bar association. All referral policies, attorney eligibility determinations, and client interactions are the responsibility of the operating organization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Ethics-Aware Design Principles</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed with professional responsibility considerations in mind
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {principles.map((principle) => (
              <Card key={principle.title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <principle.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{principle.title}</h3>
                  <p className="mt-2 text-muted-foreground">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Features */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-bold tracking-tight">
                  Compliance-Ready Features
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Tools and configurations to help you maintain compliance with applicable rules of professional conduct.
                </p>
                <ul className="mt-6 space-y-3">
                  {complianceFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Your Responsibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      While this platform provides tools to support ethical compliance, the operating organization is responsible for:
                    </p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Verifying attorney eligibility and bar standing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Setting appropriate referral policies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Training staff on ethical guidelines</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Ensuring jurisdiction-specific compliance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>Maintaining required disclaimers</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimers */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
              Sample Disclaimer Language
            </h2>
            <Card className="bg-muted/50">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground italic">
                  "The [Organization Name] Lawyer Referral Service is a public service that helps connect individuals with attorneys who may be able to assist with their legal matters. This service is not a law firm and does not provide legal advice. Attorneys participating in the referral panel are independent practitioners, not employees or agents of [Organization Name]. A referral does not constitute an endorsement or guarantee of the quality of legal services. The referral fee, if any, is charged to cover administrative costs and is not shared with participating attorneys. By using this service, you acknowledge that you have been informed of these terms."
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Note: This is sample language only. Actual disclaimers should be reviewed by your organization's counsel and customized for your jurisdiction.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 ethics-faq">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Ethics & Compliance Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Common questions about ethical considerations and compliance
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {ethicsFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold tracking-tight">Questions About Compliance?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            We're happy to discuss how the platform can be configured to meet your specific requirements
          </p>
          <div className="mt-8">
            <Link to="/contact">
              <Button variant="hero" size="xl">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
