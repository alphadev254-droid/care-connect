import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Calendar,
  Search,
  FileText,
  Video,
  Clock,
  ArrowRight,
  Star,
  Activity,
  Bell,
} from "lucide-react";

const Dashboard = () => {
  const upcomingAppointments = [
    {
      id: 1,
      caregiver: "Dr. Sarah Johnson",
      specialty: "Nursing Care",
      date: "Today, 2:00 PM",
      status: "confirmed",
    },
    {
      id: 2,
      caregiver: "Michael Chen",
      specialty: "Physiotherapy",
      date: "Tomorrow, 10:00 AM",
      status: "pending",
    },
  ];

  const recentReports = [
    {
      id: 1,
      date: "Dec 12, 2024",
      caregiver: "Dr. Sarah Johnson",
      status: "Stable",
    },
    {
      id: 2,
      date: "Dec 10, 2024",
      caregiver: "Michael Chen",
      status: "Improving",
    },
  ];

  const quickActions = [
    {
      icon: Search,
      label: "Find Caregiver",
      description: "Browse verified caregivers",
      href: "/dashboard/caregivers",
      color: "primary",
    },
    {
      icon: Calendar,
      label: "Book Appointment",
      description: "Schedule a new session",
      href: "/dashboard/appointments/new",
      color: "secondary",
    },
    {
      icon: Video,
      label: "Start Teleconference",
      description: "Connect via video call",
      href: "/dashboard/teleconference",
      color: "accent",
    },
    {
      icon: FileText,
      label: "View Reports",
      description: "Access care reports",
      href: "/dashboard/reports",
      color: "success",
    },
  ];

  return (
    <DashboardLayout userRole="patient">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Welcome back, John! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your healthcare journey
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <Badge variant="destructive" className="ml-1">3</Badge>
            </Button>
            <Link to="/dashboard/caregivers">
              <Button className="gap-2 bg-gradient-primary">
                <Search className="h-4 w-4" />
                Find Caregiver
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`h-12 w-12 rounded-xl bg-${action.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-6 w-6 text-${action.color}`} />
                  </div>
                  <h3 className="font-semibold mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Upcoming Appointments</CardTitle>
                <CardDescription>Your scheduled care sessions</CardDescription>
              </div>
              <Link to="/dashboard/appointments">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {appointment.caregiver.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{appointment.caregiver}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {appointment.date}
                      </div>
                      <Badge
                        variant={appointment.status === "confirmed" ? "default" : "secondary"}
                        className="mt-1"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {upcomingAppointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming appointments
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Health Overview</CardTitle>
              <CardDescription>Your current health status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 rounded-xl bg-success/10">
                <Activity className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="font-display text-2xl font-bold text-success">Stable</p>
                <p className="text-sm text-muted-foreground">Current Status</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Recent Reports</h4>
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{report.date}</p>
                      <p className="text-xs text-muted-foreground">{report.caregiver}</p>
                    </div>
                    <Badge variant="outline" className="text-success border-success">
                      {report.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Caregivers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Recommended for You</CardTitle>
              <CardDescription>Caregivers matching your healthcare needs</CardDescription>
            </div>
            <Link to="/dashboard/caregivers">
              <Button variant="ghost" size="sm" className="gap-1">
                Browse All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      C{i}
                    </div>
                    <div>
                      <p className="font-semibold">Caregiver {i}</p>
                      <div className="flex items-center gap-1 text-sm text-accent">
                        <Star className="h-3 w-3 fill-current" />
                        <span>4.9</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mb-3">Nursing Care</Badge>
                  <p className="text-sm text-muted-foreground mb-4">
                    5+ years experience in home healthcare
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
