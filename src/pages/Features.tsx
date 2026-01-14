import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { ServiceSchema, BreadcrumbSchema, FAQPageSchema, WebPageSchema } from "@/components/StructuredData";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  LayoutDashboard, 
  Users, 
  GitBranch, 
  CreditCard, 
  BarChart3, 
  History,
  ArrowRight,
  CheckCircle,
  Settings,
  FileText,
  Bell,
  Lock
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Intake Dashboard",
    description: "A centralized command center for managing all incoming referral requests.",
    capabilities: [
      "Real-time intake queue with status indicators",
      "Quick filters by status, date, and practice area",
      "At-a-glance KPIs and activity feed",
      "One-click access to start new intakes"
    ]
  },
  {
    icon: Users,
    title: "Attorney Directory",
    description: "Comprehensive management of your panel attorney roster.",
    capabilities: [
      "Detailed attorney profiles with practice areas",
      "Geographic coverage and language capabilities",
      "Capacity management and availability tracking",
      "Eligibility flags and exclusion rules"
    ]
  },
  {
    icon: GitBranch,
    title: "Matching Rules Engine",
    description: "Configurable rules that power intelligent attorney matching.",
    capabilities: [
      "Practice area and specialty matching",
      "Geographic proximity scoring",
      "Language preference matching",
      "Capacity-aware distribution",
      "Custom exclusion criteria"
    ]
  },
  {
    icon: CreditCard,
    title: "Payment Logging",
    description: "Optional payment tracking for programs that collect referral fees.",
    capabilities: [
      "Record payment amounts and methods",
      "Track payment status by intake",
      "Generate payment reports",
      "Flexible fee structures"
    ]
  },
  {
    icon: BarChart3,
    title: "Reporting & Export",
    description: "Comprehensive analytics and data export capabilities.",
    capabilities: [
      "Pre-built reports for common metrics",
      "Volume by practice area and geography",
      "Referral outcome tracking",
      "CSV and PDF export options"
    ]
  },
  {
    icon: History,
    title: "Audit Trail",
    description: "Complete transparency with detailed activity logging.",
    capabilities: [
      "Every action timestamped and attributed",
      "Intake history and status changes",
      "User activity tracking",
      "Compliance-ready logging"
    ]
  }
];

const additionalFeatures = [
  { icon: Settings, title: "Customizable Workflows", description: "Tailor the intake process to your program's needs" },
  { icon: FileText, title: "Document Generation", description: "Auto-generate referral letters and confirmations" },
  { icon: Bell, title: "Notifications", description: "Email and SMS alerts for attorneys and staff" },
  { icon: Lock, title: "Role-Based Access", description: "Granular permissions for different user types" },
];

const featuresFaqs = [
  {
    question: "How does the smart attorney matching work?",
    answer: "The matching engine evaluates multiple criteria you define: practice area expertise, geographic coverage, language capabilities, current capacity, and any custom eligibility rules. Attorneys are scored and ranked, giving intake staff clear recommendations while maintaining your program's control over final assignments."
  },
  {
    question: "Can we import our existing attorney roster?",
    answer: "Yes, we support bulk import from CSV files or can help migrate data from your existing system. The import process validates bar numbers, practice areas, and contact information to ensure data quality."
  },
  {
    question: "What reports can we generate?",
    answer: "Pre-built reports include intake volume by practice area, referral outcomes, attorney utilization, payment summaries, and compliance audit logs. All reports can be exported to CSV or PDF, and custom reports can be configured based on your needs."
  },
  {
    question: "How does the payment logging feature work?",
    answer: "For programs that collect referral fees, you can record payment amounts, methods, and dates directly in the intake record. The system tracks payment status and generates payment reports, but does not process actual payments—keeping your existing payment workflows intact."
  },
  {
    question: "Is there an API for integration with other systems?",
    answer: "Yes, a RESTful API is available for integration with case management systems, CRMs, or custom applications. API access includes authentication, rate limiting, and comprehensive documentation."
  }
];

export default function Features() {
  return (
    <div className="flex flex-col">
      <SEO
        title="Features - Attorney Matching, Intake & Reporting"
        description="Explore powerful features including smart attorney matching, multi-step intake wizards, compliance tracking, and comprehensive reporting."
        canonical="/features"
      />
      <ServiceSchema />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Features", url: "/features" }
        ]}
      />
      <FAQPageSchema faqs={featuresFaqs} />
      <WebPageSchema
        name="Features - Attorney Matching, Intake & Reporting"
        description="Powerful features including smart attorney matching, intake wizards, and compliance reporting"
        speakableSelectors={[".voice-features-intro"]}
      />
      
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Features
          </h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Everything you need to run a modern, compliant lawyer referral program
          </p>
        </div>
      </section>

      {/* Voice-Optimized Features Intro */}
      <section className="py-12 bg-muted/30 voice-features-intro">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>What features does lawyer referral software need?</strong> Lawyer Referral Program includes six core features: an intake dashboard for managing referral requests, an attorney directory for your panel roster, a matching rules engine for intelligent attorney assignment, payment logging for fee-based programs, comprehensive reporting and export tools, and a complete audit trail for compliance oversight.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <div 
                key={feature.title} 
                className={`flex flex-col lg:flex-row gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="flex-1">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-bold">{feature.title}</h2>
                  <p className="mt-2 text-lg text-muted-foreground">{feature.description}</p>
                  <ul className="mt-6 space-y-3">
                    {feature.capabilities.map((capability) => (
                      <li key={capability} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span>{capability}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <Card className="bg-muted/50 border-dashed h-full">
                    <CardContent className="p-6 h-full flex items-center justify-center">
                      <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">Feature screenshot placeholder</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">And Much More</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Additional capabilities to streamline your program
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20 text-accent mb-4">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">
                Feature Questions Answered
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Common questions about platform capabilities
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {featuresFaqs.map((faq, index) => (
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
          <h2 className="text-3xl font-bold tracking-tight">See These Features in Action</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the full platform with our interactive demo environment
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <Button variant="hero" size="xl">
                Try the Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Request a Custom Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
