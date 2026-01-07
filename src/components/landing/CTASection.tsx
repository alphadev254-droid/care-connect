import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Heart } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-slate-50 border border-slate-200 p-12 lg:p-16">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-slate-300 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-300 rounded-full blur-3xl" />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-slate-800 space-y-6">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
                Ready to Experience Better Home Care?
              </h2>
              <p className="text-slate-600 text-lg max-w-lg">
                Join thousands of families who trust CareConnect for their home 
                healthcare needs. Get started today and connect with verified 
                caregivers in your area.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/register">
                  <Button
                    size="lg"
                    className="gap-2 bg-primary text-white hover:bg-primary/90"
                  >
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/caregivers">
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    Browse Caregivers
                  </Button>
                </Link>
              </div>
            </div>

            {/* Cards */}
            <div className="hidden lg:flex justify-end gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-display text-xl font-bold text-slate-800 mb-2">
                  For Patients
                </h3>
                <p className="text-slate-600 text-sm">
                  Find verified caregivers and book appointments easily.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm mt-8">
                <Heart className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-display text-xl font-bold text-slate-800 mb-2">
                  For Caregivers
                </h3>
                <p className="text-slate-600 text-sm">
                  Join our network and connect with patients who need your care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
