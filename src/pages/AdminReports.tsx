import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  BarChart3,
  Users,
  Activity,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Heart,
} from "lucide-react";
import { generatePDFReport } from "@/components/ReportPDF";

const AdminReports = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  // Remove non-existent API call
  const isLoading = false;

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.users || [];
    },
  });

  const stats = [
    {
      title: "Total Users",
      value: usersData?.length || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Caregivers",
      value: usersData?.filter((u: any) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0,
      icon: Heart,
      color: "bg-success/10 text-success",
    },
    {
      title: "Total Patients",
      value: usersData?.filter((u: any) => u.Role?.name === 'patient')?.length || 0,
      icon: Activity,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Pending Approvals",
      value: usersData?.filter((u: any) => u.Role?.name === 'caregiver' && !u.isActive)?.length || 0,
      icon: TrendingUp,
      color: "bg-accent/10 text-accent",
    },
  ];

  const caregiversBySpecialty = [
    { specialty: "General Care", count: 15, percentage: 35 },
    { specialty: "Elderly Care", count: 12, percentage: 28 },
    { specialty: "Nursing Care", count: 8, percentage: 19 },
    { specialty: "Physical Therapy", count: 5, percentage: 12 },
    { specialty: "Mental Health", count: 3, percentage: 6 },
  ];

  const appointmentStats = [
    { status: "Completed", count: 145, color: "bg-success" },
    { status: "Scheduled", count: 32, color: "bg-primary" },
    { status: "Cancelled", count: 8, color: "bg-destructive" },
    { status: "Pending", count: 12, color: "bg-warning" },
  ];

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">System Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive system analytics and performance metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                generatePDFReport(usersData || [], stats, selectedPeriod);
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="caregivers">Caregiver Analytics</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Caregiver Distribution by Specialty</CardTitle>
                  <CardDescription>Breakdown of caregivers by their specializations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {caregiversBySpecialty.length > 0 ? (
                      <div className="text-center py-8">
                        <p className="text-lg font-semibold">{caregiversBySpecialty.length}</p>
                        <p className="text-sm text-muted-foreground">Total Caregivers</p>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No caregivers registered yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appointment Statistics</CardTitle>
                  <CardDescription>Current appointment status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Appointment statistics will be available when appointments are created</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <BarChart3 className="h-8 w-8 mx-auto text-primary mb-2" />
                    <p className="text-2xl font-bold">{usersData?.filter((u: any) => u.isActive)?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Users className="h-8 w-8 mx-auto text-success mb-2" />
                    <p className="text-2xl font-bold">{usersData?.filter((u: any) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Caregivers</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <TrendingUp className="h-8 w-8 mx-auto text-accent mb-2" />
                    <p className="text-2xl font-bold">{usersData?.filter((u: any) => u.Role?.name === 'patient')?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Caregiver Performance</CardTitle>
                <CardDescription>Analytics on caregiver activity and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Detailed Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Comprehensive caregiver performance metrics will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Analytics</CardTitle>
                <CardDescription>Detailed appointment statistics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Appointment Reports</h3>
                  <p className="text-muted-foreground">
                    Detailed appointment analytics and scheduling patterns
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Audits</CardTitle>
                <CardDescription>System compliance monitoring and audit reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Compliance Dashboard</h3>
                  <p className="text-muted-foreground">
                    Regulatory compliance tracking and audit management
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;