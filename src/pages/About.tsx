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

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      description: "15+ years in healthcare administration and patient care coordination.",
      image: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Head of Technology",
      description: "Expert in healthcare technology and secure patient data management.",
      image: "MC"
    },
    {
      name: "Dr. Amina Hassan",
      role: "Quality Assurance Director",
      description: "Specialist in healthcare quality standards and caregiver certification.",
      image: "AH"
    },
    {
      name: "James Wilson",
      role: "Patient Experience Manager",
      description: "Dedicated to ensuring exceptional patient satisfaction and care outcomes.",
      image: "JW"
    }
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
        <section className="py-8 lg:py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                  About <span className="text-primary">CareConnect</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
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
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <CardContent className="p-0 text-center">
                    <Heart className="h-24 w-24 text-primary mx-auto mb-6" />
                    <h3 className="font-display text-2xl font-bold mb-4">Our Mission</h3>
                    <p className="text-muted-foreground">
                      To make quality supportive healthcare accessible, affordable, and convenient for every 
                      person in Malawi through innovative home-based care solutions that complement 
                      physician-provided medical care.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <stat.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.number}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
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
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From a simple idea to transforming healthcare delivery across Malawi.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-8 items-start">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    <Card className="flex-1 p-6">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-medium text-primary">{milestone.year}</span>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </div>
                        <h3 className="font-display text-xl font-bold mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Dedicated professionals working tirelessly to improve healthcare 
                accessibility and quality in Malawi.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center p-6">
                  <CardContent className="p-0">
                    <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                      {member.image}
                    </div>
                    <h3 className="font-display text-lg font-bold mb-1">
                      {member.name}
                    </h3>
                    <div className="text-primary text-sm font-medium mb-3">
                      {member.role}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {member.description}
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
                  Join the CareConnect Family
                </h2>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Whether you're seeking care or looking to provide care, 
                  we invite you to be part of our mission to transform healthcare in Malawi.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/register">
                    <Button size="lg" variant="secondary" className="gap-2">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button size="lg" variant="outline" className="gap-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                      Contact Us
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

export default About;