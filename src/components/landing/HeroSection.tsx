import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Shield, Clock, Users, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <Badge variant="secondary" className="gap-2 px-4 py-2 bg-primary/10 text-primary border-primary/20">
              <Shield className="h-4 w-4" />
              Trusted by 10,000+ Families
            </Badge>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Quality Home Care,{" "}
              <span className="text-gradient">Right at Your Doorstep</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Connect with verified, compassionate caregivers who provide personalized 
              healthcare services in the comfort of your home. From nursing care to 
              physiotherapy, we've got you covered.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2 bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/25">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="gap-2">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-bold"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">500+</p>
                  <p className="text-muted-foreground">Verified Caregivers</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-accent">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <div className="text-sm">
                  <p className="font-semibold">4.9/5</p>
                  <p className="text-muted-foreground">Patient Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative animate-float">
              {/* Main Card */}
              <div className="bg-card rounded-3xl shadow-xl p-8 border">
                <div className="aspect-square rounded-2xl bg-gradient-primary/10 flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="h-24 w-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold">Find Your Caregiver</h3>
                    <p className="text-muted-foreground text-sm">
                      Browse verified professionals matching your healthcare needs
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-card rounded-2xl shadow-lg p-4 border animate-pulse-soft">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Verified & Licensed</p>
                    <p className="text-xs text-muted-foreground">100% Background Checked</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-card rounded-2xl shadow-lg p-4 border">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">24/7 Available</p>
                    <p className="text-xs text-muted-foreground">Round-the-clock care</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
