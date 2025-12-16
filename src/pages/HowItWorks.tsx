import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Search, 
  Calendar, 
  Video, 
  FileText, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  Users,
  Shield,
  Clock
} from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: "Find Your Caregiver",
      description: "Browse our verified caregivers by specialty, location, and availability. Read reviews and compare profiles.",
      details: ["Search by medical specialty", "Filter by location & availability", "View caregiver credentials", "Read patient reviews"]
    },
    {
      icon: Calendar,
      title: "Book Appointment",
      description: "Schedule your care session at your convenience. Choose between in-person visits or teleconference sessions.",
      details: ["Flexible scheduling", "In-person or virtual care", "Instant confirmation", "Automated reminders"]
    },
    {
      icon: Video,
      title: "Receive Care",
      description: "Connect with your caregiver for professional healthcare services in the comfort of your home.",
      details: ["Professional care delivery", "Secure video consultations", "Real-time health monitoring", "Emergency support available"]
    },
    {
      icon: FileText,
      title: "Get Care Report",
      description: "Receive detailed reports after each session with observations, recommendations, and next steps.",
      details: ["Comprehensive care reports", "Health status updates", "Treatment recommendations", "Progress tracking"]
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description: "Pay securely through our platform with multiple payment options including mobile money.",
      details: ["Multiple payment methods", "Secure transactions", "Transparent pricing", "Digital receipts"]
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: "Verified Caregivers",
      description: "All our caregivers are professionally verified and background-checked for your safety."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your health data is protected with end-to-end encryption and HIPAA compliance."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our support team is available round the clock to assist you with any concerns."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                How CareConnect <span className="text-primary">Works</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Getting quality healthcare at home is simple with our 5-step process. 
                From finding the right caregiver to receiving comprehensive care reports.
              </p>
              <Link to="/register">
                <Button size="lg" className="gap-2 bg-gradient-primary">
                  Get Started Today <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                        <step.icon className="h-8 w-8 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">
                          Step {index + 1}
                        </div>
                        <h3 className="font-display text-2xl font-bold">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                      {step.description}
                    </p>
                    <ul className="space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                          <span className="text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1">
                    <Card className="p-8 bg-gradient-to-br from-muted/50 to-muted/20">
                      <CardContent className="p-0">
                        <div className="aspect-video bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center">
                          <step.icon className="h-24 w-24 text-primary/60" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Why Choose CareConnect?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing the highest quality healthcare experience 
                with safety, security, and convenience at the forefront.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-8">
                  <CardContent className="p-0">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                      <benefit.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <Card className="p-8 lg:p-16 bg-gradient-primary text-primary-foreground text-center">
              <CardContent className="p-0">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Join thousands of patients who trust CareConnect for their healthcare needs. 
                  Sign up today and experience quality care at home.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" variant="secondary" className="gap-2">
                      Create Account <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/caregivers">
                    <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      Browse Caregivers
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;