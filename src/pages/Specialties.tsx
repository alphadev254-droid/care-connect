import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
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
  CheckCircle,
  Eye,
  Bone,
  Loader2
} from "lucide-react";

const iconMap: Record<string, any> = {
  "Nursing Care": Stethoscope,
  "Geriatric Care": Heart,
  "Pediatric Care": Baby,
  "Physiotherapy": Activity,
  "Mental Health": Brain,
  "Palliative Care": Pill,
  "Vision Care": Eye,
  "Orthopedic Care": Bone,
  "General Care": Stethoscope,
  "Elderly Care": Users,
  "Physical Therapy": Activity,
  "Medication Management": Pill,
  "Post-operative Care": Shield
};

const Specialties = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const { data: specialtiesData, isLoading } = useQuery({
    queryKey: ["specialties-page"],
    queryFn: async () => {
      const response = await api.get("/public/specialties");
      return response.data || {};
    },
  });

  const specialties = specialtiesData?.specialties || [];
  const stats = specialtiesData?.stats || { totalCaregivers: 0, averageRating: '4.9' };

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
        <section 
          className="py-8 lg:py-12 relative bg-cover bg-no-repeat rounded-b-3xl overflow-hidden"
          style={{ backgroundImage: 'url(/specialities.png)', backgroundPosition: '0 45%' }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-white">
                  Healthcare <span className="text-primary">Specialties</span>
                </h1>
                <p className="text-lg text-white/90 mb-6">
                  Our network of verified healthcare professionals provides supportive care services 
                  to assist with daily health needs. Our caregivers focus on support, monitoring, 
                  and assistance - not medical treatment. All patients must have a physician for 
                  medical diagnosis and treatment.
                </p>
              </div>
              <div className="text-center lg:text-right">
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
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
          </div>
        </section>

        {/* Specialties Grid */}
        <section className="py-16 lg:py-24">
          <div className="container">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {specialties.map((specialty: any) => {
                  const IconComponent = iconMap[specialty.name] || Stethoscope;
                  const isExpanded = expandedId === specialty.id;
                  return (
                    <Card key={specialty.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <CardTitle className="font-display text-xl mb-2">
                          {specialty.name}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{specialty.caregiverCount || 0} caregivers</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col">
                        <p className={`text-muted-foreground mb-2 text-sm flex-grow ${isExpanded ? '' : 'line-clamp-4'}`}>
                          {specialty.description}
                        </p>
                        {specialty.description && specialty.description.length > 100 && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : specialty.id)}
                            className="text-xs text-primary hover:text-primary/80 mb-4 text-left"
                          >
                            {isExpanded ? 'Read less' : 'Read more'}
                          </button>
                        )}
                        <Link to={`/caregivers?specialty=${specialty.name.toLowerCase().replace(" ", "-")}`} className="mt-auto">
                          <Button className="w-full" variant="outline">
                            Find Caregivers
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
                    <div className="text-3xl font-bold text-primary mb-2">{stats.totalCaregivers}+</div>
                    <div className="text-sm text-muted-foreground">Verified Caregivers</div>
                  </CardContent>
                </Card>
                <Card className="p-6 text-center">
                  <CardContent className="p-0">
                    <div className="text-3xl font-bold text-primary mb-2">{stats.averageRating}</div>
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
                    <div className="text-3xl font-bold text-primary mb-2">{specialties.length}</div>
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
            <Card className="p-8 lg:p-16 bg-white border border-slate-200 shadow-lg">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                      Ready to Find Your Specialist?
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      Connect with qualified healthcare professionals in your area. 
                      Get the specialized care you deserve, delivered with compassion and expertise.
                    </p>
                  </div>
                  <div className="text-center lg:text-right">
                    <Link to="/register">
                      <Button size="lg" className="gap-2 bg-primary text-white hover:bg-primary/90 px-8 py-3">
                        Get Started Today <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
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

export default Specialties;