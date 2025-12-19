import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Baby, 
  Users, 
  Brain, 
  Activity, 
  Stethoscope,
  Pill,
  Shield,
  ArrowRight,
  Star,
  Clock,
  CheckCircle
} from "lucide-react";

const Specialties = () => {
  const specialties = [
    {
      icon: Stethoscope,
      title: "General Care",
      description: "Comprehensive healthcare services for routine check-ups, health monitoring, and general medical care.",
      services: ["Health assessments", "Vital signs monitoring", "Medication management", "Wound care"],
      caregivers: 45,
      rating: 4.9,
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Elderly Care",
      description: "Specialized care for seniors focusing on comfort, dignity, and maintaining independence at home.",
      services: ["Daily living assistance", "Mobility support", "Companionship", "Safety monitoring"],
      caregivers: 32,
      rating: 4.8,
      color: "from-green-500 to-green-600"
    },
    {
      icon: Baby,
      title: "Pediatric Care",
      description: "Expert healthcare services for children and adolescents with gentle, child-friendly approaches.",
      services: ["Child health monitoring", "Vaccination support", "Growth tracking", "Developmental care"],
      caregivers: 28,
      rating: 4.9,
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: Brain,
      title: "Mental Health",
      description: "Professional mental health support and counseling services in a comfortable home environment.",
      services: ["Counseling sessions", "Stress management", "Anxiety support", "Behavioral therapy"],
      caregivers: 18,
      rating: 4.7,
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Activity,
      title: "Physical Therapy",
      description: "Rehabilitation and physical therapy services to help restore mobility and reduce pain.",
      services: ["Mobility exercises", "Pain management", "Injury rehabilitation", "Strength training"],
      caregivers: 22,
      rating: 4.8,
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Heart,
      title: "Nursing Care",
      description: "Professional nursing services including medical procedures and clinical care management.",
      services: ["Medical procedures", "IV therapy", "Post-surgery care", "Chronic disease management"],
      caregivers: 38,
      rating: 4.9,
      color: "from-red-500 to-red-600"
    },
    {
      icon: Pill,
      title: "Medication Management",
      description: "Expert medication administration and management to ensure proper treatment compliance.",
      services: ["Medication reminders", "Dosage management", "Drug interaction monitoring", "Prescription coordination"],
      caregivers: 25,
      rating: 4.8,
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Post-operative Care",
      description: "Specialized care for patients recovering from surgery, ensuring safe and comfortable healing.",
      services: ["Wound monitoring", "Pain management", "Recovery exercises", "Complication prevention"],
      caregivers: 20,
      rating: 4.9,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  const benefits = [
    "All caregivers are professionally verified and licensed",
    "Personalized care plans tailored to your specific needs",
    "24/7 emergency support and monitoring available",
    "Comprehensive care reports after each session",
    "Flexible scheduling to fit your lifestyle",
    "Secure and confidential healthcare delivery"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-8 lg:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                Healthcare <span className="text-primary">Specialties</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Our network of verified healthcare professionals covers a wide range of medical specialties, 
                ensuring you receive expert care tailored to your specific health needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="gap-2 bg-gradient-primary">
                    Find a Caregiver <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="gap-2">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Specialties Grid */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {specialties.map((specialty, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-4">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${specialty.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <specialty.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="font-display text-xl mb-2">
                      {specialty.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{specialty.caregivers} caregivers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{specialty.rating}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {specialty.description}
                    </p>
                    <div className="space-y-2 mb-6">
                      {specialty.services.map((service, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                          <span className="text-muted-foreground">{service}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/register">
                      <Button className="w-full" variant="outline">
                        Find Caregivers
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Why Choose Our Specialized Care?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our healthcare professionals are not just qualified—they're specialists in their fields, 
                  ensuring you receive the most appropriate and effective care for your specific condition.
                </p>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">250+</div>
                    <div className="text-sm text-muted-foreground">Verified Caregivers</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">4.9</div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                    <div className="text-sm text-muted-foreground">Support Available</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">8</div>
                    <div className="text-sm text-muted-foreground">Medical Specialties</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <Card className="p-8 lg:p-16 bg-gradient-primary text-primary-foreground text-center">
              <CardContent className="p-0">
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  Ready to Find Your Specialist?
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Connect with qualified healthcare professionals in your area. 
                  Get the specialized care you deserve, delivered with compassion and expertise.
                </p>
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="gap-2">
                    Get Started Today <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Specialties;