import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEO } from "@/components/SEO";
import { BreadcrumbSchema, WebPageSchema } from "@/components/StructuredData";
import { Mail, Phone, MapPin, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 1-2 business days.",
    });
  };

  return (
    <div className="flex flex-col">
      <SEO
        title="Contact Us"
        description="Get in touch to schedule a demo, request pricing, or ask questions about modernizing your lawyer referral program."
        canonical="/contact"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" }
        ]}
      />
      <WebPageSchema
        name="Contact Lawyer Referral Program"
        description="Get in touch to schedule a demo or ask questions about lawyer referral software"
        speakableSelectors={[".voice-contact-intro"]}
      />
      
      {/* Hero */}
      <section className="hero-gradient py-16 lg:py-24">
        <div className="section-container text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Let's discuss how we can help modernize your referral program
          </p>
        </div>
      </section>

      {/* Voice-Optimized Contact Intro */}
      <section className="py-12 bg-muted/30 voice-contact-intro">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-foreground leading-relaxed">
              <strong>How do I get started with Lawyer Referral Program?</strong> Contact us to schedule a personalized demo. We'll show you how the platform works and discuss your organization's specific needs. Email us at hello@lawyerreferralprogram.com or call (555) 123-4567. Most demos take about 30 minutes and include a Q&A session.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 1-2 business days
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success mx-auto mb-4">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold">Thank You!</h3>
                    <p className="mt-2 text-muted-foreground">
                      We've received your message and will be in touch soon.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" required placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" required placeholder="Smith" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" required placeholder="john@example.org" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization *</Label>
                      <Input id="organization" required placeholder="County Bar Association" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Your Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executive Director</SelectItem>
                          <SelectItem value="coordinator">Referral Coordinator</SelectItem>
                          <SelectItem value="it">IT / Technology</SelectItem>
                          <SelectItem value="board">Board Member</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="interest">I'm interested in...</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="demo">Scheduling a demo</SelectItem>
                          <SelectItem value="pricing">Pricing information</SelectItem>
                          <SelectItem value="technical">Technical questions</SelectItem>
                          <SelectItem value="partnership">Partnership opportunities</SelectItem>
                          <SelectItem value="other">Something else</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea 
                        id="message" 
                        required 
                        placeholder="Tell us about your referral program and what you're looking for..."
                        rows={4}
                      />
                    </div>
                    
                    <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      This is a demonstration form. In production, messages would be sent to our team.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact Info & Calendar */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">joe@bizooma.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">904-295-6670</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-muted-foreground">
                        123 Legal Tech Way<br />
                        Suite 400<br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule a Demo
                  </CardTitle>
                  <CardDescription>
                    Book a time to see the platform in action
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Calendar embed placeholder</p>
                      <p className="text-xs text-muted-foreground/60">Calendly or similar widget would appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
