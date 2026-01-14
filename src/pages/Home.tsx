import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scale, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Globe,
  CheckCircle,
  ArrowRight,
  Building2,
  Gavel,
  HeartHandshake
} from "lucide-react";

const steps = [
  { icon: FileText, title: "Intake", description: "Capture caller information with a guided workflow" },
  { icon: Users, title: "Match", description: "Smart matching based on practice area, location & availability" },
  { icon: Scale, title: "Refer", description: "Send referrals via email, SMS, or print letter" },
  { icon: BarChart3, title: "Track", description: "Monitor outcomes and log payments" },
  { icon: Shield, title: "Report", description: "Generate compliance reports and analytics" },
];

const audiences = [
  { icon: Building2, title: "State Bar Associations", description: "Statewide programs with complex matching rules and high volume" },
  { icon: Gavel, title: "County & City Bars", description: "Local programs seeking modern infrastructure without IT burden" },
  { icon: HeartHandshake, title: "Legal Aid Organizations", description: "Pro bono and reduced-fee referral coordination" },
];

const deploymentModels = [
  { title: "Standalone Portal", description: "Your own branded URL (e.g., referrals.countybar.org) with full customization", icon: Globe },
  { title: "Embedded Widget", description: "Embed the intake form directly into your existing website", icon: FileText },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="pattern-dots absolute inset-0" />
        <div className="section-container relative py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              A Modern Lawyer Referral Program
            </h1>
            <p className="mt-2 text-xl font-medium text-primary-foreground/90 sm:text-2xl">
              Built for Bar Associations
            </p>
            <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              Intake. Matching. Reporting. Deployment. Fully Managed.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact">
                <Button variant="hero" size="xl">
                  Request a Demo
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="heroOutline" size="xl">
                  Access the Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Who It's For</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Purpose-built infrastructure for organizations that connect the public with qualified attorneys
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {audiences.map((audience) => (
              <Card key={audience.title} className="card-hover border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <audience.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{audience.title}</h3>
                  <p className="mt-2 text-muted-foreground">{audience.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A streamlined five-step workflow from caller intake to compliance reporting
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />
            <div className="grid gap-8 lg:grid-cols-5">
              {steps.map((step, index) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg z-10">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="mt-1 text-sm font-medium text-primary">Step {index + 1}</span>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg">
                Learn More About the Workflow
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Deployment Models */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Deployment Options</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose how you want to deploy — we handle the infrastructure
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {deploymentModels.map((model) => (
              <Card key={model.title} className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20 text-accent mb-4">
                    <model.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{model.title}</h3>
                  <p className="mt-2 text-muted-foreground">{model.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/deployment">
              <Button variant="outline" size="lg">
                Explore Deployment Options
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ethics Section */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-1">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ethics-Aware by Design
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Built with bar association compliance requirements in mind. You control the rules — we provide the infrastructure.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Bar-controlled matching and referral rules",
                    "No fee-sharing arrangements",
                    "Complete audit trail for every action",
                    "Configurable disclaimers and disclosures",
                    "Data ownership remains with your organization"
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/ethics">
                    <Button variant="outline">
                      Read About Ethics & Compliance
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-1">
                <div className="aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <Shield className="h-32 w-32 text-primary/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Bar Associations</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Placeholder testimonials — real testimonials coming soon
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { name: "Jane Smith", title: "Executive Director", org: "Sample County Bar Association", quote: "This platform transformed how we handle referrals. The matching system is incredibly accurate." },
              { name: "Robert Johnson", title: "Referral Coordinator", org: "Example State Bar", quote: "Finally, a modern solution that understands our compliance requirements." },
              { name: "Maria Garcia", title: "Pro Bono Director", org: "Demo Legal Aid Society", quote: "The reporting features alone save us hours every month." },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <p className="italic text-muted-foreground">"{testimonial.quote}"</p>
                  <div className="mt-4 pt-4 border-t">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.org}</p>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground/60 italic">
                    (Fictional testimonial for demonstration purposes)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 hero-gradient">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Modernize Your Referral Program?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            Schedule a demo to see how our platform can streamline your operations
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="hero" size="xl">
                Schedule a Demo
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="heroOutline" size="xl">
                Try the Interactive Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
