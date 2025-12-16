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
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MoreVertical,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Appointments = () => {
  const { user } = useAuth();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments");
      return response.data.appointments || [];
    },
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "confirmed" || apt.status === "pending"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "completed":
        return "bg-muted text-muted-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "";
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: typeof appointments[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-lg font-bold">
              {(appointment.caregiver || appointment.Caregiver?.User?.firstName || 'C').charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold">{appointment.caregiver || `${appointment.Caregiver?.User?.firstName || ''} ${appointment.Caregiver?.User?.lastName || ''}`.trim() || 'Caregiver'}</h3>
              <p className="text-sm text-muted-foreground">{appointment.Specialty?.name || appointment.specialty || 'General Care'}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
                {appointment.paymentStatus === 'completed' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Paid
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(appointment.scheduledDate || appointment.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric"
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.TimeSlot ? 
              `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` : 
              new Date(appointment.scheduledDate || appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {appointment.sessionType === "teleconference" || appointment.type === "video" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{appointment.sessionType === "teleconference" || appointment.type === "video" ? "Video Call" : "In-Person Visit"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">MWK {appointment.totalCost || appointment.TimeSlot?.price || 'N/A'}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-1">Notes:</p>
            <p className="text-sm text-muted-foreground">{appointment.notes}</p>
          </div>
        )}

        {(appointment.status === "confirmed" || appointment.status === "pending") && (
          <div className="flex gap-2 mt-6 pt-4 border-t">
            {appointment.type === "video" ? (
              <Button className="flex-1 gap-2">
                <Video className="h-4 w-4" />
                Join Call
              </Button>
            ) : (
              <Button variant="outline" className="flex-1 gap-2">
                <Phone className="h-4 w-4" />
                Contact
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              Reschedule
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

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
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your healthcare appointments
          </p>
        </div>



        {/* Appointments Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              Upcoming
              <Badge variant="secondary">{upcomingAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              Past
              <Badge variant="secondary">{pastAppointments.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No upcoming appointments</h3>
                  <p className="text-muted-foreground">
                    Your confirmed appointments will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
