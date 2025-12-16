import DashboardLayout from "@/components/layout/DashboardLayout";
import { ComingSoon } from "@/components/ComingSoon";
import { useAuth } from "@/contexts/AuthContext";

const Teleconference = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <ComingSoon
        feature="Video Teleconference"
        description="Connect with your healthcare providers through secure video calls. Schedule and join virtual appointments from the comfort of your home."
      />
    </DashboardLayout>
  );
};

export default Teleconference;
