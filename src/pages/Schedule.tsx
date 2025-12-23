import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AvailabilityManager } from "@/components/booking/AvailabilityManager";
import { TimeSlotViewer } from "@/components/booking/TimeSlotViewer";
import { RescheduleModal } from "@/components/booking/RescheduleModal";
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
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);

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

  const handleReschedule = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const canReschedule = (appointment: any) => {
    const cutoffHours = parseInt(import.meta.env.VITE_RESCHEDULE_CUTOFF_HOURS) || 12;
    const maxReschedules = parseInt(import.meta.env.VITE_MAX_RESCHEDULES_PER_APPOINTMENT) || 2;
    
    const hoursUntilAppointment = (new Date(appointment.scheduledDate) - new Date()) / (1000 * 60 * 60);
    const rescheduleCount = appointment.rescheduleCount || 0;
    
    return hoursUntilAppointment >= cutoffHours && 
           rescheduleCount < maxReschedules &&
           appointment.status === 'session_waiting';
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
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your appointments and availability
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold">{confirmedAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Confirmed Appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xl font-bold">{completedAppointments.length}</div>
              <p className="text-xs text-muted-foreground">Completed Appointments</p>
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
            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Confirmed Appointments</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Appointments with booking fee paid, awaiting session
                </p>
              </div>
              <CardContent className="p-0">
                {confirmedAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                        <TableHead className="text-xs font-semibold">Patient</TableHead>
                        <TableHead className="text-xs font-semibold">Service</TableHead>
                        <TableHead className="text-xs font-semibold">Session Type</TableHead>
                        <TableHead className="text-xs font-semibold">Payment Status</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {confirmedAppointments.map((appointment: any) => {
                        const bookingFeePaid = appointment.bookingFeeStatus === 'completed';
                        const sessionFeePaid = appointment.sessionFeeStatus === 'completed';

                        return (
                          <TableRow key={appointment.id} className="hover:bg-muted/30">
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {new Date(appointment.scheduledDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                  {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">ID: #{appointment.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                              <p className="text-xs text-muted-foreground">{appointment.TimeSlot?.duration || 180} min</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {appointment.sessionType === 'video' || appointment.sessionType === 'teleconference' ? (
                                  <>
                                    <Video className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">Video Call</span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">In-Person</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant={bookingFeePaid ? 'default' : 'outline'}
                                  className={`text-xs w-fit ${bookingFeePaid ? 'bg-green-100 text-green-800' : ''}`}
                                >
                                  {bookingFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Booking
                                </Badge>
                                <Badge
                                  variant={sessionFeePaid ? 'default' : 'outline'}
                                  className={`text-xs w-fit ${sessionFeePaid ? 'bg-blue-100 text-blue-800' : ''}`}
                                >
                                  {sessionFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Session
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/appointment/${appointment.id}`)}
                                  className="h-7 text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReschedule(appointment)}
                                  disabled={!canReschedule(appointment)}
                                  className="h-7 text-xs"
                                >
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Reschedule
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => navigate(`/dashboard/reports?appointment=${appointment.id}`)}
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Complete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-semibold text-sm mb-1">No confirmed appointments</h3>
                    <p className="text-xs text-muted-foreground">
                      Confirmed appointments will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <Card>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Completed Appointments</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Sessions completed with reports submitted
                </p>
              </div>
              <CardContent className="p-0">
                {completedAppointments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                        <TableHead className="text-xs font-semibold">Patient</TableHead>
                        <TableHead className="text-xs font-semibold">Service</TableHead>
                        <TableHead className="text-xs font-semibold">Session Type</TableHead>
                        <TableHead className="text-xs font-semibold">Payment Status</TableHead>
                        <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedAppointments.map((appointment: any) => {
                        const bookingFeePaid = appointment.bookingFeeStatus === 'completed';
                        const sessionFeePaid = appointment.sessionFeeStatus === 'completed';

                        return (
                          <TableRow key={appointment.id} className="hover:bg-muted/30">
                            <TableCell className="text-xs">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {new Date(appointment.scheduledDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                  {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">ID: #{appointment.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                              <p className="text-xs text-muted-foreground">{appointment.TimeSlot?.duration || 180} min</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {appointment.sessionType === 'video' || appointment.sessionType === 'teleconference' ? (
                                  <>
                                    <Video className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">Video Call</span>
                                  </>
                                ) : (
                                  <>
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm">In-Person</span>
                                  </>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant={bookingFeePaid ? 'default' : 'outline'}
                                  className={`text-xs w-fit ${bookingFeePaid ? 'bg-green-100 text-green-800' : ''}`}
                                >
                                  {bookingFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Booking
                                </Badge>
                                <Badge
                                  variant={sessionFeePaid ? 'default' : 'outline'}
                                  className={`text-xs w-fit ${sessionFeePaid ? 'bg-blue-100 text-blue-800' : ''}`}
                                >
                                  {sessionFeePaid ? <CheckCircle className="h-3 w-3 mr-1" /> : <DollarSign className="h-3 w-3 mr-1" />}
                                  Session
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/appointment/${appointment.id}`)}
                                className="h-7 text-xs"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-semibold text-sm mb-1">No completed appointments</h3>
                    <p className="text-xs text-muted-foreground">
                      Completed appointments will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability">
            <AvailabilityManager />
          </TabsContent>

          <TabsContent value="timeslots">
            <TimeSlotViewer />
          </TabsContent>
        </Tabs>

        {/* Reschedule Modal */}
        <RescheduleModal
          open={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setAppointmentToReschedule(null);
          }}
          appointment={appointmentToReschedule}
          onRescheduleSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["caregiver-appointments"] });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Schedule;