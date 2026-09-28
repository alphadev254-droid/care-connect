import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { ReferralSection } from "@/components/referral/ReferralSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { responsive } from "@/theme";
import { Edit, Save, X } from "lucide-react";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { BasicInfoCard } from "@/components/profile/BasicInfoCard";
import { PatientInfoCard, ProfessionalInfoCard } from "@/components/profile/InfoCards";
import { SecurityCard } from "@/components/profile/SecurityCard";

interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  Patient?: {
    dateOfBirth?: string;
    address?: string;
    emergencyContact?: string;
  };
  Caregiver?: {
    bio?: string;
    region?: string;
    district?: string;
    traditionalAuthority?: string | string[];
    village?: string | string[];
    verificationStatus?: string;
  };
}

const toArray = (value: string | string[] | undefined) =>
  typeof value === "string" ? (value ? [value] : []) : value || [];

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [allVillages, setAllVillages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", phone: "",
    dateOfBirth: "", address: "", emergencyContact: "",
    bio: "", region: "", district: "",
    traditionalAuthority: [] as string[],
    village: [] as string[],
  });

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileData> => (await api.get("/users/profile")).data.user,
  });
  const caregiverStatus = String(profileData?.Caregiver?.verificationStatus || "").toLowerCase();
  const isVerifiedCaregiver = profileData?.role === "caregiver" && ["approved", "verified"].includes(caregiverStatus);

  const { data: regions } = useQuery({
    queryKey: ["regions-list"],
    queryFn: async () => (await api.get("/locations/regions")).data.data || [],
  });

  const { data: districts } = useQuery({
    queryKey: ["districts-list", formData.region],
    queryFn: async () => {
      if (!formData.region) return [];
      return (await api.get(`/locations/districts/${formData.region}`)).data.data || [];
    },
    enabled: !!formData.region,
  });

  const { data: traditionalAuthorities } = useQuery({
    queryKey: ["ta-list", formData.region, formData.district],
    queryFn: async () => {
      if (!formData.district) return [];
      return (await api.get(`/locations/traditional-authorities/${formData.region}/${formData.district}`)).data.data || [];
    },
    enabled: !!formData.district,
  });

  useEffect(() => {
    const fetchVillages = async () => {
      if (!formData.region || !formData.district || !formData.traditionalAuthority.length) {
        setAllVillages([]); return;
      }
      try {
        const responses = await Promise.all(
          formData.traditionalAuthority.map((ta) =>
            api.get(`/locations/villages/${encodeURIComponent(formData.region)}/${encodeURIComponent(formData.district)}/${encodeURIComponent(ta)}`)
          )
        );
        setAllVillages([...new Set(responses.flatMap((r) => r.data.data || []))]);
      } catch { setAllVillages([]); }
    };
    fetchVillages();
  }, [formData.region, formData.district, formData.traditionalAuthority]);

  const syncForm = (data: ProfileData) => {
    setFormData({
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      phone: data.phone || "",
      dateOfBirth: data.Patient?.dateOfBirth
        ? new Date(data.Patient.dateOfBirth).toISOString().split("T")[0] : "",
      address: data.Patient?.address || "",
      emergencyContact: data.Patient?.emergencyContact || "",
      bio: data.Caregiver?.bio || "",
      region: data.Caregiver?.region || "",
      district: data.Caregiver?.district || "",
      traditionalAuthority: toArray(data.Caregiver?.traditionalAuthority),
      village: toArray(data.Caregiver?.village),
    });
  };

  useEffect(() => {
    if (!profileData) return;
    setFormData({
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      phone: profileData.phone || "",
      dateOfBirth: profileData.Patient?.dateOfBirth
        ? new Date(profileData.Patient.dateOfBirth).toISOString().split("T")[0] : "",
      address: profileData.Patient?.address || "",
      emergencyContact: profileData.Patient?.emergencyContact || "",
      bio: profileData.Caregiver?.bio || "",
      region: profileData.Caregiver?.region || "",
      district: profileData.Caregiver?.district || "",
      traditionalAuthority: toArray(profileData.Caregiver?.traditionalAuthority),
      village: toArray(profileData.Caregiver?.village),
    });
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) =>
      (await api.put("/users/profile", data, { headers: { "Content-Type": "multipart/form-data" } })).data,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false); setProfileImage(null); setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) =>
      (await api.put("/users/change-password", data)).data,
    onSuccess: () => toast.success("Password changed successfully!"),
    onError: () => toast.error("Failed to change password"),
  });

  const handleSave = () => {
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== null && v !== undefined) {
        if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
        else if (v) fd.append(k, v);
      }
    });
    if (profileImage) fd.append("profileImage", profileImage);
    updateMutation.mutate(fd);
  };

  const handleCancel = () => {
    setIsEditing(false); setProfileImage(null); setImagePreview(null);
    if (profileData) syncForm(profileData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRegionChange = (v: string) =>
    setFormData({ ...formData, region: v, district: "", traditionalAuthority: [], village: [] });

  const handleDistrictChange = (v: string) =>
    setFormData({ ...formData, district: v, traditionalAuthority: [], village: [] });

  if (isLoading) {
    return (
      <DashboardLayout userRole={user?.role || "patient"}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={user?.role || "patient"}>
      <div className="space-y-3 md:space-y-4">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className={responsive.pageTitle}>My Profile</h1>
            <p className={responsive.pageSubtitle}>Manage your personal information and preferences</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1.5 h-8 text-xs">
                  <X className="h-3.5 w-3.5" />Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="gap-1.5 h-8 text-xs">
                  <Save className="h-3.5 w-3.5" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)} className="gap-1.5 h-8 text-xs">
                <Edit className="h-3.5 w-3.5" />Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-4">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-3 md:space-y-4">
            <ProfileSidebar
              profileData={profileData}
              isEditing={isEditing}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
            />
            {profileData?.role === "caregiver" &&
              isVerifiedCaregiver && (
                <ReferralSection />
              )}
          </div>

          {/* Main content */}
          <div className="xl:col-span-2 space-y-3 md:space-y-4">
            <BasicInfoCard
              profileData={profileData}
              isEditing={isEditing}
              formData={formData}
              setFormData={setFormData}
            />

            {profileData?.role === "patient" && (
              <PatientInfoCard
                profileData={profileData}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
              />
            )}

            {profileData?.role === "caregiver" && profileData?.Caregiver && (
              <ProfessionalInfoCard
                profileData={profileData}
                isEditing={isEditing}
                formData={formData}
                setFormData={setFormData}
                regions={regions || []}
                districts={districts || []}
                traditionalAuthorities={traditionalAuthorities || []}
                allVillages={allVillages}
                onRegionChange={handleRegionChange}
                onDistrictChange={handleDistrictChange}
              />
            )}

            <SecurityCard
              onPasswordChange={(data) => passwordMutation.mutate(data)}
              isPending={passwordMutation.isPending}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
