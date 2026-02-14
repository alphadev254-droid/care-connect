import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import {
  Stethoscope,
  Brain,
  Baby,
  Activity,
  Heart,
  Pill,
  Eye,
  Bone,
  ArrowRight,
  Loader2,
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
};

const SpecialtiesSection = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const { data: specialtiesData, isLoading } = useQuery({
    queryKey: ["specialties-with-counts"],
    queryFn: async () => {
      const response = await api.get("/public/specialties");
      return response.data.specialties || [];
    },
  });

  const specialties = specialtiesData || [];

  return (
    <section className="py-16 bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Healthcare Specialties
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our network of qualified caregivers covers a wide range of medical specialties to meet your specific healthcare needs.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Specialties Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {specialties.map((specialty: any) => {
                const IconComponent = iconMap[specialty.name] || Stethoscope;
                const isExpanded = expandedId === specialty.id;
                return (
                  <div key={specialty.id} className="h-full">
                    <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-blue-500 hover:bg-white hover:border-blue-600 hover:shadow-md transition-all duration-200 h-full flex flex-col">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {specialty.name}
                      </h3>
                      <p className={`text-sm text-gray-600 mb-2 leading-relaxed flex-grow ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {specialty.description}
                      </p>
                      
                      {specialty.description && specialty.description.length > 100 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setExpandedId(isExpanded ? null : specialty.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 mb-4 text-left"
                        >
                          {isExpanded ? 'Read less' : 'Read more'}
                        </button>
                      )}

                      {/* Caregiver Count */}
                      <Link
                        to={`/caregivers?specialty=${specialty.name.toLowerCase().replace(" ", "-")}`}
                        className="flex items-center justify-between mt-auto group"
                      >
                        <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                          {specialty.caregiverCount || 0} caregivers available
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Link to="/specialties">
                <Button variant="outline" className="gap-2 border-blue-500 text-blue-600 hover:bg-blue-50">
                  View All Specialties
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SpecialtiesSection;
