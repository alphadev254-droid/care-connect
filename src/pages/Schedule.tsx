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
  DollarSign,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["caregiver-appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments");
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

  const confirmedAppointments = appointments.filter(apt => apt.bookingFeeStatus === 'completed' && apt.status === 'session_waiting');
  const completedAppointments = appointments.filter(apt => apt.paymentStatus === 'completed' && apt.status === 'session_attended');

  const AppointmentCard = ({ appointment }: any) => {
    const bookingFeePaid = appointment.bookingFeeStatus === 'completed';
    const sessionFeePaid = appointment.sessionFeeStatus === 'completed';

    return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {appointment.Specialty?.name || 'General Care'}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={appointment.status === 'session_waiting' ? 'default' : 'secondary'} className="text-xs">
              {appointment.status === 'session_waiting' ? 'Confirmed' : appointment.status}
            </Badge>
            <div className="flex gap-1">
              <Badge
                variant={bookingFeePaid ? 'default' : 'outline'}
                className={`text-xs ${bookingFeePaid ? 'bg-green-100 text-green-800' : ''}`}
              >
                {bookingFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                Booking
              </Badge>
              <Badge
                variant={sessionFeePaid ? 'default' : 'outline'}
                className={`text-xs ${sessionFeePaid ? 'bg-blue-100 text-blue-800' : ''}`}
              >
                {sessionFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                Session
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</span>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            {appointment.sessionType === 'video' || appointment.sessionType === 'teleconference' ? (
              <Video className="h-3 w-3 text-muted-foreground" />
            ) : (
              <MapPin className="h-3 w-3 text-muted-foreground" />
            )}
            <span>{appointment.sessionType === 'video' || appointment.sessionType === 'teleconference' ? 'Video Call' : 'In-Person Visit'}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mb-3 p-2 bg-muted/50 rounded text-xs">
            <p>{appointment.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/appointment/${appointment.id}`)}
            className="flex-1 gap-1 h-8"
          >
            <Eye className="h-3 w-3" />
            View
          </Button>
          {appointment.status === 'session_waiting' && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate(`/dashboard/reports?appointment=${appointment.id}`)}
              className="flex-1 gap-1 h-8 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-3 w-3" />
              Complete
            </Button>
          )}
        </div>

        {appointment.status === 'session_waiting' && !sessionFeePaid && (
          <div className="pt-3 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Waiting for patient to pay session fee
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    );
  };

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

        <div className="grid sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{confirmedAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Confirmed Appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{completedAppointments.length}</div>
              <p className="text-sm text-muted-foreground">Completed Appointments</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="confirmed" className="space-y-6">
          <TabsList>
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

          <TabsContent value="confirmed" className="space-y-4">
            {confirmedAppointments.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {confirmedAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No confirmed appointments</h3>
                  <p className="text-muted-foreground">
                    Confirmed appointments will appear here
                  </p>
                </CardContent>
              </Card>
            )}
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