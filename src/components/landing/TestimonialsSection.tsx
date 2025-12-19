import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient's Daughter",
    image: null,
    rating: 5,
    content:
      "CareConnect has been a blessing for our family. The caregiver assigned to my mother is incredibly professional and caring. The detailed reports keep us informed every step of the way.",
  },
  {
    name: "Dr. Michael Chen",
    role: "Primary Physician",
    image: null,
    rating: 5,
    content:
      "As a physician, I appreciate how easy it is to recommend caregivers to my patients. The platform's verification system gives me confidence in the quality of care my patients receive.",
  },
  {
    name: "Grace Okonkwo",
    role: "Registered Nurse",
    image: null,
    rating: 5,
    content:
      "Being a caregiver on CareConnect has been rewarding. The platform is user-friendly, payments are prompt, and I can manage my schedule flexibly while helping patients.",
  },
  {
    name: "James Muthoni",
    role: "Patient",
    image: null,
    rating: 5,
    content:
      "After my surgery, I needed physiotherapy at home. CareConnect matched me with an excellent therapist. The teleconference feature made follow-ups so convenient.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-8 lg:py-13 bg-muted/30">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-6">
            Trusted by Families Everywhere
          </h2>
          <p className="text-muted-foreground text-lg">
            Hear from patients, caregivers, and healthcare professionals who have 
            experienced the CareConnect difference.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-card rounded-2xl p-8 border shadow-sm hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <Quote className="h-10 w-10 text-primary/20 mb-4" />

              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-accent fill-current"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
