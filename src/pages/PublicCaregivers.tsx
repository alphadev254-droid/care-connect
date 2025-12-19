import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Clock, DollarSign, LogIn, MapPin, Award, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { BookingModal } from "@/components/booking/BookingModal";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const PublicCaregivers = () => {
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingModal, setBookingModal] = useState({ open: false, caregiver: null });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const response = await api.get('/public/caregivers');
      setCaregivers(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load caregivers");
    } finally {
      setLoading(false);
    }
  };

  const filteredCaregivers = caregivers.filter((caregiver: any) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${caregiver.firstName} ${caregiver.lastName}`.toLowerCase();
    const qualifications = caregiver.qualifications?.toLowerCase() || '';
    const specialties = caregiver.specialties?.map((s: any) => s.name.toLowerCase()).join(' ') || '';
    const location = `${caregiver.region || ''} ${caregiver.district || ''} ${caregiver.village || ''}`.toLowerCase();

    return fullName.includes(searchLower) ||
           qualifications.includes(searchLower) ||
           specialties.includes(searchLower) ||
           location.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-primary flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Our Verified Caregivers
          </h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Meet our team of qualified healthcare professionals ready to provide exceptional home care services
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Caregivers Grid */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No caregivers found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "No verified caregivers available at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCaregivers.map((caregiver: any) => (
                <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      {caregiver.profileImage ? (
                        <img
                          src={caregiver.profileImage}
                          alt={`${caregiver.firstName} ${caregiver.lastName}`}
                          className="h-20 w-20 rounded-full object-cover mx-auto mb-4"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                          {caregiver.firstName?.charAt(0)}{caregiver.lastName?.charAt(0)}
                        </div>
                      )}

                      <h3 className="font-semibold text-lg mb-1">
                        {caregiver.firstName} {caregiver.lastName}
                      </h3>

                      <p className="text-muted-foreground text-sm mb-2">
                        {caregiver.qualifications || "Healthcare Professional"}
                      </p>

                      {caregiver.specialties && caregiver.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mb-3">
                          {caregiver.specialties.slice(0, 3).map((specialty: any) => (
                            <Badge key={specialty.id} variant="outline" className="text-xs">
                              {specialty.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {caregiver.bio && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 text-center">
                        {caregiver.bio}
                      </p>
                    )}

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{caregiver.experience || 0} years experience</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>MWK {caregiver.hourlyRate || 50000}/hour</span>
                      </div>

                      {(caregiver.region || caregiver.district || caregiver.village) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">
                            {[caregiver.village, caregiver.district, caregiver.region]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <Badge variant="secondary" className="text-xs w-full justify-center">
                        <Award className="h-3 w-3 mr-1" />
                        Verified Professional
                      </Badge>
                      {isAuthenticated ? (
                        <Button
                          className="w-full"
                          size="sm"
                          onClick={() => setBookingModal({ open: true, caregiver })}
                        >
                          Book Now
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          size="sm"
                          variant="outline"
                          onClick={() => navigate('/login')}
                        >
                          <LogIn className="h-4 w-4 mr-2" />
                          Login to Book
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 py-16">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of patients who trust CareConnect for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary">
              Find Your Caregiver
            </Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {bookingModal.caregiver && isAuthenticated && (
        <BookingModal
          open={bookingModal.open}
          onClose={() => setBookingModal({ open: false, caregiver: null })}
          caregiverId={bookingModal.caregiver.id}
          caregiverName={`${bookingModal.caregiver.firstName} ${bookingModal.caregiver.lastName}`}
          specialtyId={1}
        />
      )}
    </div>
  );
};

export default PublicCaregivers;