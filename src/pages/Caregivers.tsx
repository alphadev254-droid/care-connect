import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  Shield,
  ChevronDown,
  Heart,
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

const caregivers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Nursing Care",
    rating: 4.9,
    reviews: 127,
    experience: "8 years",
    location: "Downtown Medical",
    available: true,
    verified: true,
    price: 75,
    image: null,
  },
  {
    id: 2,
    name: "Michael Chen",
    specialty: "Physiotherapy",
    rating: 4.8,
    reviews: 89,
    experience: "6 years",
    location: "West Side Clinic",
    available: true,
    verified: true,
    price: 65,
    image: null,
  },
  {
    id: 3,
    name: "Grace Okonkwo",
    specialty: "Geriatric Care",
    rating: 4.9,
    reviews: 156,
    experience: "10 years",
    location: "Senior Care Center",
    available: false,
    verified: true,
    price: 80,
    image: null,
  },
  {
    id: 4,
    name: "David Martinez",
    specialty: "Mental Health",
    rating: 4.7,
    reviews: 64,
    experience: "5 years",
    location: "Mind Wellness Hub",
    available: true,
    verified: true,
    price: 70,
    image: null,
  },
  {
    id: 5,
    name: "Emily Thompson",
    specialty: "Pediatric Care",
    rating: 4.9,
    reviews: 112,
    experience: "7 years",
    location: "Children's Health Center",
    available: true,
    verified: true,
    price: 72,
    image: null,
  },
  {
    id: 6,
    name: "James Muthoni",
    specialty: "Palliative Care",
    rating: 4.8,
    reviews: 78,
    experience: "9 years",
    location: "Comfort Care Home",
    available: true,
    verified: true,
    price: 85,
    image: null,
  },
];

const Caregivers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredCaregivers = caregivers.filter((caregiver) => {
    const matchesSearch = caregiver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caregiver.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialties.length === 0 ||
      selectedSpecialties.includes(caregiver.specialty);
    const matchesPrice = caregiver.price >= priceRange[0] && caregiver.price <= priceRange[1];
    return matchesSearch && matchesSpecialty && matchesPrice;
  });

  return (
    <DashboardLayout userRole="patient">
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
                  <span>${priceRange[0]}/hr</span>
                  <span>${priceRange[1]}/hr</span>
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
                          {caregiver.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{caregiver.name}</h3>
                            {caregiver.verified && (
                              <Shield className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {caregiver.specialty}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-accent fill-current" />
                            <span className="text-sm font-medium">{caregiver.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({caregiver.reviews} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {caregiver.experience} experience
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {caregiver.location}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <span className="text-2xl font-bold">${caregiver.price}</span>
                        <span className="text-muted-foreground">/hr</span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/dashboard/caregivers/${caregiver.id}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <Button size="sm" className="gap-1" disabled={!caregiver.available}>
                          <Calendar className="h-4 w-4" />
                          Book
                        </Button>
                      </div>
                    </div>

                    {!caregiver.available && (
                      <Badge variant="secondary" className="mt-3">
                        Currently Unavailable
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Caregivers;
