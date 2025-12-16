import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AvailabilityManager } from "@/components/booking/AvailabilityManager";
import { TimeSlotViewer } from "@/components/booking/TimeSlotViewer";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Check,
  X,
  Phone,
} from "lucide-react";

const Schedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["caregiver-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments/caregiver");
      return response.data.appointments || [];
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await api.put(`/appointments/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caregiver-appointments"] });
      toast.success("Appointment updated successfully");
    },
    onError: () => {
      toast.error("Failed to update appointment");
    },
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  const handleAccept = (id: number) => {
    updateAppointmentMutation.mutate({ id, status: 'confirmed' });
  };

  const handleDecline = (id: number) => {
    updateAppointmentMutation.mutate({ id, status: 'cancelled' });
  };

  const AppointmentCard = ({ appointment, showActions = false }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-semibold">
                {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {appointment.Specialty?.name || 'General Care'}
              </p>
            </div>
          </div>
          <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
            {appointment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(appointment.scheduledDate).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            {appointment.sessionType === 'video' ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{appointment.sessionType === 'video' ? 'Video Call' : 'In-Person Visit'}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleAccept(appointment.id)}
              disabled={updateAppointmentMutation.isPending}
              className="flex-1 gap-2"
            >
              <Check className="h-4 w-4" />
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDecline(appointment.id)}
              disabled={updateAppointmentMutation.isPending}
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Decline
            </Button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1 gap-2">
              <Phone className="h-4 w-4" />
              Contact Patient
            </Button>
            {appointment.sessionType === 'video' && (
              <Button className="flex-1 gap-2">
                <Video className="h-4 w-4" />
                Start Session
              </Button>
            )}
          </div>
        )}
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
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            My Schedule
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your appointments and availability
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{pendingAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{confirmedAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Confirmed Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{completedAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Completed This Week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending Requests
              <Badge variant="secondary">{pendingAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="gap-2">
              Confirmed
              <Badge variant="secondary">{confirmedAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed
              <Badge variant="secondary">{completedAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="availability">
              Availability
            </TabsTrigger>
            <TabsTrigger value="timeslots">
              Time Slots
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAppointments.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {pendingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} showActions={true} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">
                    New appointment requests will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {confirmedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {completedAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManager />
          </TabsContent>

          <TabsContent value="timeslots">
            <TimeSlotViewer />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Schedule;