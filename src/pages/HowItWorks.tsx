import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Search, 
  Calendar, 
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
      description:
        "Browse our verified caregivers by specialty, location, and availability. Read reviews and compare profiles.",
      image:
        "find_caregiver.png",
      details: [
        "Search by medical specialty",
        "Filter by location & availability",
        "View caregiver credentials",
        "Read patient reviews"
      ]
    },
    {
      icon: Calendar,
      title: "Book Appointment",
      description:
        "Schedule your care session at your convenience. Choose between in-person visits or teleconference sessions.",
      image:"book_appointment.png",
      details: [
        "Flexible scheduling",
        "In-person or virtual care",
        "Instant confirmation",
        "Automated reminders"
      ]
    },
    {
      icon: Users,
      title: "Receive Care",
      description:
        "Connect with your caregiver for professional healthcare services in the comfort of your home.",
      image:
        "https://images.pexels.com/photos/7551667/pexels-photo-7551667.jpeg",
      details: [
        "Professional home care",
        "Patient-centered support",
        "Real-time assistance",
        "Emergency care available"
      ]
    },
    {
      icon: FileText,
      title: "Get Care Report",
      description:
        "Receive detailed reports after each session with observations, recommendations, and next steps.",
      image:
        "care_report.png",
      details: [
        "Session summaries",
        "Health updates",
        "Care recommendations",
        "Progress tracking"
      ]
    },
    {
      icon: CreditCard,
      title: "Secure Payment",
      description:
        "Pay securely through our platform with multiple payment options including mobile money.",
      image:
        "payment.png",
      details: [
        "Mobile money support",
        "Card & wallet payments",
        "Secure transactions",
        "Digital receipts"
      ]
    }
  ];

  const benefits = [
    {
      icon: Users,
      title: "Verified Caregivers",
      description:
        "All our caregivers are professionally verified and background-checked for your safety."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description:
        "Your health data is protected with end-to-end encryption and strict privacy standards."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description:
        "Our support team is available around the clock to assist you."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How CareConnect Works - Book Home Healthcare Services in 3 Easy Steps</title>
        <meta name="description" content="Easy 3-step process: Find a caregiver in your region, book appointment, receive quality care at home. Secure payments, verified professionals, quality home healthcare across all Malawi regions." />
        <meta name="keywords" content="book healthcare Malawi, how to book caregiver, home healthcare booking, find caregiver near me, healthcare appointment booking" />
      </Helmet>
      <Header />

      <main>
        {/* Hero Section */}
        <section 
          className="py-16 lg:py-20 relative bg-cover bg-no-repeat rounded-b-3xl overflow-hidden"
          style={{ backgroundImage: 'url(/how_it_works.png)', backgroundPosition: '0 45%' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  How CareConnect <span className="text-primary">Works</span>
                </h1>
                <p className="text-lg text-white/90 mb-6">
                  Quality healthcare at home through a simple and trusted process.
                </p>
              </div>
              <div className="text-center lg:text-right">
                <Link to="/register">
                  <Button size="lg" className="gap-2 bg-gradient-primary">
                    Get Started Today <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 lg:py-24">
          <div className="container space-y-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                {/* Text */}
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
                        <CheckCircle className="h-5 w-5 text-success" />
                        <span className="text-muted-foreground">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                <div className="flex-1">
                  <Card className="overflow-hidden shadow-md">
                    <CardContent className="p-0">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-full h-72 object-cover"
                        loading="lazy"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Choose CareConnect?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
              Built for trust, safety, and convenience.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-8">
                  <CardContent className="p-0 text-center">
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
      </main>

      <Footer />
    </div>
  );
};

export default HowItWorks;
