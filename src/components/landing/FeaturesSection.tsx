import {
  Video,
  Shield,
  Clock,
  FileText,
  CreditCard,
  Bell,
  Users,
  HeadphonesIcon,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Caregivers",
    description:
      "Every caregiver undergoes thorough background checks, license verification, and credential validation.",
  },
  {
    icon: Video,
    title: "Teleconference Sessions",
    description:
      "Connect with caregivers via video calls for consultations, follow-ups, and remote monitoring.",
  },
  {
    icon: FileText,
    title: "Detailed Care Reports",
    description:
      "Receive comprehensive reports after each session including vitals, observations, and recommendations.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description:
      "Book appointments any time of day. Emergency care services available around the clock.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Multiple payment options including mobile money and bank transfers. Transparent pricing.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated reminders for appointments, medication schedules, and important health updates.",
  },
  {
    icon: Users,
    title: "Physician Recommendations",
    description:
      "Get caregiver recommendations from your primary physician based on your health needs.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "Our support team is always ready to help with any questions or concerns you may have.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-8 lg:py-14 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-40 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Platform Features
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
            Everything You Need for Home Healthcare
          </h2>
          <p className="text-muted-foreground text-lg">
            Our comprehensive platform provides all the tools and features to ensure 
            seamless, quality healthcare delivery right at home.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group text-center p-6 rounded-2xl hover:bg-card hover:shadow-lg hover:border border-transparent hover:border-border transition-all duration-300"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Icon */}
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>

              {/* Content */}
              <h3 className="font-display text-lg font-bold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
