import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Award,
  DollarSign,
  Clock,
  ArrowLeft,
  Download,
  FileText,
} from "lucide-react";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const parseDocuments = (docs: any) => {
    try {
      return typeof docs === 'string' ? JSON.parse(docs) : docs || [];
    } catch {
      return [];
    }
  };

  const { data: userData, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data.user;
    },
  });

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
          <h2 className="text-xl font-semibold mb-2">User not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(currentUser?.role || 'system_manager')}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {userData.firstName} {userData.lastName}
            </h1>
            <p className="text-muted-foreground">User Profile Details</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="h-24 w-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
                {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
              </div>
              <CardTitle>{userData.firstName} {userData.lastName}</CardTitle>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {userData.Role?.name?.replace('_', ' ')}
                </Badge>
                <Badge variant={userData.isActive ? "default" : "secondary"}>
                  {userData.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{userData.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {new Date(userData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detailed Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  {userData.Role?.name === 'caregiver' && (
                    <>
                      <TabsTrigger value="caregiver">Caregiver Info</TabsTrigger>
                      <TabsTrigger value="patients">Patients</TabsTrigger>
                    </>
                  )}
                  {userData.Role?.name === 'patient' && (
                    <TabsTrigger value="patient">Patient Info</TabsTrigger>
                  )}
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="font-medium">{userData.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="font-medium">{userData.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="font-medium">{userData.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Role</label>
                      <p className="font-medium capitalize">{userData.Role?.name?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="font-medium">{userData.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                </TabsContent>

                {userData.Role?.name === 'caregiver' && userData.Caregiver && (
                  <TabsContent value="caregiver" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">License Number</label>
                        <p className="font-medium">{userData.Caregiver.licenseNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Experience</label>
                        <p className="font-medium">{userData.Caregiver.experience} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Hourly Rate</label>
                        <p className="font-medium">${userData.Caregiver.hourlyRate}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Qualifications</label>
                        <p className="font-medium">{userData.Caregiver.qualifications}</p>
                      </div>
                    </div>
                    
                    {/* Specialties */}
                    {userData.Caregiver.Specialties && userData.Caregiver.Specialties.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-3 block">Specialties</label>
                        <div className="flex flex-wrap gap-2">
                          {userData.Caregiver.Specialties.map((specialty: any) => (
                            <Badge key={specialty.id} variant="secondary">
                              {specialty.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Supporting Documents */}
                    {(() => {
                      const documents = parseDocuments(userData.Caregiver.supportingDocuments);
                      return documents.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-3 block">Supporting Documents</label>
                          <div className="grid gap-3">
                            {documents.map((doc: any, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{doc.filename}</p>
                                    <p className="text-xs text-muted-foreground">{doc.format?.toUpperCase()}</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(doc.url, '_blank')}
                                  className="gap-2"
                                >
                                  <Download className="h-4 w-4" />
                                  Download
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </TabsContent>
                )}

                {userData.Role?.name === 'caregiver' && (
                  <TabsContent value="patients" className="space-y-4">
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Patient List</h3>
                      <p>Patients assigned to this caregiver will appear here</p>
                    </div>
                  </TabsContent>
                )}

                {userData.Role?.name === 'patient' && userData.Patient && (
                  <TabsContent value="patient" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="font-medium">
                          {userData.Patient.dateOfBirth ? 
                            new Date(userData.Patient.dateOfBirth).toLocaleDateString() : 
                            'Not provided'
                          }
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="font-medium">{userData.Patient.address || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
                        <p className="font-medium">{userData.Patient.emergencyContact || 'Not provided'}</p>
                      </div>
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="activity" className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Activity History</h3>
                    <p>User activity tracking will be available here</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;