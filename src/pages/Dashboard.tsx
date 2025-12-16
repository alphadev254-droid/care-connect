import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentService } from "@/services/appointmentService";
import { reportService } from "@/services/reportService";
import { api } from "@/lib/api";
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
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch admin data for system managers
  const { data: adminData } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const [usersRes, pendingRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/caregivers/pending")
      ]);
      return {
        users: usersRes.data.users || [],
        pendingCaregivers: pendingRes.data.caregivers || []
      };
    },
    enabled: user?.role === 'system_manager' || user?.role === 'regional_manager'
  });

  // Fetch caregiver data for non-admin users
  const { data: caregiversData } = useQuery({
    queryKey: ["public", "caregivers"],
    queryFn: async () => {
      const response = await api.get("/public/caregivers");
      return response.data.caregivers || [];
    },
    enabled: user?.role !== 'system_manager' && user?.role !== 'regional_manager'
  });

  // Fetch appointments
  const { data: appointmentsData, isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentService.getAppointments({ limit: 5 }),
  });

  // Fetch reports
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ["reports"],
    queryFn: () => reportService.getReports({ limit: 5 }),
  });

  const upcomingAppointments = appointmentsData?.appointments || [];
  const recentReports = reportsData?.reports || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  const getQuickActions = () => {
    const role = user?.role || 'patient';
    
    switch (role) {
      case 'system_manager':
      case 'regional_manager':
        return [
          {
            icon: Search,
            label: "Administration",
            description: "Manage caregivers & users",
            href: "/dashboard/admin",
            color: "primary",
          },
          {
            icon: FileText,
            label: "Reports",
            description: "System analytics",
            href: "/dashboard/reports",
            color: "secondary",
          },
          {
            icon: Activity,
            label: "User Management",
            description: "Manage all users",
            href: "/dashboard/admin",
            color: "accent",
          },
          {
            icon: Bell,
            label: "Settings",
            description: "System configuration",
            href: "/dashboard/settings",
            color: "success",
          },
        ];
      case 'caregiver':
        return [
          {
            icon: Calendar,
            label: "My Schedule",
            description: "View appointments & requests",
            href: "/dashboard/schedule",
            color: "primary",
          },
          {
            icon: Search,
            label: "My Patients",
            description: "Manage patient care",
            href: "/dashboard/patients",
            color: "secondary",
          },
          {
            icon: Video,
            label: "Start Session",
            description: "Begin teleconference",
            href: "/dashboard/teleconference",
            color: "accent",
          },
          {
            icon: FileText,
            label: "Earnings",
            description: "Track your income",
            href: "/dashboard/earnings",
            color: "success",
          },
        ];
      case 'primary_physician':
        return [
          {
            icon: Search,
            label: "My Patients",
            description: "Monitor patient health",
            href: "/dashboard/patients",
            color: "primary",
          },
          {
            icon: Star,
            label: "Recommendations",
            description: "Recommend caregivers",
            href: "/dashboard/recommendations",
            color: "secondary",
          },
          {
            icon: FileText,
            label: "Health Reports",
            description: "Review care reports",
            href: "/dashboard/reports",
            color: "accent",
          },
          {
            icon: Activity,
            label: "Analytics",
            description: "Patient outcomes",
            href: "/dashboard/analytics",
            color: "success",
          },
        ];
      default: // patient
        return [
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
            href: "/dashboard/appointments",
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
    }
  };

  const quickActions = getQuickActions();

  return (
    <DashboardLayout userRole={user?.role === 'system_manager' || user?.role === 'regional_manager' ? 'admin' : (user?.role || "patient")}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Welcome back, {user?.firstName || "User"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'system_manager' || user?.role === 'regional_manager'
                ? "System overview and management dashboard"
                : user?.role === 'caregiver' 
                ? "Manage your patients and schedule efficiently"
                : user?.role === 'primary_physician'
                ? "Monitor patient health and recommend care"
                : "Here's an overview of your healthcare journey"
              }
            </p>
          </div>
          {user?.role === 'patient' && (
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
          )}
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
          {/* Role-based main content */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">
                  {user?.role === 'system_manager' || user?.role === 'regional_manager'
                    ? "Recent User Activity"
                    : user?.role === 'caregiver' 
                    ? "Pending Requests"
                    : user?.role === 'primary_physician'
                    ? "Patient Overview"
                    : "Upcoming Appointments"
                  }
                </CardTitle>
                <CardDescription>
                  {user?.role === 'system_manager' || user?.role === 'regional_manager'
                    ? "Latest registrations and system activity"
                    : user?.role === 'caregiver' 
                    ? "New appointment requests awaiting your response"
                    : user?.role === 'primary_physician'
                    ? "Patients under your care"
                    : "Your scheduled care sessions"
                  }
                </CardDescription>
              </div>
              <Link to={user?.role === 'caregiver' ? "/dashboard/schedule" : "/dashboard/appointments"}>
                <Button variant="ghost" size="sm" className="gap-1">
                  View All <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                <div className="space-y-4">
                  {adminData?.users?.slice(0, 5).map((user: any) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {user.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground capitalize">{user.Role?.name?.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={user.isActive ? "default" : "secondary"}
                          className="capitalize"
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  )) || []}
                  {(!adminData?.users || adminData.users.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  )}
                </div>
              ) : loadingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 3).map((appointment: any) => {
                    const caregiverName = appointment.Caregiver?.User
                      ? `${appointment.Caregiver.User.firstName} ${appointment.Caregiver.User.lastName}`
                      : "Caregiver";
                    const specialtyName = appointment.Specialty?.name || "General Care";

                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                            {caregiverName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{caregiverName}</p>
                            <p className="text-sm text-muted-foreground">{specialtyName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatDate(appointment.scheduledDate)}
                          </div>
                          <Badge
                            variant={appointment.status === "confirmed" ? "default" : "secondary"}
                            className="mt-1 capitalize"
                          >
                            {appointment.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingAppointments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No upcoming appointments
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role-based sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                {user?.role === 'system_manager' || user?.role === 'regional_manager'
                  ? "System Status"
                  : user?.role === 'caregiver' 
                  ? "Today's Summary"
                  : user?.role === 'primary_physician'
                  ? "Patient Status"
                  : "Health Overview"
                }
              </CardTitle>
              <CardDescription>
                {user?.role === 'system_manager' || user?.role === 'regional_manager'
                  ? "Overall system health and statistics"
                  : user?.role === 'caregiver' 
                  ? "Your daily activity summary"
                  : user?.role === 'primary_physician'
                  ? "Overall patient health status"
                  : "Your current health status"
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                <div className="text-center p-6 rounded-xl bg-primary/10">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-primary">Online</p>
                  <p className="text-sm text-muted-foreground">System Status</p>
                </div>
              ) : (
                <div className="text-center p-6 rounded-xl bg-success/10">
                  <Activity className="h-8 w-8 text-success mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-success">Stable</p>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-semibold text-sm">
                  {user?.role === 'system_manager' || user?.role === 'regional_manager'
                    ? "Recent Activity"
                    : "Recent Reports"
                  }
                </h4>
                {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                  adminData?.pendingCaregivers?.slice(0, 3).map((caregiver: any) => (
                    <div
                      key={caregiver.id}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{caregiver.firstName} {caregiver.lastName}</p>
                        <p className="text-xs text-muted-foreground">Pending Approval</p>
                      </div>
                      <Badge variant="outline" className="text-warning border-warning">
                        Pending
                      </Badge>
                    </div>
                  )) || (
                    <p className="text-sm text-muted-foreground text-center py-4">No pending approvals</p>
                  )
                ) : loadingReports ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentReports.length > 0 ? (
                  recentReports.slice(0, 3).map((report: any) => {
                    const reportDate = new Date(report.createdAt || report.Appointment?.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const statusColor = {
                      stable: "text-success border-success",
                      improving: "text-primary border-primary",
                      deteriorating: "text-warning border-warning",
                      critical: "text-destructive border-destructive",
                      cured: "text-success border-success",
                      deceased: "text-muted-foreground border-muted-foreground"
                    }[report.patientStatus] || "text-muted-foreground border-muted-foreground";

                    return (
                      <div
                        key={report.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{reportDate}</p>
                          <p className="text-xs text-muted-foreground">Care Session Report</p>
                        </div>
                        <Badge variant="outline" className={`capitalize ${statusColor}`}>
                          {report.patientStatus}
                        </Badge>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No reports yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-based bottom section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">
                {user?.role === 'caregiver' 
                  ? "Recent Patients"
                  : user?.role === 'primary_physician'
                  ? "Recommended Caregivers"
                  : "Recommended for You"
                }
              </CardTitle>
              <CardDescription>
                {user?.role === 'caregiver' 
                  ? "Patients you've recently provided care for"
                  : user?.role === 'primary_physician'
                  ? "Top-rated caregivers for your patients"
                  : "Caregivers matching your healthcare needs"
                }
              </CardDescription>
            </div>
            <Link to={user?.role === 'caregiver' ? "/dashboard/patients" : "/dashboard/caregivers"}>
              <Button variant="ghost" size="sm" className="gap-1">
                {user?.role === 'caregiver' ? "View All" : "Browse All"} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {user?.role === 'system_manager' || user?.role === 'regional_manager' ? (
                // Show real admin stats
                <>
                  <div className="p-4 rounded-xl border bg-primary/5">
                    <h4 className="font-semibold text-primary">Total Users</h4>
                    <p className="text-2xl font-bold">{adminData?.users?.length || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-warning/5">
                    <h4 className="font-semibold text-warning">Pending Approvals</h4>
                    <p className="text-2xl font-bold">{adminData?.pendingCaregivers?.length || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-success/5">
                    <h4 className="font-semibold text-success">Active Caregivers</h4>
                    <p className="text-2xl font-bold">{adminData?.users?.filter((u: any) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0}</p>
                  </div>
                </>
              ) : (
                // Show real caregivers for other roles
                caregiversData?.slice(0, 3).map((caregiver: any) => (
                  <div
                    key={caregiver.id}
                    className="p-4 rounded-xl border hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                        {caregiver.firstName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-semibold">{caregiver.firstName} {caregiver.lastName}</p>
                        <div className="flex items-center gap-1 text-sm text-accent">
                          <Star className="h-3 w-3 fill-current" />
                          <span>4.9</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mb-3">{caregiver.Caregiver?.qualifications || 'Healthcare Professional'}</Badge>
                    <p className="text-sm text-muted-foreground mb-4">
                      {caregiver.Caregiver?.experience || 0} years experience • ${caregiver.Caregiver?.hourlyRate || 50}/hr
                    </p>
                    <Link to="/dashboard/caregivers">
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                )) || [1, 2, 3].map((i) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
