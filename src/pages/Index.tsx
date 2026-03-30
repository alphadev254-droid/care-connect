import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import SpecialtiesSection from "@/components/landing/SpecialtiesSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import StatsSection from "@/components/landing/StatsSection";
import CTASection from "@/components/landing/CTASection";
import { organizationSchema } from "@/lib/structuredData";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Home Healthcare Services Across Malawi | CareConnect</title>
        <meta name="description" content="Professional home healthcare services across all regions of Malawi. Book verified caregivers, registered nurses, and healthcare professionals. 24/7 support." />
        <link rel="canonical" href="https://careconnectmalawi.com/" />
        <meta property="og:url" content="https://careconnectmalawi.com/" />
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <SpecialtiesSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
