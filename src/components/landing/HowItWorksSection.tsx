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
    <section className="py-16 bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How CareConnect Works
          </h2>
          <p className="text-gray-600">
            Getting quality home healthcare has never been easier. Follow these simple steps to connect with your perfect caregiver.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="text-center">
              <div className="bg-white rounded-lg p-8 hover:shadow-md transition-shadow">
                {/* Icon */}
                <div className={`h-16 w-16 rounded-lg flex items-center justify-center mx-auto mb-6 ${
                  index === 0 ? 'bg-blue-100' :
                  index === 1 ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <item.icon className={`h-8 w-8 ${
                    index === 0 ? 'text-blue-600' :
                    index === 1 ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
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
