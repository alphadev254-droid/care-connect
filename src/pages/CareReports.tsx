import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
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

const reports = [
  {
    id: 1,
    date: "2024-12-12",
    caregiver: "Dr. Sarah Johnson",
    type: "Care Session Report",
    status: "Stable",
    vitals: {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.6°F",
      oxygenLevel: "98%",
    },
    notes: "Patient is showing good progress. Medication adherence is excellent. Recommend continuing current treatment plan.",
  },
  {
    id: 2,
    date: "2024-12-10",
    caregiver: "Michael Chen",
    type: "Physiotherapy Report",
    status: "Improving",
    vitals: {
      bloodPressure: "118/78",
      heartRate: "70 bpm",
      temperature: "98.4°F",
      oxygenLevel: "99%",
    },
    notes: "Range of motion has improved by 15%. Patient is able to perform exercises independently. Continue daily stretching routine.",
  },
  {
    id: 3,
    date: "2024-12-05",
    caregiver: "Dr. Sarah Johnson",
    type: "Care Session Report",
    status: "Stable",
    vitals: {
      bloodPressure: "122/82",
      heartRate: "74 bpm",
      temperature: "98.5°F",
      oxygenLevel: "97%",
    },
    notes: "Routine checkup completed. All vitals within normal range. Patient reports no new symptoms or concerns.",
  },
];

const CareReports = () => {
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

  return (
    <DashboardLayout userRole="patient">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Care Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            View your healthcare session reports and health history
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
                  <p className="text-2xl font-bold">Stable</p>
                  <p className="text-sm text-muted-foreground">Current Status</p>
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
                  <p className="text-2xl font-bold">72 bpm</p>
                  <p className="text-sm text-muted-foreground">Heart Rate</p>
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
                  <p className="text-2xl font-bold">120/80</p>
                  <p className="text-sm text-muted-foreground">Blood Pressure</p>
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
                  <p className="text-2xl font-bold">98.6°F</p>
                  <p className="text-sm text-muted-foreground">Temperature</p>
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
            {reports.map((report) => (
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-xl mb-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Blood Pressure</p>
                      <p className="font-semibold">{report.vitals.bloodPressure}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Heart Rate</p>
                      <p className="font-semibold">{report.vitals.heartRate}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Temperature</p>
                      <p className="font-semibold">{report.vitals.temperature}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Oxygen Level</p>
                      <p className="font-semibold">{report.vitals.oxygenLevel}</p>
                    </div>
                  </div>

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
            ))}
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
