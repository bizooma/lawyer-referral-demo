import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { 
  Globe, 
  Code, 
  CheckCircle,
  ArrowRight,
  Server,
  Palette,
  Shield
} from "lucide-react";

const deploymentOptions = [
  {
    icon: Globe,
    title: "Standalone Portal",
    subtitle: "Your own branded referral website",
    description: "A fully hosted, white-labeled referral portal on your own subdomain. Perfect for bar associations that want a dedicated, professional web presence for their referral program.",
    example: "referrals.countybar.org",
    features: [
      "Custom subdomain (e.g., referrals.yourbar.org)",
      "Full branding customization",
      "Dedicated intake portal for the public",
      "Staff admin dashboard",
      "SSL certificate included",
      "99.9% uptime SLA"
    ]
  },
  {
    icon: Code,
    title: "Embedded Widget",
    subtitle: "Integrate into your existing website",
    description: "Embed the intake form directly into your current website. Ideal for organizations that want to maintain their existing web presence while adding referral capabilities.",
    example: "yourbar.org/find-a-lawyer",
    features: [
      "Simple embed code snippet",
      "Seamless visual integration",
      "Responsive design",
      "Customizable styling",
      "Secure iframe implementation",
      "No IT infrastructure required"
    ]
  }
];

const infrastructureFeatures = [
  { icon: Server, title: "Fully Managed Hosting", description: "We handle servers, updates, and maintenance" },
  { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant infrastructure with encryption" },
  { icon: Palette, title: "White-Label Ready", description: "Your branding, your domain, your program" },
];

export default function Deployment() {
  return (
    <div className="flex flex-col">
      <SEO
        title="Deployment Options - Standalone Portal or Widget"
        description="Deploy as a branded standalone portal or embed into your existing website. Enterprise-grade hosting with white-label customization."
        canonical="/deployment"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Deployment", url: "/deployment" }
        ]}
      />
      
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Deployment Options
          </h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Flexible deployment to fit your organization's needs
          </p>
        </div>
      </section>

      {/* Deployment Options */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid gap-8 lg:grid-cols-2">
            {deploymentOptions.map((option) => (
              <Card key={option.title} className="card-hover">
                <CardHeader>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <option.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl">{option.title}</CardTitle>
                  <CardDescription className="text-base">{option.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{option.description}</p>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Example URL</p>
                    <code className="text-sm font-mono text-primary">{option.example}</code>
                  </div>

                  <ul className="space-y-2">
                    {option.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Embed Code Example */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Easy Integration</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Adding the referral widget to your site is as simple as copying a code snippet
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Embed Code Example</CardTitle>
                <CardDescription>
                  Add this snippet to your website to display the intake form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300">
{`<!-- Lawyer Referral Program Widget -->
<div id="lrp-intake-widget"></div>
<script src="https://widget.lawyerreferralprogram.com/embed.js"></script>
<script>
  LRP.init({
    orgId: 'your-organization-id',
    theme: 'light',
    primaryColor: '#1e3a5f'
  });
</script>`}
                  </pre>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Note: This is a demonstration example. Actual embed code will be provided during onboarding.
                </p>
              </CardContent>
            </Card>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Subdomain Setup</CardTitle>
                <CardDescription>
                  For standalone deployment, simply point a CNAME record to our servers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-slate-300">
{`# DNS Configuration Example
referrals.yourbar.org.  CNAME  portal.lawyerreferralprogram.com.`}
                  </pre>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Our team will guide you through the DNS setup process and handle SSL certificate provisioning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Infrastructure */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Enterprise-Grade Infrastructure</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Focus on your program — we handle the technology
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {infrastructureFeatures.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mx-auto mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our team will help you choose the right deployment option and guide you through setup
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button variant="hero" size="xl">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button variant="outline" size="lg">
                Try the Demo First
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
