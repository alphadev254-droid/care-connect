import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Users
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    emergencyContact: ""
  });
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
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        dateOfBirth: profileData.Patient?.dateOfBirth ? 
          new Date(profileData.Patient.dateOfBirth).toISOString().split('T')[0] : "",
        address: profileData.Patient?.address || "",
        emergencyContact: profileData.Patient?.emergencyContact || ""
      });
    }
  }, [profileData]);

  const handleSave = () => {
    const formDataToSend = new FormData();
    
    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
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
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phone: profileData.phone || "",
        dateOfBirth: profileData.Patient?.dateOfBirth ? 
          new Date(profileData.Patient.dateOfBirth).toISOString().split('T')[0] : "",
        address: profileData.Patient?.address || "",
        emergencyContact: profileData.Patient?.emergencyContact || ""
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-1">Manage your personal information</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateProfileMutation.isPending} className="gap-2 bg-gradient-primary">
                  <Save className="h-4 w-4" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-gradient-primary">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="text-center pb-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-2 border-primary/20"
                  />
                ) : profileData?.Caregiver?.profileImage ? (
                  <img
                    src={profileData.Caregiver.profileImage}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-2 border-primary/20"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-2xl">
                    {profileData?.firstName?.charAt(0)}{profileData?.lastName?.charAt(0)}
                  </div>
                )}
                {isEditing && profileData?.role === 'caregiver' && (
                  <div className="absolute bottom-0 right-1/2 transform translate-x-1/2">
                    <Label htmlFor="profileImageInput" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90">
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
              <CardTitle className="font-display text-xl">
                {profileData?.firstName} {profileData?.lastName}
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profileData?.email}
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mt-2">
                {profileData?.role?.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{profileData?.phone || "Not provided"}</span>
              </div>
              {profileData?.Patient?.dateOfBirth && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(profileData.Patient.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {profileData?.Patient?.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{profileData.Patient.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profileData?.firstName || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profileData?.lastName || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profileData?.phone || "Not provided"}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <p className="text-sm font-medium">{profileData?.idNumber || "Not provided"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {profileData?.role === 'patient' && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Patient Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">
                          {profileData?.Patient?.dateOfBirth ? 
                            new Date(profileData.Patient.dateOfBirth).toLocaleDateString() : 
                            "Not provided"
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">{profileData?.Patient?.emergencyContact || "Not provided"}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    {isEditing ? (
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm font-medium">{profileData?.Patient?.address || "Not provided"}</p>
                    )}
                  </div>
                  
                  {(profileData?.Patient?.patientType === 'child' || profileData?.Patient?.patientType === 'elderly') && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Guardian Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Guardian Name</Label>
                          <p className="text-sm font-medium">
                            {profileData?.Patient?.guardianFirstName} {profileData?.Patient?.guardianLastName}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Relationship</Label>
                          <p className="text-sm font-medium">{profileData?.Patient?.guardianRelationship || "Not provided"}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Guardian Phone</Label>
                          <p className="text-sm font-medium">{profileData?.Patient?.guardianPhone || "Not provided"}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Guardian Email</Label>
                          <p className="text-sm font-medium">{profileData?.Patient?.guardianEmail || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {profileData?.role === 'caregiver' && profileData?.Caregiver && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>License Number</Label>
                      <p className="text-sm font-medium">{profileData.Caregiver.licenseNumber}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Experience</Label>
                      <p className="text-sm font-medium">{profileData.Caregiver.experience} years</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Licensing Institution</Label>
                      <p className="text-sm font-medium">{profileData.Caregiver.licensingInstitution}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Verification Status</Label>
                      <Badge variant={profileData.Caregiver.verificationStatus === 'approved' ? 'default' : 'secondary'}>
                        {profileData.Caregiver.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Qualifications</Label>
                    <p className="text-sm font-medium">{profileData.Caregiver.qualifications}</p>
                  </div>
                  
                  {(Array.isArray(profileData.Caregiver.idDocuments) || Array.isArray(profileData.Caregiver.supportingDocuments)) && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Uploaded Documents
                      </h4>
                      <div className="space-y-3">
                        {Array.isArray(profileData.Caregiver.idDocuments) && profileData.Caregiver.idDocuments.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">ID Documents ({profileData.Caregiver.idDocuments.length})</Label>
                            <div className="text-xs text-muted-foreground mt-1">
                              {profileData.Caregiver.idDocuments.map((doc: any, index: number) => (
                                <p key={index}>• {doc.filename}</p>
                              ))}
                            </div>
                          </div>
                        )}
                        {Array.isArray(profileData.Caregiver.supportingDocuments) && profileData.Caregiver.supportingDocuments.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Supporting Documents ({profileData.Caregiver.supportingDocuments.length})</Label>
                            <div className="text-xs text-muted-foreground mt-1">
                              {profileData.Caregiver.supportingDocuments.map((doc: any, index: number) => (
                                <p key={index}>• {doc.filename}</p>
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

            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;