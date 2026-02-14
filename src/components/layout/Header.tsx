import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Heart, Phone } from "lucide-react";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/specialties", label: "Specialties" },
    { href: "/caregivers", label: "Find Caregivers" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Bar */}
      <div className="w-full bg-slate-800 text-white/80 text-xs py-2">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>🏠 Quality Home Healthcare Services</span>
            <span>📞 +265 1 234 567</span>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span>🕒 Mon-Fri: 8AM-6PM</span>
            <span>📍 Serving All Regions of Malawi</span>
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95 shadow-lg">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/careconnectlogo.png" alt="CareConnect" className="h-12 w-12 rounded-xl" />
          <span className="font-display text-xl font-bold text-white">
            Care<span className="text-white">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive(link.href)
                  ? "text-white bg-slate-700 shadow-inner"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-2 text-white hover:bg-white/10">
            <Phone className="h-4 w-4" />
            <span className="text-sm">1-800-CARE</span>
          </Button>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-white/30 hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="sm" className="border-white/30 hover:bg-white/10">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col gap-6 mt-6">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    </>
  );
};

export default Header;
