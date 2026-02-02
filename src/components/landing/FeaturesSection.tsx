import {
  Video,
  Shield,
  Clock,
  FileText,
  CreditCard,
  Bell,
  Users,
  HeadphonesIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

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
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    description:
      "Our support team is always ready to help with any questions or concerns you may have.",
  },
];

const FeaturesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);
  const totalItems = features.length;
  
  // Auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 10000); // Auto-advance every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Update items per view based on screen size
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };
    
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);
  
  // Create extended array for infinite loop
  const extendedFeatures = [...features, ...features, ...features];
  const startIndex = totalItems; // Start from the middle set

  const nextSlide = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  // Reset position when reaching boundaries for infinite effect
  const handleTransitionEnd = () => {
    if (currentIndex >= totalItems) {
      setCurrentIndex(0);
    } else if (currentIndex <= -totalItems) {
      setCurrentIndex(0);
    }
  };

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

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>

          {/* Carousel Content */}
          <div className="overflow-hidden mx-12">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extendedFeatures.map((feature, index) => (
                <div
                  key={`${feature.title}-${index}`}
                  className={`flex-shrink-0 px-3 ${
                    itemsPerView === 1 ? 'w-full' : 
                    itemsPerView === 2 ? 'w-1/2' : 'w-1/3'
                  }`}
                >
                  <div className="text-center p-6 rounded-2xl hover:bg-gray-50 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all duration-300">
                    {/* Icon */}
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-4 hover:bg-blue-200 transition-all duration-300">
                      <feature.icon className="h-8 w-8 text-blue-600 transition-colors" />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-lg font-bold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.abs(currentIndex) % totalItems === index ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
