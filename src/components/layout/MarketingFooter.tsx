import { Link } from "react-router-dom";
import { Scale, Mail, Phone } from "lucide-react";

const footerLinks = {
  product: [
    { href: "/how-it-works", label: "How It Works" },
    { href: "/features", label: "Features" },
    { href: "/deployment", label: "Deployment" },
    { href: "/pricing", label: "Pricing" },
  ],
  resources: [
    { href: "/ethics", label: "Ethics & Compliance" },
    { href: "#", label: "Documentation" },
    { href: "#", label: "API Reference" },
    { href: "#", label: "Help Center" },
  ],
  company: [
    { href: "/contact", label: "Contact" },
    { href: "#", label: "About Us" },
    { href: "#", label: "Careers" },
    { href: "#", label: "Press" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <Scale className="h-6 w-6 text-primary" />
              <span>Lawyer Referral Program</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Modern lawyer referral infrastructure for bar associations.
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>joe@bizooma.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>904-295-6670</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Product
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lawyer Referral Program™. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="hover:text-primary transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground text-center">
            This platform is not a law firm and does not provide legal advice. The Lawyer Referral Program 
            is a service that connects individuals with licensed attorneys. Attorney participation is 
            subject to bar association eligibility requirements.
          </p>
        </div>
      </div>
    </footer>
  );
}
