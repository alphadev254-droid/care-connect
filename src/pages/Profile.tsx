import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Edit,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  FileText,
  Users,
  Trash2,
  AlertTriangle
} from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: "",
    bio: "",
    region: "",
    district: "",
    traditionalAuthority: [] as string[],
    village: [] as string[]
  });
  const [allVillages, setAllVillages] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/profile");
      return response.data.user;
    },
  });

  // Location queries
  const { data: regions } = useQuery({
    queryKey: ["regions-list"],
    queryFn: async () => {
      const response = await api.get('/locations/regions');
      return response.data.data || [];
    }
  });

  const { data: districts } = useQuery({
    queryKey: ["districts-list", formData.region],
    queryFn: async () => {
      if (!formData.region) return [];
      const response = await api.get(`/locations/districts/${formData.region}`);
      return response.data.data || [];
    },
    enabled: !!formData.region
  });

  const { data: traditionalAuthorities } = useQuery({
    queryKey: ["ta-list", formData.region, formData.district],
    queryFn: async () => {
      if (!formData.district) return [];
      const response = await api.get(`/locations/traditional-authorities/${formData.region}/${formData.district}`);
      return response.data.data || [];
    },
    enabled: !!formData.district
  });

  // Fetch villages for all selected TAs
  useEffect(() => {
    const fetchAllVillages = async () => {
      if (!formData.region || !formData.district || formData.traditionalAuthority.length === 0) {
        setAllVillages([]);
        return;
      }
      try {
        const responses = await Promise.all(
          formData.traditionalAuthority.map(ta =>
            api.get(`/locations/villages/${encodeURIComponent(formData.region)}/${encodeURIComponent(formData.district)}/${encodeURIComponent(ta)}`)
          )
        );
        const villages = [...new Set(responses.flatMap(r => r.data.data || []))];
        setAllVillages(villages);
      } catch (error) {
        console.error('Failed to fetch villages:', error);
        setAllVillages([]);
      }
    };
    fetchAllVillages();
  }, [formData.region, formData.district, formData.traditionalAuthority]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put("/users/profile", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setProfileImage(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.put("/users/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: () => {
      toast.error("Failed to change password");
    },
  });

  useEffect(() => {
    if (profileData) {
      // Handle traditionalAuthority - ensure it's an array
      let taValue = profileData.Caregiver?.traditionalAuthority || [];
      if (typeof taValue === 'string') {
        taValue = taValue ? [taValue] : [];
      }

      // Handle village - ensure it's an array
      let villageValue = profileData.Caregiver?.village || [];
      if (typeof villageValue === 'string') {
        villageValue = villageValue ? [villageValue] : [];
      }

      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        dateOfBirth: profileData.Patient?.dateOfBirth ?
          new Date(profileData.Patient.dateOfBirth).toISOString().split('T')[0] : "",
        address: profileData.Patient?.address || "",
        emergencyContact: profileData.Patient?.emergencyContact || "",
        bio: profileData.Caregiver?.bio || "",
        region: profileData.Caregiver?.region || "",
        district: profileData.Caregiver?.district || "",
        traditionalAuthority: taValue,
        village: villageValue
      });
    }
  }, [profileData]);

  const handleSave = () => {
    const formDataToSend = new FormData();

    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Handle arrays (TA and village)
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value) {
          formDataToSend.append(key, value);
        }
      }
    });

    // Add profile image if selected
    if (profileImage) {
      formDataToSend.append('profileImage', profileImage);
    }

    updateProfileMutation.mutate(formDataToSend);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImage(null);
    setImagePreview(null);
    if (profileData) {
      // Handle traditionalAuthority - ensure it's an array
      let taValue = profileData.Caregiver?.traditionalAuthority || [];
      if (typeof taValue === 'string') {
        taValue = taValue ? [taValue] : [];
      }
      // Handle village - ensure it's an array
      let villageValue = profileData.Caregiver?.village || [];
      if (typeof villageValue === 'string') {
        villageValue = villageValue ? [villageValue] : [];
      }

      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        dateOfBirth: profileData.Patient?.dateOfBirth ?
          new Date(profileData.Patient.dateOfBirth).toISOString().split('T')[0] : "",
        address: profileData.Patient?.address || "",
        emergencyContact: profileData.Patient?.emergencyContact || "",
        bio: profileData.Caregiver?.bio || "",
        region: profileData.Caregiver?.region || "",
        district: profileData.Caregiver?.district || "",
        traditionalAuthority: taValue,
        village: villageValue
      });
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    
    try {
      await api.delete('/account/delete');
      toast.success("Account deletion initiated. You will be logged out.");
      
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
      
    } catch (error) {
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Location change handlers
  const handleRegionChange = (value: string) => {
    setFormData({
      ...formData,
      region: value,
      district: "",
      traditionalAuthority: [],
      village: []
    });
  };

  const handleDistrictChange = (value: string) => {
    setFormData({
      ...formData,
      district: value,
      traditionalAuthority: [],
      village: []
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={user?.role || 'patient'}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 shadow-lg">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">My Profile</h1>
              <p className="text-primary-foreground/90 mt-2">Manage your personal information and preferences</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel} className="gap-2 shadow-md">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="gap-2 bg-white text-primary hover:bg-white/90 shadow-md"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="gap-2 bg-white text-primary hover:bg-white/90 shadow-md"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <Card className="lg:col-span-1 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="text-center pb-6 relative">
              {/* Profile Avatar Section */}
              <div className="relative inline-block">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover mx-auto mb-4 border-4 border-primary/20 shadow-xl ring-4 ring-primary/10"
                  />
                ) : profileData?.Caregiver?.profileImage ? (
                  <img
                    src={profileData.Caregiver.profileImage}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    className="h-32 w-32 rounded-full object-cover mx-auto mb-4 border-4 border-primary/20 shadow-xl ring-4 ring-primary/10"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 text-white font-bold text-4xl shadow-xl ring-4 ring-primary/10">
                    {profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}
                  </div>
                )}
                {isEditing && profileData?.role === 'caregiver' && (
                  <div className="absolute bottom-3 right-1/2 transform translate-x-16">
                    <Label htmlFor="profileImageInput" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground rounded-full p-2.5 hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </div>
                    </Label>
                    <Input
                      id="profileImageInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <CardTitle className="font-display text-2xl mb-2">
                {profileData?.firstName} {profileData?.lastName}
              </CardTitle>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
                <Mail className="h-4 w-4" />
                <span className="truncate max-w-full">{profileData?.email}</span>
              </div>

              <Badge
                variant="secondary"
                className="w-fit mx-auto px-4 py-1 text-xs font-semibold uppercase tracking-wide"
              >
                {profileData?.role?.replace('_', ' ')}
              </Badge>
            </CardHeader>

            <div className="border-t"></div>

            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-medium capitalize">{profileData?.Role?.name?.replace('_', ' ') || profileData?.role?.replace('_', ' ') || "Not assigned"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <p className="text-sm font-medium">{profileData?.phone || "Not provided"}</p>
                  </div>
                </div>

                {profileData?.Patient?.dateOfBirth && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-sm font-medium">{new Date(profileData.Patient.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {profileData?.idNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">ID Number</p>
                      <p className="text-sm font-medium">{profileData.idNumber}</p>
                    </div>
                  </div>
                )}

                {(profileData?.role === 'regional_manager' || profileData?.role === 'Accountant') && profileData?.assignedRegion && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Assigned Region</p>
                      <p className="text-sm font-medium">{profileData.assignedRegion === 'all' ? 'All Regions' : profileData.assignedRegion}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent pb-4">
                <CardTitle className="font-display flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="transition-all duration-200"
                      />
                    ) : (
                      <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                        {profileData?.firstName || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="transition-all duration-200"
                      />
                    ) : (
                      <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                        {profileData?.lastName || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="transition-all duration-200"
                      />
                    ) : (
                      <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                        {profileData?.phone || "Not provided"}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber" className="text-sm font-medium text-muted-foreground">ID Number</Label>
                    <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                      {profileData?.idNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information Card */}
            {profileData?.role === 'patient' && (
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-transparent dark:from-rose-950/20 pb-4">
                  <CardTitle className="font-display flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          className="transition-all duration-200"
                        />
                      ) : (
                        <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                          {profileData?.Patient?.dateOfBirth ?
                            new Date(profileData.Patient.dateOfBirth).toLocaleDateString() :
                            "Not provided"
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact" className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                          className="transition-all duration-200"
                        />
                      ) : (
                        <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                          {profileData?.Patient?.emergencyContact || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={3}
                        className="transition-all duration-200 resize-none"
                      />
                    ) : (
                      <p className="text-base font-semibold p-3 rounded-md bg-muted/30 min-h-[80px]">
                        {profileData?.Patient?.address || "Not provided"}
                      </p>
                    )}
                  </div>

                  {(profileData?.Patient?.patientType === 'child' || profileData?.Patient?.patientType === 'elderly') && (
                    <div className="border-t pt-6 mt-4">
                      <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Guardian Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Guardian Name</Label>
                          <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                            {profileData?.Patient?.guardianFirstName} {profileData?.Patient?.guardianLastName}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Relationship</Label>
                          <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                            {profileData?.Patient?.guardianRelationship || "Not provided"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Guardian Phone</Label>
                          <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                            {profileData?.Patient?.guardianPhone || "Not provided"}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">Guardian Email</Label>
                          <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                            {profileData?.Patient?.guardianEmail || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Professional Information Card */}
            {profileData?.role === 'caregiver' && profileData?.Caregiver && (
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/20 pb-4">
                  <CardTitle className="font-display flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">License Number</Label>
                      <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                        {profileData.Caregiver.licenseNumber}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                      <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                        {profileData.Caregiver.experience} years
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Licensing Institution</Label>
                      <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                        {profileData.Caregiver.licensingInstitution}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Verification Status</Label>
                      <div className="p-2">
                        <Badge
                          variant={profileData.Caregiver.verificationStatus === 'approved' ? 'default' : 'secondary'}
                          className="px-3 py-1 text-sm font-semibold uppercase"
                        >
                          {profileData.Caregiver.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Qualifications</Label>
                    <p className="text-base font-semibold p-3 rounded-md bg-muted/30">
                      {profileData.Caregiver.qualifications}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">Professional Summary</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell patients about your experience, specialties, and approach to care..."
                        rows={5}
                        className="transition-all duration-200 resize-none"
                      />
                    ) : (
                      <div className="text-base leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-muted/30 min-h-[100px]">
                        {profileData.Caregiver.bio || "No summary provided"}
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6 mt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <Label className="text-lg font-semibold">Service Location</Label>
                    </div>
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="region" className="text-sm font-medium text-muted-foreground">Region</Label>
                          <Select value={formData.region} onValueChange={handleRegionChange}>
                            <SelectTrigger className="transition-all duration-200">
                              <SelectValue placeholder="Select Region" />
                            </SelectTrigger>
                            <SelectContent>
                              {regions?.map((region: string) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district" className="text-sm font-medium text-muted-foreground">District</Label>
                          <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.region}>
                            <SelectTrigger className="transition-all duration-200">
                              <SelectValue placeholder="Select District" />
                            </SelectTrigger>
                            <SelectContent>
                              {districts?.map((district: string) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Traditional Authorities <span className="text-xs text-muted-foreground">(Select multiple)</span>
                          </Label>
                          <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                            {!formData.district ? (
                              <p className="text-sm text-muted-foreground">Select a district first</p>
                            ) : !traditionalAuthorities || traditionalAuthorities.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No TAs available</p>
                            ) : (
                              traditionalAuthorities.map((ta: string) => (
                                <div key={ta} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`profile-ta-${ta}`}
                                    checked={formData.traditionalAuthority.includes(ta)}
                                    onCheckedChange={(checked) => {
                                      const newTAs = checked
                                        ? [...formData.traditionalAuthority, ta]
                                        : formData.traditionalAuthority.filter(t => t !== ta);
                                      setFormData({ ...formData, traditionalAuthority: newTAs, village: [] });
                                    }}
                                  />
                                  <label htmlFor={`profile-ta-${ta}`} className="text-sm cursor-pointer">{ta}</label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-muted-foreground">
                            Villages <span className="text-xs text-muted-foreground">(Select multiple)</span>
                          </Label>
                          <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                            {formData.traditionalAuthority.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Select at least one TA first</p>
                            ) : allVillages.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No villages available</p>
                            ) : (
                              allVillages.map((village: string) => (
                                <div key={village} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`profile-village-${village}`}
                                    checked={formData.village.includes(village)}
                                    onCheckedChange={(checked) => {
                                      const newVillages = checked
                                        ? [...formData.village, village]
                                        : formData.village.filter(v => v !== village);
                                      setFormData({ ...formData, village: newVillages });
                                    }}
                                  />
                                  <label htmlFor={`profile-village-${village}`} className="text-sm cursor-pointer">{village}</label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {profileData.Caregiver.region && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Region</Label>
                            <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                              {profileData.Caregiver.region}
                            </p>
                          </div>
                        )}
                        {profileData.Caregiver.district && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">District</Label>
                            <p className="text-base font-semibold p-2 rounded-md bg-muted/30">
                              {profileData.Caregiver.district}
                            </p>
                          </div>
                        )}
                        {profileData.Caregiver.traditionalAuthority && (Array.isArray(profileData.Caregiver.traditionalAuthority) ? profileData.Caregiver.traditionalAuthority.length > 0 : true) && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Traditional Authorities</Label>
                            <div className="p-2 rounded-md bg-muted/30">
                              {Array.isArray(profileData.Caregiver.traditionalAuthority)
                                ? profileData.Caregiver.traditionalAuthority.map((ta: string, idx: number) => (
                                    <span key={ta} className="text-base font-semibold">
                                      {ta}{idx < profileData.Caregiver.traditionalAuthority.length - 1 ? ', ' : ''}
                                    </span>
                                  ))
                                : <span className="text-base font-semibold">{profileData.Caregiver.traditionalAuthority}</span>
                              }
                            </div>
                          </div>
                        )}
                        {profileData.Caregiver.village && (Array.isArray(profileData.Caregiver.village) ? profileData.Caregiver.village.length > 0 : true) && (
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Villages</Label>
                            <div className="p-2 rounded-md bg-muted/30">
                              {Array.isArray(profileData.Caregiver.village)
                                ? profileData.Caregiver.village.map((v: string, idx: number) => (
                                    <span key={v} className="text-base font-semibold">
                                      {v}{idx < profileData.Caregiver.village.length - 1 ? ', ' : ''}
                                    </span>
                                  ))
                                : <span className="text-base font-semibold">{profileData.Caregiver.village}</span>
                              }
                            </div>
                          </div>
                        )}
                        {!profileData.Caregiver.region && !profileData.Caregiver.district &&
                         (!profileData.Caregiver.traditionalAuthority || (Array.isArray(profileData.Caregiver.traditionalAuthority) && profileData.Caregiver.traditionalAuthority.length === 0)) &&
                         (!profileData.Caregiver.village || (Array.isArray(profileData.Caregiver.village) && profileData.Caregiver.village.length === 0)) && (
                          <p className="text-base font-semibold p-3 rounded-md bg-muted/30 col-span-2">
                            Location not provided
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {(Array.isArray(profileData.Caregiver.idDocuments) || Array.isArray(profileData.Caregiver.supportingDocuments)) && (
                    <div className="border-t pt-6 mt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <Label className="text-lg font-semibold">Uploaded Documents</Label>
                      </div>
                      <div className="space-y-4">
                        {Array.isArray(profileData.Caregiver.idDocuments) && profileData.Caregiver.idDocuments.length > 0 && (
                          <div className="p-4 rounded-lg bg-muted/30 border border-muted">
                            <Label className="text-sm font-semibold mb-2 block">
                              ID Documents ({profileData.Caregiver.idDocuments.length})
                            </Label>
                            <div className="space-y-1">
                              {profileData.Caregiver.idDocuments.map((doc: any, index: number) => (
                                <p key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                  {doc.filename}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(profileData.Caregiver.supportingDocuments) && profileData.Caregiver.supportingDocuments.length > 0 && (
                          <div className="p-4 rounded-lg bg-muted/30 border border-muted">
                            <Label className="text-sm font-semibold mb-2 block">
                              Supporting Documents ({profileData.Caregiver.supportingDocuments.length})
                            </Label>
                            <div className="space-y-1">
                              {profileData.Caregiver.supportingDocuments.map((doc: any, index: number) => (
                                <p key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                  {doc.filename}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Security Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-950/20 pb-4">
                <CardTitle className="font-display flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="p-4 rounded-lg bg-muted/30 border border-muted mb-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Keep your account secure by using a strong password and changing it regularly.
                  </p>
                </div>
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors">
                      <Lock className="h-4 w-4" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPasswordDialogOpen(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePasswordChange}
                          disabled={changePasswordMutation.isPending}
                          className="flex-1 bg-gradient-primary"
                        >
                          {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Delete Account Section */}
                <div className="border-t pt-6 mt-6">
                  <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-destructive mb-2">Delete Account</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                      </div>
                      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="ml-4">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                              <AlertTriangle className="h-5 w-5" />
                              Delete Account
                            </DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="mb-4">
                              Are you sure you want to delete your account? This will:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              <li>Remove your personal information from active systems</li>
                              <li>Cancel all future appointments</li>
                              <li>Process within 30 days</li>
                              <li>Retain some data as required by law</li>
                            </ul>
                            <p className="mt-4 font-semibold text-destructive">
                              This action cannot be undone.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowDeleteDialog(false)}
                              disabled={isDeleting}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete Account"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;