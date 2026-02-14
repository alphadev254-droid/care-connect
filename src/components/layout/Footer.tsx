import { Link } from "react-router-dom";
import { Heart, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: "Find Caregivers", href: "/caregivers" },
      { label: "Book Appointment", href: "/dashboard" },
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Specialties", href: "/specialties" },
      { label: "How It Works", href: "/how-it-works" },
    ],
    legal: [
      { label: "Terms of Service", href: "/terms/patient/pdf", external: true },
    ],
  };

  const socialLinks = [];

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src="/careconnectlogo.png" alt="CareConnect" className="h-10 w-10 rounded-xl" />
              <span className="font-display text-xl font-bold">
                Care<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-white/80 mb-6 max-w-xs">
              Connecting patients with verified, compassionate caregivers for quality home healthcare services.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="h-4 w-4 text-primary" />
                <span>+265986227240</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@careconnect.com</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Healthcare Ave, Medical City</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/80 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${link.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.href}
                      className="text-white/80 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/20">
        <div className="container py-6">
          <p className="text-white/80 text-sm text-center">
            © {currentYear} CareConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
