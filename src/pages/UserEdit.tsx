import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  Shield,
  Loader2,
} from "lucide-react";

const UserEdit = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    isActive: true,
    roleId: "",
    assignedRegion: "",
    // Caregiver specific fields
    specialtyId: "",
    yearsOfExperience: "",
    bio: "",
    serviceLocations: "",
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.user;
    },
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/admin/roles");
      return response.data;
    },
  });

  const roles = rolesData?.roles || [];
  const regions = rolesData?.regions || [];

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
        address: userData.address || "",
        isActive: userData.isActive ?? true,
        roleId: userData.role_id?.toString() || "",
        assignedRegion: userData.assignedRegion || "",
        // Caregiver specific
        specialtyId: userData.Caregiver?.specialtyId?.toString() || "",
        yearsOfExperience: userData.Caregiver?.yearsOfExperience?.toString() || "",
        bio: userData.Caregiver?.bio || "",
        serviceLocations: userData.Caregiver?.serviceLocations || "",
      });
    }
  }, [userData]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.put(`/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateData: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      address: formData.address,
      isActive: formData.isActive,
      roleId: parseInt(formData.roleId),
      assignedRegion: formData.assignedRegion === 'all' ? 'all' : formData.assignedRegion,
    };

    // Include caregiver data if user is a caregiver
    if (userData?.Caregiver) {
      updateData.caregiverData = {
        specialtyId: formData.specialtyId ? parseInt(formData.specialtyId) : null,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        bio: formData.bio,
        serviceLocations: formData.serviceLocations,
      };
    }

    updateUserMutation.mutate(updateData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userData) {
    return (
      <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate('/dashboard/users')} className="mt-4">
            Back to Users
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const isCaregiver = userData?.Role?.name === 'caregiver';

  return (
    <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                Edit User
              </h1>
              <p className="text-muted-foreground mt-1">
                Update user information and settings
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" className="gap-2">
                <User className="h-4 w-4" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="account" className="gap-2">
                <Shield className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update user's personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>



            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage user's role and account status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.roleId}
                      onValueChange={(value) => handleInputChange('roleId', value)}
                      required
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.filter((role: any) => role.name !== 'system_manager').map((role: any) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {userData?.Role?.name === 'caregiver' && (
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Select
                        value={formData.specialtyId}
                        onValueChange={(value) => handleInputChange('specialtyId', value)}
                      >
                        <SelectTrigger id="specialty">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties?.map((specialty: any) => (
                            <SelectItem key={specialty.id} value={specialty.id.toString()}>
                              {specialty.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(userData?.Role?.name === 'regional_manager' || userData?.Role?.name === 'accountant' || userData?.Role?.name === 'Accountant') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="assignedRegion">Assigned Region</Label>
                        <Select
                          value={formData.assignedRegion}
                          onValueChange={(value) => handleInputChange('assignedRegion', value)}
                        >
                          <SelectTrigger id="assignedRegion">
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {regions.map((region: string) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Access</Label>
                        <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                          {formData.assignedRegion === 'all' || !formData.assignedRegion ? 
                            'All' : 
                            formData.assignedRegion
                          }
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="isActive" className="text-base">
                        Account Status
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.isActive ? 'Account is active' : 'Account is inactive'}
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={updateUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default UserEdit;
