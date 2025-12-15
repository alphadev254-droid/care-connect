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
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl animate-fade-in">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Our Specialties
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-4">
              Care Tailored to Your Needs
            </h2>
            <p className="text-muted-foreground text-lg">
              Our caregivers are specialists in various healthcare fields, ensuring 
              you get the right expertise for your specific condition.
            </p>
          </div>
          <Link to="/specialties">
            <Button variant="outline" className="gap-2">
              View All Specialties
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Specialties Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((specialty, index) => (
            <Link
              key={specialty.name}
              to={`/caregivers?specialty=${specialty.name.toLowerCase().replace(" ", "-")}`}
              className="group"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="h-full bg-card rounded-2xl p-6 border shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 group-hover:-translate-y-1">
                {/* Icon */}
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <specialty.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {specialty.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {specialty.description}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">
                    {specialty.caregivers} caregivers
                  </span>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesSection;
