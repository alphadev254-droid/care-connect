import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Search,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  FileText,
  Activity,
} from "lucide-react";

const Patients = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: patientsData, isLoading } = useQuery({
    queryKey: ["caregiver-patients"],
    queryFn: async () => {
      const response = await api.get("/patients/caregiver");
      return response.data.patients || [];
    },
  });

  const patients = Array.isArray(patientsData) ? patientsData : [];

  const filteredPatients = patients.filter((patient: any) =>
    `${patient.User?.firstName} ${patient.User?.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const activePatients = filteredPatients.filter((p: any) => p.status === 'active');
  const allPatients = filteredPatients;

  const PatientCard = ({ patient }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              {patient.User?.firstName?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {patient.User?.firstName} {patient.User?.lastName}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {patient.User?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                {patient.User?.phone}
              </div>
            </div>
          </div>
          <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
            {patient.status || 'Active'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Age: {patient.dateOfBirth ? 
                  Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365)) 
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="line-clamp-2">{patient.address || 'Address not provided'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Last Visit: {patient.lastVisit || 'No visits yet'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span>Status: Stable</span>
            </div>
          </div>
        </div>

        {patient.medicalHistory && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">Medical History</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {patient.medicalHistory}
            </p>
          </div>
        )}

        {patient.allergies && (
          <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-medium text-sm mb-1 text-destructive">Allergies</h4>
            <p className="text-sm text-destructive/80">
              {patient.allergies}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1 gap-2">
            <FileText className="h-4 w-4" />
            View History
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Visit
          </Button>
          <Button variant="outline" className="flex-1 gap-2">
            <Phone className="h-4 w-4" />
            Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              My Patients
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your patient care
            </p>
          </div>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{activePatients.length}</div>
              <p className="text-sm text-muted-foreground">Active Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{allPatients.length}</div>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {allPatients.filter((p: any) => p.lastVisit === 'Today').length}
              </div>
              <p className="text-sm text-muted-foreground">Visits Today</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              Active Patients
              <Badge variant="secondary">{activePatients.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="all" className="gap-2">
              All Patients
              <Badge variant="secondary">{allPatients.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activePatients.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {activePatients.map((patient: any) => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No active patients</h3>
                  <p className="text-muted-foreground">
                    Patients you're currently caring for will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {allPatients.map((patient: any) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Patients;