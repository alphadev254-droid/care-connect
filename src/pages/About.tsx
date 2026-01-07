import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Shield, 
  Users, 
  Award,
  Target,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Clock
} from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description: "We believe supportive healthcare should be delivered with empathy, understanding, and genuine care for every patient's wellbeing."
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Patient safety is our top priority. All our caregivers are thoroughly vetted, verified, and continuously monitored."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Quality supportive healthcare should be accessible to everyone, regardless of location, mobility, or economic circumstances."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards of supportive care through continuous training and quality assurance programs."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Patients Served", icon: Users },
    { number: "250+", label: "Verified Caregivers", icon: Shield },
    { number: "4.9/5", label: "Average Rating", icon: Star },
    { number: "24/7", label: "Support Available", icon: Clock }
  ];

  const milestones = [
    {
      year: "2020",
      title: "CareConnect Founded",
      description: "Started with a vision to make quality healthcare accessible at home."
    },
    {
      year: "2021",
      title: "First 1,000 Patients",
      description: "Reached our first milestone of serving 1,000 patients across Malawi."
    },
    {
      year: "2022",
      title: "Telehealth Integration",
      description: "Launched secure video consultations and remote monitoring capabilities."
    },
    {
      year: "2023",
      title: "Mobile Money Integration",
      description: "Partnered with Paychangu to enable seamless mobile money payments."
    },
    {
      year: "2024",
      title: "10,000+ Patients",
      description: "Celebrating over 10,000 patients served with 250+ verified caregivers."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section 
          className="py-8 lg:py-12 relative bg-cover bg-top bg-no-repeat"
          style={{ backgroundImage: 'url(/mission.png)' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  About <span className="text-primary">CareConnect</span>
                </h1>
                <p className="text-lg text-white/90 mb-6">
                  We're revolutionizing healthcare delivery in Malawi by connecting patients 
                  with qualified caregivers for supportive, compassionate care in the comfort of home. 
                  Our caregivers provide assistance and monitoring services that complement your 
                  physician's medical care.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button size="lg" className="gap-2 bg-gradient-primary">
                      Join Our Community <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/how-it-works">
                    <Button size="lg" variant="outline" className="border-white  hover:bg-white hover:text-black">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                {/* Empty space or additional content */}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Core Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These principles guide everything we do and shape how we deliver 
                supportive healthcare services to our community in partnership with physicians.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center p-8 h-full">
                  <CardContent className="p-0">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6">
                      <value.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-4">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From a simple idea to transforming healthcare delivery across Malawi.
              </p>
            </div>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary/20 h-full"></div>
              
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                    {/* Content Card */}
                    <div className="flex-1">
                      <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl font-bold text-primary">{milestone.year}</span>
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <h3 className="font-display text-xl font-bold mb-3">
                            {milestone.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Timeline Node */}
                    <div className="flex-shrink-0 relative z-10">
                      <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    
                    {/* Spacer for alternating layout */}
                    <div className="flex-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <Card className="p-6 lg:p-12 bg-white border border-slate-200 shadow-2xl rounded-lg">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                      Ready to Transform Healthcare Together?
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Join thousands of patients and caregivers who are revolutionizing healthcare delivery in Malawi. 
                      Experience compassionate, professional care that brings quality healthcare to your doorstep.
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                      <Link to="/register">
                        <Button size="lg" className="gap-2 bg-primary text-white hover:bg-primary/90">
                          Get Started <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/caregivers">
                        <Button size="lg" variant="outline" className="gap-2">
                          Find Caregivers
                        </Button>
                      </Link>
                    </div>
                  </div>
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

export default About;