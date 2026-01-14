import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { HowToSchema, BreadcrumbSchema, WebPageSchema } from "@/components/StructuredData";
import { 
  Phone, 
  ClipboardList, 
  Search, 
  Send, 
  FileCheck,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const workflowSteps = [
  {
    step: 1,
    icon: Phone,
    title: "Receive the Call",
    description: "A member of the public contacts your bar association seeking a lawyer referral.",
    details: [
      "Toll-free number or online form submission",
      "Initial screening by trained intake staff",
      "Warm transfer to referral system"
    ]
  },
  {
    step: 2,
    icon: ClipboardList,
    title: "Complete the Intake",
    description: "Staff use a guided wizard to capture essential information about the caller's legal matter.",
    details: [
      "Caller contact information",
      "Nature of legal issue and area of law",
      "Geographic location and language needs",
      "Urgency level and special requirements"
    ]
  },
  {
    step: 3,
    icon: Search,
    title: "Match to Attorneys",
    description: "The system automatically identifies qualified attorneys based on configurable matching rules.",
    details: [
      "Practice area expertise matching",
      "Geographic coverage verification",
      "Language capability matching",
      "Capacity and availability check",
      "Exclusion flag enforcement"
    ]
  },
  {
    step: 4,
    icon: Send,
    title: "Send the Referral",
    description: "Staff select an attorney and send the referral via email, SMS, or printed letter.",
    details: [
      "One-click referral assignment",
      "Automatic notification to attorney",
      "Referral letter generation",
      "Confirmation to caller (optional)"
    ]
  },
  {
    step: 5,
    icon: FileCheck,
    title: "Track & Report",
    description: "Monitor outcomes, log payments, and generate compliance reports.",
    details: [
      "Referral outcome tracking",
      "Payment logging (if applicable)",
      "Audit trail for every action",
      "Custom report generation"
    ]
  }
];

export default function HowItWorks() {
  return (
    <div className="flex flex-col">
      <SEO
        title="How Lawyer Referral Matching Works"
        description="See how Lawyer Referral Program automates client intake, matches them with qualified attorneys, and tracks referrals from start to completion."
        canonical="/how-it-works"
      />
      <HowToSchema
        name="How to Run a Lawyer Referral Program"
        description="A streamlined five-step workflow from caller intake to compliance reporting"
        steps={workflowSteps.map(step => ({
          name: step.title,
          text: step.description
        }))}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "How It Works", url: "/how-it-works" }
        ]}
      />
      <WebPageSchema
        name="How Lawyer Referral Matching Works"
        description="A five-step workflow from caller intake to compliance reporting"
        speakableSelectors={[".voice-intro", ".workflow-summary"]}
      />
      
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            How It Works
          </h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            A streamlined workflow from caller intake to compliance reporting
          </p>
        </div>
      </section>

      {/* Voice-Optimized Intro */}
      <section className="py-12 bg-muted/30 voice-intro">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>How does a lawyer referral program work?</strong> When someone needs legal help, they call the bar association. A trained intake specialist captures their information, then the system matches them with a qualified attorney based on practice area, location, and availability. The referral is sent to the attorney, and the program tracks the outcome for compliance reporting.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="space-y-12 lg:space-y-16">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {index < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute left-8 top-20 bottom-0 w-0.5 bg-border -mb-16" />
                )}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
                  <div className="flex-shrink-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <step.icon className="h-7 w-7" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                        Step {step.step}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold">{step.title}</h2>
                    <p className="mt-2 text-lg text-muted-foreground">{step.description}</p>
                    <ul className="mt-4 space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 lg:w-80">
                    <Card className="bg-muted/50 border-dashed">
                      <CardContent className="p-6">
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-sm text-muted-foreground">Screenshot placeholder</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Placeholder */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight">See It in Action</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Watch a quick walkthrough of the complete workflow
            </p>
            <Card className="mt-8 bg-muted border-dashed">
              <CardContent className="p-0">
                <div className="aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <div className="h-0 w-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1" />
                    </div>
                    <p className="text-muted-foreground">Video placeholder</p>
                    <p className="text-sm text-muted-foreground/60">Product demo video coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Summary for Voice */}
      <section className="py-12 bg-muted/30 workflow-summary">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">The Five Steps in Brief</h2>
            <p className="text-muted-foreground leading-relaxed">
              Step one: receive the call. Step two: complete the intake with a guided wizard. Step three: match to attorneys based on your rules. Step four: send the referral via email, SMS, or letter. Step five: track outcomes and generate compliance reports.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold tracking-tight">Try the Workflow Yourself</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the complete intake-to-referral process with our interactive demo
          </p>
          <div className="mt-8">
            <Link to="/demo">
              <Button variant="hero" size="xl">
                View Demo Workflow
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
