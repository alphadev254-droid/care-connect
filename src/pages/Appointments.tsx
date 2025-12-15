import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MoreVertical,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const appointments = [
  {
    id: 1,
    caregiver: "Dr. Sarah Johnson",
    specialty: "Nursing Care",
    date: "2024-12-15",
    time: "2:00 PM",
    duration: "1 hour",
    type: "in-person",
    status: "confirmed",
    location: "Home Visit",
  },
  {
    id: 2,
    caregiver: "Michael Chen",
    specialty: "Physiotherapy",
    date: "2024-12-16",
    time: "10:00 AM",
    duration: "45 min",
    type: "video",
    status: "pending",
    location: "Video Call",
  },
  {
    id: 3,
    caregiver: "Grace Okonkwo",
    specialty: "Geriatric Care",
    date: "2024-12-18",
    time: "3:30 PM",
    duration: "1 hour",
    type: "in-person",
    status: "confirmed",
    location: "Home Visit",
  },
  {
    id: 4,
    caregiver: "Dr. Sarah Johnson",
    specialty: "Nursing Care",
    date: "2024-12-10",
    time: "2:00 PM",
    duration: "1 hour",
    type: "in-person",
    status: "completed",
    location: "Home Visit",
  },
  {
    id: 5,
    caregiver: "Emily Thompson",
    specialty: "Pediatric Care",
    date: "2024-12-08",
    time: "11:00 AM",
    duration: "1 hour",
    type: "video",
    status: "cancelled",
    location: "Video Call",
  },
];

const Appointments = () => {
  const [currentDate] = useState(new Date());

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
              {appointment.caregiver.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold">{appointment.caregiver}</h3>
              <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
              <Badge className={`mt-2 ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </Badge>
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
            <span>{new Date(appointment.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.time} ({appointment.duration})</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            {appointment.type === "video" ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{appointment.location}</span>
          </div>
        </div>

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

  return (
    <DashboardLayout userRole="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Appointments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your healthcare appointments
            </p>
          </div>
          <Button className="gap-2 bg-gradient-primary">
            <Plus className="h-4 w-4" />
            Book Appointment
          </Button>
        </div>

        {/* Calendar Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardTitle>
              <CardDescription>Your schedule overview</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 6 + 1;
                const isToday = day === currentDate.getDate();
                const hasAppointment = appointments.some(
                  (apt) => new Date(apt.date).getDate() === day && day > 0 && day <= 31
                );
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-sm ${
                      day < 1 || day > 31
                        ? "text-muted-foreground/30"
                        : isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : hasAppointment
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted cursor-pointer"
                    }`}
                  >
                    {day > 0 && day <= 31 ? day : ""}
                    {hasAppointment && day > 0 && day <= 31 && (
                      <div className="h-1 w-1 bg-primary rounded-full mx-auto mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

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
                  <p className="text-muted-foreground mb-4">
                    Book your first appointment with a caregiver
                  </p>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Book Appointment
                  </Button>
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
