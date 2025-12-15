import { Search, Calendar, Heart, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Find Your Caregiver",
    description:
      "Browse our network of verified caregivers filtered by specialty, location, availability, and ratings. View detailed profiles and credentials.",
    color: "primary",
  },
  {
    icon: Calendar,
    step: "02",
    title: "Book an Appointment",
    description:
      "Select your preferred date and time. Our flexible scheduling works around your needs. Get instant confirmation and reminders.",
    color: "secondary",
  },
  {
    icon: Heart,
    step: "03",
    title: "Receive Quality Care",
    description:
      "Your caregiver arrives at your home with everything needed. Track progress through detailed care reports and stay connected.",
    color: "accent",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
            How CareConnect Works
          </h2>
          <p className="text-muted-foreground text-lg">
            Getting quality home healthcare has never been easier. Follow these 
            simple steps to connect with your perfect caregiver.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((item, index) => (
            <div
              key={item.step}
              className="relative group"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-border to-transparent">
                  <ArrowRight className="absolute -right-2 -top-2 h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <div className="relative bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                {/* Step Number */}
                <span className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-muted flex items-center justify-center font-display font-bold text-sm">
                  {item.step}
                </span>

                {/* Icon */}
                <div
                  className={`h-16 w-16 rounded-2xl bg-${item.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <item.icon className={`h-8 w-8 text-${item.color}`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
