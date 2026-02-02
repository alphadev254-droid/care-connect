import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

const specialties = [
  {
    icon: Stethoscope,
    name: "Nursing Care",
    description: "Professional nursing services including wound care, medication management, and health monitoring.",
    caregivers: 120,
  },
  {
    icon: Heart,
    name: "Geriatric Care",
    description: "Specialized care for elderly patients focusing on comfort, mobility, and daily living assistance.",
    caregivers: 85,
  },
  {
    icon: Baby,
    name: "Pediatric Care",
    description: "Compassionate care for infants and children with medical needs or developmental support.",
    caregivers: 45,
  },
  {
    icon: Activity,
    name: "Physiotherapy",
    description: "Rehabilitation and physical therapy services to restore mobility and reduce pain.",
    caregivers: 65,
  },
  {
    icon: Brain,
    name: "Mental Health",
    description: "Mental health support including counseling, therapy, and psychiatric care at home.",
    caregivers: 40,
  },
  {
    icon: Pill,
    name: "Palliative Care",
    description: "Comfort-focused care for patients with serious illnesses, emphasizing quality of life.",
    caregivers: 30,
  },
  {
    icon: Eye,
    name: "Vision Care",
    description: "Eye care services and assistance for patients with visual impairments.",
    caregivers: 25,
  },
  {
    icon: Bone,
    name: "Orthopedic Care",
    description: "Post-surgical care and rehabilitation for bone, joint, and muscle conditions.",
    caregivers: 55,
  },
];

const SpecialtiesSection = () => {
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

        {/* Specialties Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {specialties.map((specialty, index) => (
            <Link
              key={specialty.name}
              to={`/caregivers?specialty=${specialty.name.toLowerCase().replace(" ", "-")}`}
              className="block"
            >
              <div className="bg-gray-50 rounded-lg p-8 border-l-4 border-blue-500 hover:bg-white hover:border-blue-600 hover:shadow-md transition-all duration-200">
                {/* Icon */}
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                  <specialty.icon className="h-6 w-6 text-blue-600" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {specialty.name}
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  {specialty.description}
                </p>

                {/* Caregiver Count */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    {specialty.caregivers} caregivers available
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
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
      </div>
    </section>
  );
};

export default SpecialtiesSection;
