import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Heart,
  DollarSign,
  X,
} from "lucide-react";

const Caregivers = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedTA, setSelectedTA] = useState("all");
  const [selectedVillage, setSelectedVillage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bookingModal, setBookingModal] = useState({ open: false, caregiver: null });

  const { data: caregiversData, isLoading } = useQuery({
    queryKey: ["caregivers"],
    queryFn: async () => {
      const response = await api.get("/public/caregivers");
      return response.data.caregivers || [];
    },
  });

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

  const caregivers = Array.isArray(caregiversData) ? caregiversData : [];
  const specialties = Array.isArray(specialtiesData) ? specialtiesData : [];

  // Extract unique location values from caregivers
  const regions = ['all', ...new Set(caregivers.map((c: any) => c.Caregiver?.region).filter(Boolean))];
  const districts = ['all', ...new Set(caregivers
    .filter((c: any) => selectedRegion === 'all' || c.Caregiver?.region === selectedRegion)
    .map((c: any) => c.Caregiver?.district).filter(Boolean))];
  const tas = ['all', ...new Set(caregivers
    .filter((c: any) =>
      (selectedRegion === 'all' || c.Caregiver?.region === selectedRegion) &&
      (selectedDistrict === 'all' || c.Caregiver?.district === selectedDistrict)
    )
    .map((c: any) => c.Caregiver?.traditionalAuthority).filter(Boolean))];
  const villages = ['all', ...new Set(caregivers
    .filter((c: any) =>
      (selectedRegion === 'all' || c.Caregiver?.region === selectedRegion) &&
      (selectedDistrict === 'all' || c.Caregiver?.district === selectedDistrict) &&
      (selectedTA === 'all' || c.Caregiver?.traditionalAuthority === selectedTA)
    )
    .map((c: any) => c.Caregiver?.village).filter(Boolean))];

  const filteredCaregivers = caregivers.filter((caregiver: any) => {
    const name = `${caregiver.firstName || ''} ${caregiver.lastName || ''}`.trim();
    const caregiverData = caregiver.Caregiver || {};

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caregiverData.qualifications?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caregiverData.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caregiverData.district?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialty = selectedSpecialty === 'all' ||
      caregiverData.Specialties?.some((s: any) => s.id.toString() === selectedSpecialty);

    const matchesRegion = selectedRegion === 'all' || caregiverData.region === selectedRegion;
    const matchesDistrict = selectedDistrict === 'all' || caregiverData.district === selectedDistrict;
    const matchesTA = selectedTA === 'all' || caregiverData.traditionalAuthority === selectedTA;
    const matchesVillage = selectedVillage === 'all' || caregiverData.village === selectedVillage;

    return matchesSearch && matchesSpecialty && matchesRegion && matchesDistrict && matchesTA && matchesVillage;
  });

  const clearFilters = () => {
    setSelectedSpecialty("all");
    setSelectedRegion("all");
    setSelectedDistrict("all");
    setSelectedTA("all");
    setSelectedVillage("all");
    setSearchQuery("");
  };

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
        {/* Header - Compact */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Find Caregivers
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Browse verified healthcare professionals
          </p>
        </div>

        {/* Search and Filters - Compact */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, specialty, or location..."
              className="pl-10 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 lg:hidden h-9"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Filters Sidebar - Compact */}
          <Card className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label className="text-xs font-semibold mb-2 block">Specialty</Label>
                <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty: any) => (
                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-2 block">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region: string) => (
                      <SelectItem key={region} value={region}>
                        {region === 'all' ? 'All Regions' : region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-2 block">District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district: string) => (
                      <SelectItem key={district} value={district}>
                        {district === 'all' ? 'All Districts' : district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-2 block">Traditional Authority</Label>
                <Select value={selectedTA} onValueChange={setSelectedTA}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All TAs" />
                  </SelectTrigger>
                  <SelectContent>
                    {tas.map((ta: string) => (
                      <SelectItem key={ta} value={ta}>
                        {ta === 'all' ? 'All TAs' : ta}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold mb-2 block">Village</Label>
                <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="All Villages" />
                  </SelectTrigger>
                  <SelectContent>
                    {villages.map((village: string) => (
                      <SelectItem key={village} value={village}>
                        {village === 'all' ? 'All Villages' : village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-9"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Caregivers Grid - Compact & Professional */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredCaregivers.length} caregiver{filteredCaregivers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {filteredCaregivers.map((caregiver: any) => {
                const caregiverData = caregiver.Caregiver || {};
                const name = `${caregiver.firstName || ''} ${caregiver.lastName || ''}`.trim();
                const location = [
                  caregiverData.village,
                  caregiverData.traditionalAuthority,
                  caregiverData.district,
                  caregiverData.region
                ].filter(Boolean).join(', ') || 'Location not specified';

                return (
                  <Card key={caregiver.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold flex-shrink-0">
                          {name.charAt(0) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm truncate">{name}</h3>
                            {caregiverData.verificationStatus === 'verified' && (
                              <Shield className="h-3 w-3 text-success flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {caregiverData.qualifications || 'Healthcare Professional'}
                          </p>
                          <Badge
                            variant={caregiverData.verificationStatus === 'verified' ? 'default' : 'secondary'}
                            className="mt-1 text-xs h-5"
                          >
                            {caregiverData.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span>{caregiverData.experience || '0'} years experience</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                      </div>

                      {/* Specialties with Fees */}
                      {caregiverData.Specialties && caregiverData.Specialties.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {caregiverData.Specialties.slice(0, 2).map((specialty: any) => (
                            <div key={specialty.id} className="p-2 rounded-md border bg-muted/30">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium">{specialty.name}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Session:</span>
                                  <span className="font-semibold text-primary ml-1">
                                    MWK {specialty.sessionFee ? Number(specialty.sessionFee).toFixed(0) : '0'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Booking:</span>
                                  <span className="font-semibold text-secondary ml-1">
                                    MWK {specialty.bookingFee ? Number(specialty.bookingFee).toFixed(0) : '0'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          {caregiverData.Specialties.length > 2 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{caregiverData.Specialties.length - 2} more specialt{caregiverData.Specialties.length - 2 === 1 ? 'y' : 'ies'}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 pt-3 border-t">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 gap-1 h-8 text-xs"
                          onClick={() => setBookingModal({ open: true, caregiver })}
                        >
                          <Calendar className="h-3 w-3" />
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredCaregivers.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Heart className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-1">No caregivers found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your filters to see more results
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {bookingModal.caregiver && (
        <BookingModal
          open={bookingModal.open}
          onClose={() => setBookingModal({ open: false, caregiver: null })}
          caregiverId={bookingModal.caregiver.Caregiver.id}
          caregiverName={`${bookingModal.caregiver.firstName || ''} ${bookingModal.caregiver.lastName || ''}`.trim() || 'Caregiver'}
          specialtyId={bookingModal.caregiver.Caregiver?.Specialties?.[0]?.id || 1}
        />
      )}
    </DashboardLayout>
  );
};

export default Caregivers;
