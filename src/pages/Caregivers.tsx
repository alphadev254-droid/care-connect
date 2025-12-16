import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { BookingModal } from "@/components/booking/BookingModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Shield,
  ChevronDown,
  Calendar,
} from "lucide-react";

const specialties = [
  "Nursing Care",
  "Geriatric Care",
  "Pediatric Care",
  "Physiotherapy",
  "Mental Health",
  "Palliative Care",
];

const Caregivers = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, caregiver: null });

  const { data: caregiversData, isLoading } = useQuery({
    queryKey: ["caregivers"],
    queryFn: async () => {
      const response = await api.get("/caregivers?includeAvailability=true");
      return response.data.caregivers || [];
    },
  });

  const caregivers = Array.isArray(caregiversData) ? caregiversData : [];

  const filteredCaregivers = caregivers.filter((caregiver) => {
    const name = caregiver.name || caregiver.firstName + ' ' + caregiver.lastName || '';
    const specialty = caregiver.specialty || '';
    const price = caregiver.price || caregiver.hourlyRate || 0;
    
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialties.length === 0 ||
      selectedSpecialties.includes(specialty);
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Find Caregivers
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse verified healthcare professionals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-2 lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <Card className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Specialties</h3>
                <div className="space-y-3">
                  {specialties.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={selectedSpecialties.includes(specialty)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSpecialties([...selectedSpecialties, specialty]);
                          } else {
                            setSelectedSpecialties(
                              selectedSpecialties.filter((s) => s !== specialty)
                            );
                          }
                        }}
                      />
                      <Label htmlFor={specialty} className="cursor-pointer text-sm">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Price Range</h3>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={100}
                  step={5}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>MWK {priceRange[0] * 1000}/hr</span>
                  <span>MWK {priceRange[1] * 1000}/hr</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Availability</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="available" />
                    <Label htmlFor="available" className="cursor-pointer text-sm">
                      Available Now
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="verified" defaultChecked />
                    <Label htmlFor="verified" className="cursor-pointer text-sm">
                      Verified Only
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSelectedSpecialties([]);
                  setPriceRange([0, 100]);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Caregivers Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-muted-foreground">
                {filteredCaregivers.length} caregivers found
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {filteredCaregivers.map((caregiver) => (
                <Card key={caregiver.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                          {(caregiver.name || caregiver.firstName || 'C').charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{caregiver.name || `${caregiver.firstName || ''} ${caregiver.lastName || ''}`.trim() || 'Caregiver'}</h3>
                            {caregiver.verified && (
                              <Shield className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {caregiver.specialty || 'General Care'}
                          </p>
                          <div className="mt-2">
                            {caregiver.hasAvailableSlots ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Available
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                No slots available
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {caregiver.experience || '0'} years experience
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {caregiver.location || 'Location not specified'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold">MWK {caregiver.price || caregiver.hourlyRate || '50000'}</span>
                        <span className="text-muted-foreground">/hr</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-1" 
                          onClick={() => setBookingModal({ open: true, caregiver })}
                        >
                          <Calendar className="h-4 w-4" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {bookingModal.caregiver && (
        <BookingModal
          open={bookingModal.open}
          onClose={() => setBookingModal({ open: false, caregiver: null })}
          caregiverId={bookingModal.caregiver.id}
          caregiverName={bookingModal.caregiver.name || `${bookingModal.caregiver.firstName || ''} ${bookingModal.caregiver.lastName || ''}`.trim() || 'Caregiver'}
          specialtyId={1}
        />
      )}
    </DashboardLayout>
  );
};

export default Caregivers;
