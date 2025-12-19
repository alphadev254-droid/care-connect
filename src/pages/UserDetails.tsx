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
  Users,
  CreditCard,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  // Fetch caregiver appointments
  const { data: appointments } = useQuery({
    queryKey: ["caregiver-appointments", userData?.Caregiver?.id],
    queryFn: async () => {
      if (!userData?.Caregiver?.id) return [];
      const response = await api.get(`/admin/caregivers/${userData.Caregiver.id}/appointments`);
      return response.data.appointments || [];
    },
    enabled: !!userData?.Caregiver?.id,
  });

  // Fetch caregiver patients
  const { data: patients } = useQuery({
    queryKey: ["caregiver-patients", userData?.Caregiver?.id],
    queryFn: async () => {
      if (!userData?.Caregiver?.id) return [];
      const response = await api.get(`/admin/caregivers/${userData.Caregiver.id}/patients`);
      return response.data.patients || [];
    },
    enabled: !!userData?.Caregiver?.id,
  });

  // Fetch caregiver transactions
  const { data: transactionsData } = useQuery({
    queryKey: ["caregiver-transactions", userData?.Caregiver?.id],
    queryFn: async () => {
      if (!userData?.Caregiver?.id) return { transactions: [], totalEarnings: 0 };
      const response = await api.get(`/admin/caregivers/${userData.Caregiver.id}/transactions`);
      return response.data;
    },
    enabled: !!userData?.Caregiver?.id,
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
                      <TabsTrigger value="appointments">Appointments</TabsTrigger>
                      <TabsTrigger value="patients">Patients</TabsTrigger>
                      <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    </>
                  )}
                  {userData.Role?.name === 'patient' && (
                    <TabsTrigger value="patient">Patient Info</TabsTrigger>
                  )}
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
                        <label className="text-sm font-medium text-muted-foreground">ID Number</label>
                        <p className="font-medium">{userData.idNumber || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">License Number</label>
                        <p className="font-medium">{userData.Caregiver.licenseNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Licensing Institution</label>
                        <p className="font-medium">{userData.Caregiver.licensingInstitution || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Experience</label>
                        <p className="font-medium">{userData.Caregiver.experience} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Qualifications</label>
                        <p className="font-medium">{userData.Caregiver.qualifications}</p>
                      </div>
                    </div>

                    {/* Specialties with Fees */}
                    {userData.Caregiver.Specialties && userData.Caregiver.Specialties.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Specialties & Fees
                        </h3>
                        <div className="space-y-3">
                          {userData.Caregiver.Specialties.map((specialty: any) => (
                            <div key={specialty.id} className="p-3 rounded-lg border bg-muted/30">
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant="secondary" className="font-medium">
                                  {specialty.name}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <label className="text-xs text-muted-foreground">Session Fee</label>
                                  <p className="font-semibold text-primary">
                                    MWK {specialty.sessionFee ? Number(specialty.sessionFee).toFixed(2) : '0.00'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-xs text-muted-foreground">Booking Fee</label>
                                  <p className="font-semibold text-secondary">
                                    MWK {specialty.bookingFee ? Number(specialty.bookingFee).toFixed(2) : '0.00'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Location Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Region</label>
                          <p className="font-medium">{userData.Caregiver.region || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">District</label>
                          <p className="font-medium">{userData.Caregiver.district || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Traditional Authority</label>
                          <p className="font-medium">{userData.Caregiver.traditionalAuthority || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Village</label>
                          <p className="font-medium">{userData.Caregiver.village || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

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
                  <>
                    <TabsContent value="appointments" className="space-y-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">All Appointments</CardTitle>
                          <CardDescription className="text-xs">
                            Complete appointment history for this caregiver
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {appointments && appointments.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-9">Date</TableHead>
                                  <TableHead className="h-9">Patient</TableHead>
                                  <TableHead className="h-9">Specialty</TableHead>
                                  <TableHead className="h-9">Status</TableHead>
                                  <TableHead className="h-9 text-right">Cost</TableHead>
                                  <TableHead className="h-9 text-right">Payment</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {appointments.map((apt: any) => (
                                  <TableRow key={apt.id}>
                                    <TableCell className="py-2">
                                      {new Date(apt.scheduledDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      {apt.Patient?.User?.firstName} {apt.Patient?.User?.lastName}
                                    </TableCell>
                                    <TableCell className="py-2 text-xs">
                                      {apt.Specialty?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <Badge variant={apt.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                        {apt.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-2 text-right font-semibold">
                                      MWK {parseFloat(apt.totalCost || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-2 text-right">
                                      {apt.PaymentTransaction ? (
                                        <Badge variant={apt.PaymentTransaction.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                          {apt.PaymentTransaction.status}
                                        </Badge>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Pending</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>No appointments found</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Patients Served</CardTitle>
                          <CardDescription className="text-xs">
                            Unique patients this caregiver has worked with
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {patients && patients.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-9">Patient Name</TableHead>
                                  <TableHead className="h-9">Email</TableHead>
                                  <TableHead className="h-9">Phone</TableHead>
                                  <TableHead className="h-9 text-right">Total Appointments</TableHead>
                                  <TableHead className="h-9 text-right">Last Visit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {patients.map((p: any) => (
                                  <TableRow key={p.patientId}>
                                    <TableCell className="py-2 font-medium">
                                      {p.Patient?.User?.firstName} {p.Patient?.User?.lastName}
                                    </TableCell>
                                    <TableCell className="py-2 text-xs text-muted-foreground">
                                      {p.Patient?.User?.email}
                                    </TableCell>
                                    <TableCell className="py-2 text-xs">
                                      {p.Patient?.User?.phone || 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-2 text-right font-semibold">
                                      {p.appointmentCount}
                                    </TableCell>
                                    <TableCell className="py-2 text-right text-xs">
                                      {new Date(p.lastAppointment).toLocaleDateString()}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                              <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>No patients found</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="transactions" className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Total Transactions</p>
                                <p className="text-xl font-bold mt-1">{transactionsData?.transactions?.length || 0}</p>
                              </div>
                              <CreditCard className="h-8 w-8 text-primary opacity-50" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Total Earnings</p>
                                <p className="text-xl font-bold mt-1 text-success">
                                  MWK {(transactionsData?.totalEarnings || 0).toLocaleString()}
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-success opacity-50" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">Completed</p>
                                <p className="text-xl font-bold mt-1">
                                  {transactionsData?.transactions?.filter((t: any) => t.status === 'completed').length || 0}
                                </p>
                              </div>
                              <Award className="h-8 w-8 text-accent opacity-50" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">Payment Transactions</CardTitle>
                          <CardDescription className="text-xs">
                            All payment transactions for this caregiver's appointments
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {transactionsData?.transactions && transactionsData.transactions.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="h-9">Date</TableHead>
                                  <TableHead className="h-9">Transaction ID</TableHead>
                                  <TableHead className="h-9">Patient</TableHead>
                                  <TableHead className="h-9">Specialty</TableHead>
                                  <TableHead className="h-9 text-right">Amount</TableHead>
                                  <TableHead className="h-9">Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {transactionsData.transactions.map((txn: any) => (
                                  <TableRow key={txn.id}>
                                    <TableCell className="py-2 text-xs">
                                      {new Date(txn.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="py-2 text-xs font-mono">
                                      {txn.transactionId || 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      {txn.Appointment?.Patient?.User?.firstName} {txn.Appointment?.Patient?.User?.lastName}
                                    </TableCell>
                                    <TableCell className="py-2 text-xs">
                                      {txn.Appointment?.Specialty?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className="py-2 text-right font-bold">
                                      MWK {parseFloat(txn.amount || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="py-2">
                                      <Badge variant={txn.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                                        {txn.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          ) : (
                            <div className="text-center py-12 text-sm text-muted-foreground">
                              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-50" />
                              <p>No transactions found</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </>
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

              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserDetails;