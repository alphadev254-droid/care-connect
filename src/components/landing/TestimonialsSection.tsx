import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    image: null,
    rating: 5,
    content:
      "CareConnect has been a blessing for our family. The caregiver assigned to my mother is incredibly professional and caring. The detailed reports keep us informed every step of the way.",
  },
  {
    name: "Grace Okonkwo",
    role: "Caregiver",
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
  {
    name: "Mary Banda",
    role: "Caregiver",
    image: null,
    rating: 5,
    content:
      "Working through CareConnect has allowed me to help families in my community while earning a good income. The support from the platform team is excellent.",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-gray-600">
            Real feedback from families, caregivers, and healthcare professionals.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="bg-gray-50 rounded-lg p-6 border-l-4 border-blue-500"
            >
              {/* Content */}
              <p className="text-gray-700 mb-4 italic">
                "{testimonial.content}"
              </p>

              {/* Footer */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
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
