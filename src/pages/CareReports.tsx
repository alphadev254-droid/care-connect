import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import AdminReports from "./AdminReports";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Activity,
  Heart,
  Thermometer,
  Droplet,
} from "lucide-react";

const CareReports = () => {
  const { user } = useAuth();

  // Redirect admin users to admin reports
  if (user?.role === 'system_manager' || user?.role === 'regional_manager') {
    return <AdminReports />;
  }

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ["reports", user?.role],
    queryFn: async () => {
      const endpoint = user?.role === 'caregiver' 
        ? '/reports/caregiver'
        : user?.role === 'primary_physician'
        ? '/reports/physician'
        : '/reports';
      const response = await api.get(endpoint);
      return response.data.reports || [];
    },
  });

  const rawReports = Array.isArray(reportsData) ? reportsData : [];
  
  // Map backend data to frontend format
  const reports = rawReports.map((report: any) => ({
    id: report.id,
    type: "Care Session Report",
    caregiver: `${report.Appointment?.Patient?.User?.firstName || 'Unknown'} ${report.Appointment?.Patient?.User?.lastName || 'Patient'}`,
    date: report.createdAt,
    status: report.patientStatus?.charAt(0).toUpperCase() + report.patientStatus?.slice(1) || 'Stable',
    vitals: report.vitals || {},
    notes: report.observations || report.sessionSummary || 'No notes available'
  }));
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Stable":
        return "bg-success/10 text-success border-success/20";
      case "Improving":
        return "bg-primary/10 text-primary border-primary/20";
      case "Deteriorating":
        return "bg-warning/10 text-warning border-warning/20";
      case "Critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {user?.role === 'caregiver' 
              ? 'Session Reports'
              : user?.role === 'primary_physician'
              ? 'Patient Reports'
              : 'Care Reports'
            }
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'caregiver' 
              ? 'Reports from your care sessions with patients'
              : user?.role === 'primary_physician'
              ? 'Monitor patient health and care outcomes'
              : 'View your healthcare session reports and health history'
            }
          </p>
        </div>

        {/* Health Overview */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.length}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'Stable').length}</p>
                  <p className="text-sm text-muted-foreground">Stable Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Droplet className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{reports.filter(r => r.status === 'Improving').length}</p>
                  <p className="text-sm text-muted-foreground">Improving</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Thermometer className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Reports</TabsTrigger>
            <TabsTrigger value="care">Care Sessions</TabsTrigger>
            <TabsTrigger value="therapy">Therapy</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {reports.length > 0 ? reports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {report.caregiver.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{report.type}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {report.caregiver}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(report.status)} variant="outline">
                        {report.status}
                      </Badge>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Vitals */}
                  {Object.keys(report.vitals).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl mb-4">
                      {report.vitals.bloodPressure && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Blood Pressure</p>
                          <p className="font-semibold">{report.vitals.bloodPressure}</p>
                        </div>
                      )}
                      {report.vitals.heartRate && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Heart Rate</p>
                          <p className="font-semibold">{report.vitals.heartRate}</p>
                        </div>
                      )}
                      {report.vitals.temperature && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Temperature</p>
                          <p className="font-semibold">{report.vitals.temperature}</p>
                        </div>
                      )}
                      {report.vitals.oxygenLevel && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Oxygen Level</p>
                          <p className="font-semibold">{report.vitals.oxygenLevel}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-xl mb-4 text-center">
                      <p className="text-sm text-muted-foreground">No vitals recorded for this session</p>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Caregiver Notes
                    </h4>
                    <p className="text-muted-foreground">{report.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No reports available</h3>
                  <p className="text-muted-foreground">
                    {user?.role === 'caregiver' 
                      ? 'Your session reports will appear here after completing care sessions'
                      : 'Your care reports will be available once sessions are completed'
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="care" className="space-y-4">
            {reports
              .filter((r) => r.type === "Care Session Report")
              .map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {report.caregiver.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{report.caregiver}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(report.status)} variant="outline">
                        {report.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="therapy" className="space-y-4">
            {reports
              .filter((r) => r.type === "Physiotherapy Report")
              .map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {report.caregiver.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{report.caregiver}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(report.status)} variant="outline">
                        {report.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CareReports;
