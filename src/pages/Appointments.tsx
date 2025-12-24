import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { RescheduleModal } from "@/components/booking/RescheduleModal";
import CancelModal from "@/components/booking/CancelModal";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MoreVertical,
  DollarSign,
  User,
  Mail,
  Home,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const Appointments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isCaregiver = user?.role === 'caregiver';
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [appointmentToReschedule, setAppointmentToReschedule] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const response = await api.get("/appointments");
      return response.data.appointments || [];
    },
  });

  const markAttendedMutation = useMutation({
    mutationFn: async (appointmentId: string) => {
      await api.patch(`/appointments/${appointmentId}/status`, { 
        status: "session_attended" 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const paySessionFeeMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      console.log('Initiating session fee payment for:', appointmentData);
      const response = await api.post('/payments/initiate-session', {
        appointmentId: appointmentData.id
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Session fee payment response:', data);
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        toast.success('Redirecting to payment...');
      } else {
        toast.success('Payment initiated successfully');
      }
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
    }
  });

  const handlePaySessionFee = (appointment: any) => {
    console.log('Pay session fee clicked for appointment:', appointment);
    setSelectedAppointment(appointment);
    paySessionFeeMutation.mutate(appointment);
  };

  const handleShowContact = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowContactDialog(true);
  };

  const handleReschedule = (appointment: any) => {
    setAppointmentToReschedule(appointment);
    setShowRescheduleModal(true);
  };

  const handleCancel = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const cancelAppointmentMutation = useMutation({
    mutationFn: async ({ appointmentId, reason }: { appointmentId: number; reason?: string }) => {
      const response = await api.post(`/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      toast.success('Appointment cancelled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel appointment');
    }
  });

  const canCancel = (appointment: any) => {
    const cutoffHours = 16; // 16 hours before appointment
    const appointmentDateTime = new Date(`${appointment.TimeSlot?.date || appointment.scheduledDate} ${appointment.TimeSlot?.startTime || ''}`);
    const currentTime = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    
    return hoursUntilAppointment >= cutoffHours && 
           (appointment.status === 'session_waiting' || appointment.status === 'pending');
  };

  const canReschedule = (appointment: any) => {
    const cutoffHours = parseInt(import.meta.env.VITE_RESCHEDULE_CUTOFF_HOURS) || 12;
    const maxReschedules = parseInt(import.meta.env.VITE_MAX_RESCHEDULES_PER_APPOINTMENT) || 2;
    
    const hoursUntilAppointment = (new Date(appointment.scheduledDate || appointment.date) - new Date()) / (1000 * 60 * 60);
    const rescheduleCount = appointment.rescheduleCount || 0;
    
    // Debug logging
    console.log('Reschedule check for appointment:', appointment.id, {
      hoursUntilAppointment,
      rescheduleCount,
      maxReschedules,
      cutoffHours,
      status: appointment.status,
      canReschedule: hoursUntilAppointment >= cutoffHours && rescheduleCount < maxReschedules && appointment.status === 'session_waiting'
    });
    
    return hoursUntilAppointment >= cutoffHours && 
           rescheduleCount < maxReschedules &&
           appointment.status === 'session_waiting';
  };

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "session_waiting" || apt.status === "pending"
  );
  const pastAppointments = appointments.filter(
    (apt) => apt.status === "session_attended" || apt.status === "session_cancelled"
  );
  const rescheduledAppointments = appointments.filter(
    (apt) => apt.status === "session_rescheduled"
  );

  const confirmedAppointments = appointments.filter(
    (apt) => apt.bookingFeeStatus === "completed" && apt.status === "session_waiting"
  );
  const completedAppointments = appointments.filter(
    (apt) => apt.paymentStatus === "completed" && apt.status === "session_attended"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "session_waiting":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "session_attended":
        return "bg-success text-success-foreground";
      case "session_cancelled":
        return "bg-destructive text-destructive-foreground";
      case "session_rescheduled":
        return "bg-orange-100 text-orange-800";
      default:
        return "";
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "session_waiting":
        return "Waiting for Session";
      case "session_attended":
        return "Session Completed";
      case "session_cancelled":
        return "Cancelled";
      case "session_rescheduled":
        return "Rescheduled";
      default:
        return status;
    }
  };

  const PatientCard = ({ appointment }: { appointment: typeof appointments[0] }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              {(appointment.caregiver || appointment.Caregiver?.User?.firstName || 'C').charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-sm">{appointment.caregiver || `${appointment.Caregiver?.User?.firstName || ''} ${appointment.Caregiver?.User?.lastName || ''}`.trim() || 'Caregiver'}</h3>
              <p className="text-xs text-muted-foreground">{appointment.Specialty?.name || appointment.specialty || 'General Care'}</p>
              <div className="flex gap-1 mt-2 flex-wrap">
                <Badge className={`${getStatusColor(appointment.status)} text-xs px-2 py-1 h-5`}>
                  {getStatusLabel(appointment.status)}
                </Badge>
                {appointment.bookingFeeStatus === 'completed' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 text-[10px] px-1 py-0 h-4">
                    Booking ✓
                  </Badge>
                )}
                {appointment.sessionFeeStatus === 'completed' && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px] px-1 py-0 h-4">
                    Session ✓
                  </Badge>
                )}
                {appointment.rescheduleCount > 0 && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 text-[10px] px-1 py-0 h-4">
                    Rescheduled {appointment.rescheduleCount}x
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/appointment/${appointment.id}`)} className="text-xs">View Details</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleReschedule(appointment)}
                disabled={!canReschedule(appointment)}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive text-xs"
                onClick={() => handleCancel(appointment)}
                disabled={!canCancel(appointment)}
              >
                <X className="h-3 w-3 mr-2" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{new Date(appointment.scheduledDate || appointment.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{appointment.TimeSlot ?
              `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` :
              new Date(appointment.scheduledDate || appointment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            }</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            {appointment.sessionType === "teleconference" || appointment.type === "video" ? (
              <Video className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            ) : (
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <span className="truncate">{appointment.sessionType === "teleconference" || appointment.type === "video" ? "Video" : "In-Person"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <DollarSign className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate">MWK {appointment.totalCost || appointment.TimeSlot?.price || 'N/A'}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-2 p-2 bg-muted/50 rounded">
            <p className="text-[10px] font-medium mb-0.5">Notes:</p>
            <p className="text-[10px] text-muted-foreground">{appointment.notes}</p>
          </div>
        )}

        {appointment.status === "session_waiting" && (
          <div className="flex gap-1.5 mt-3 pt-2 border-t">
            {appointment.sessionType === "teleconference" ? (
              <Button className="flex-1 gap-1.5 h-7 text-[11px]">
                <Video className="h-3 w-3" />
                Join Call
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 gap-1.5 h-7 text-[11px]"
                onClick={() => handleShowContact(appointment)}
              >
                <Phone className="h-3 w-3" />
                Contact
              </Button>
            )}
              <Button
                variant="outline"
                className="flex-1 gap-1.5 h-7 text-[11px]"
                onClick={() => handleReschedule(appointment)}
                disabled={!canReschedule(appointment)}
              >
                <RotateCcw className="h-3 w-3" />
                Reschedule
              </Button>
          </div>
        )}

        {appointment.status === "session_waiting" && appointment.sessionFeeStatus === "pending" && (
          <div className="mt-2 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded mb-2 space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span>Base fee:</span>
                <span>MWK {Number(appointment.sessionFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Tax ({appointment.Specialty?.taxRate || 16.5}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 16.5) / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Processing ({appointment.Specialty?.convenienceFeePercentage || 2}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold border-t pt-0.5">
                <span>Total:</span>
                <span>MWK {(
                  Number(appointment.sessionFee || 0) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 16.5) / 100)) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
                ).toLocaleString()}</span>
              </div>
            </div>
            <Button
              className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 h-7 text-[11px]"
              onClick={() => {
                console.log('Button clicked for appointment:', appointment.id);
                handlePaySessionFee(appointment);
              }}
              disabled={paySessionFeeMutation.isPending}
            >
              <DollarSign className="h-3 w-3" />
              {paySessionFeeMutation.isPending ? 'Processing...' : `Pay Session Fee - MWK ${(
                Number(appointment.sessionFee || 0) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 16.5) / 100)) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
              ).toLocaleString()}`}
            </Button>
          </div>
        )}

        {appointment.status === "session_attended" && appointment.sessionFeeStatus === "pending" && (
          <div className="mt-2 pt-2 border-t">
            <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded mb-2 space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span>Base fee:</span>
                <span>MWK {Number(appointment.sessionFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Tax ({appointment.Specialty?.taxRate || 16.5}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 16.5) / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>Processing ({appointment.Specialty?.convenienceFeePercentage || 2}%):</span>
                <span>MWK {Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] font-semibold border-t pt-0.5">
                <span>Total:</span>
                <span>MWK {(
                  Number(appointment.sessionFee || 0) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 16.5) / 100)) +
                  Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
                ).toLocaleString()}</span>
              </div>
            </div>
            <Button
              className="w-full gap-1.5 bg-blue-600 hover:bg-blue-700 h-7 text-[11px]"
              onClick={() => handlePaySessionFee(appointment)}
              disabled={paySessionFeeMutation.isPending}
            >
              <DollarSign className="h-3 w-3" />
              Pay Session Fee - MWK {(
                Number(appointment.sessionFee || 0) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.taxRate || 16.5) / 100)) +
                Math.round(Number(appointment.sessionFee || 0) * ((appointment.Specialty?.convenienceFeePercentage || 2) / 100))
              ).toLocaleString()}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const CaregiverCard = ({ appointment }: { appointment: typeof appointments[0] }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">
                {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
              </h4>
              <p className="text-sm text-muted-foreground">{appointment.Specialty?.name}</p>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status === "session_waiting" ? "Confirmed" : "Completed"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</span>
          </div>
          <div className="flex items-center gap-2">
            {appointment.sessionType === "teleconference" ? (
              <Video className="w-4 h-4 text-muted-foreground" />
            ) : (
              <MapPin className="w-4 h-4 text-muted-foreground" />
            )}
            <span>{appointment.sessionType === "teleconference" ? "Video Call" : "In-Person"}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>MWK {appointment.totalCost}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
            <strong>Notes:</strong> {appointment.notes}
          </div>
        )}

        {appointment.status === "session_waiting" && (
          <div className="mt-3 pt-3 border-t">
            <Button 
              onClick={() => markAttendedMutation.mutate(appointment.id)}
              disabled={markAttendedMutation.isPending}
              className="w-full"
            >
              Mark Session Attended
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
          <h1 className="font-display text-xl md:text-2xl font-bold">
            {isCaregiver ? "My Appointments" : "Appointments"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isCaregiver ? "Manage your patient appointments" : "Manage your healthcare appointments"}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">{upcomingAppointments.length}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isCaregiver ? 'Confirmed' : 'Upcoming'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">{pastAppointments.length}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {isCaregiver ? 'Completed' : 'Past'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-lg font-bold">{appointments.length}</p>
                  <p className="text-[10px] text-muted-foreground">Total Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Appointments Tabs */}
        <Tabs defaultValue={isCaregiver ? "confirmed" : "upcoming"} className="space-y-6">
          <TabsList className="h-9">
            {isCaregiver ? (
              <>
                <TabsTrigger value="confirmed" className="gap-2 text-xs">
                  Confirmed
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{confirmedAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2 text-xs">
                  Completed
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{completedAppointments.length}</Badge>
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="upcoming" className="gap-2 text-xs">
                  Upcoming
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{upcomingAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2 text-xs">
                  Past
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{pastAppointments.length}</Badge>
                </TabsTrigger>
                {rescheduledAppointments.length > 0 && (
                  <TabsTrigger value="rescheduled" className="gap-2 text-xs">
                    Rescheduled
                    <Badge variant="secondary" className="text-xs px-1 py-0 h-4">{rescheduledAppointments.length}</Badge>
                  </TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {isCaregiver ? (
            <>
              <TabsContent value="confirmed" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Confirmed Appointments</CardTitle>
                        <CardDescription className="text-xs">
                          {confirmedAppointments.length} confirmed appointment(s)
                        </CardDescription>
                      </div>
                      {confirmedAppointments.length > 0 && (
                        <ExportButton
                          data={confirmedAppointments}
                          columns={[
                            {
                              header: "Date",
                              accessor: (row: any) => new Date(row.scheduledDate).toLocaleDateString(),
                            },
                            {
                              header: "Time",
                              accessor: (row: any) => row.TimeSlot ? `${row.TimeSlot.startTime} - ${row.TimeSlot.endTime}` : 'N/A',
                            },
                            {
                              header: "Patient",
                              accessor: (row: any) => `${row.Patient?.User?.firstName || ''} ${row.Patient?.User?.lastName || ''}`,
                            },
                            {
                              header: "Specialty",
                              accessor: (row: any) => row.Specialty?.name || 'General Care',
                            },
                            {
                              header: "Session Type",
                              accessor: (row: any) => row.sessionType === 'teleconference' ? 'Video Call' : 'In-Person',
                            },
                            {
                              header: "Amount",
                              accessor: (row: any) => `MWK ${row.totalCost || 0}`,
                            },
                          ]}
                          filename={`confirmed-appointments-${new Date().toISOString().split('T')[0]}`}
                          title="Confirmed Appointments"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {confirmedAppointments.length === 0 ? (
                      <div className="py-12 text-center">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-sm mb-1">No confirmed appointments</h3>
                        <p className="text-xs text-muted-foreground">
                          Confirmed appointments will appear here
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Patient</TableHead>
                            <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                            <TableHead className="text-xs font-semibold">Specialty</TableHead>
                            <TableHead className="text-xs font-semibold">Type</TableHead>
                            <TableHead className="text-xs font-semibold">Amount</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {confirmedAppointments.map((appointment) => (
                            <TableRow key={appointment.id} className="hover:bg-muted/30">
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                    {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.Patient?.User?.phone || 'No phone'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.TimeSlot ? `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-1 text-sm">
                                  {appointment.sessionType === 'teleconference' ? (
                                    <><Video className="h-3 w-3" /> Video</>
                                  ) : (
                                    <><MapPin className="h-3 w-3" /> In-Person</>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm font-medium">MWK {appointment.totalCost || 0}</p>
                              </TableCell>
                              <TableCell className="p-3 text-right">
                                <Button
                                  onClick={() => markAttendedMutation.mutate(appointment.id)}
                                  disabled={markAttendedMutation.isPending}
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  Mark Attended
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Completed Appointments</CardTitle>
                        <CardDescription className="text-xs">
                          {completedAppointments.length} completed appointment(s)
                        </CardDescription>
                      </div>
                      {completedAppointments.length > 0 && (
                        <ExportButton
                          data={completedAppointments}
                          columns={[
                            {
                              header: "Date",
                              accessor: (row: any) => new Date(row.scheduledDate).toLocaleDateString(),
                            },
                            {
                              header: "Time",
                              accessor: (row: any) => row.TimeSlot ? `${row.TimeSlot.startTime} - ${row.TimeSlot.endTime}` : 'N/A',
                            },
                            {
                              header: "Patient",
                              accessor: (row: any) => `${row.Patient?.User?.firstName || ''} ${row.Patient?.User?.lastName || ''}`,
                            },
                            {
                              header: "Specialty",
                              accessor: (row: any) => row.Specialty?.name || 'General Care',
                            },
                            {
                              header: "Session Type",
                              accessor: (row: any) => row.sessionType === 'teleconference' ? 'Video Call' : 'In-Person',
                            },
                            {
                              header: "Amount",
                              accessor: (row: any) => `MWK ${row.totalCost || 0}`,
                            },
                          ]}
                          filename={`completed-appointments-${new Date().toISOString().split('T')[0]}`}
                          title="Completed Appointments"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {completedAppointments.length === 0 ? (
                      <div className="py-12 text-center">
                        <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <h3 className="font-semibold text-sm mb-1">No completed appointments</h3>
                        <p className="text-xs text-muted-foreground">
                          Completed appointments will appear here
                        </p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="text-xs font-semibold">Patient</TableHead>
                            <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                            <TableHead className="text-xs font-semibold">Specialty</TableHead>
                            <TableHead className="text-xs font-semibold">Type</TableHead>
                            <TableHead className="text-xs font-semibold">Amount</TableHead>
                            <TableHead className="text-xs font-semibold text-right">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {completedAppointments.map((appointment) => (
                            <TableRow key={appointment.id} className="hover:bg-muted/30">
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold">
                                    {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.Patient?.User?.phone || 'No phone'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.TimeSlot ? `${appointment.TimeSlot.startTime} - ${appointment.TimeSlot.endTime}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-1 text-sm">
                                  {appointment.sessionType === 'teleconference' ? (
                                    <><Video className="h-3 w-3" /> Video</>
                                  ) : (
                                    <><MapPin className="h-3 w-3" /> In-Person</>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm font-medium">MWK {appointment.totalCost || 0}</p>
                              </TableCell>
                              <TableCell className="p-3 text-right">
                                <Badge variant="default" className="text-xs bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {upcomingAppointments.map((appointment) => (
                      <PatientCard key={appointment.id} appointment={appointment} />
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pastAppointments.map((appointment) => (
                    <PatientCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </TabsContent>

              {rescheduledAppointments.length > 0 && (
                <TabsContent value="rescheduled" className="space-y-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rescheduledAppointments.map((appointment) => (
                      <PatientCard key={appointment.id} appointment={appointment} />
                    ))}
                  </div>
                </TabsContent>
              )}
            </>
          )}
        </Tabs>

        {/* Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-sm">Caregiver Contact Information</DialogTitle>
              <DialogDescription className="text-[10px]">
                Contact details for your appointment
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs">
                      {selectedAppointment.Caregiver?.User?.firstName} {selectedAppointment.Caregiver?.User?.lastName}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{selectedAppointment.Specialty?.name}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium">Phone</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedAppointment.Caregiver?.User?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium">Email</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedAppointment.Caregiver?.User?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Home className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium">Location</p>
                      <p className="text-[10px] text-muted-foreground">
                        {selectedAppointment.Caregiver?.village && selectedAppointment.Caregiver?.district ?
                          `${selectedAppointment.Caregiver.village}, ${selectedAppointment.Caregiver.traditionalAuthority || ''} ${selectedAppointment.Caregiver.district}, ${selectedAppointment.Caregiver.region}`.replace(', ,', ',').trim() :
                          'Location will be provided closer to appointment time'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-medium">Appointment</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(selectedAppointment.scheduledDate).toLocaleDateString()} at {selectedAppointment.TimeSlot?.startTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1.5 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-7 text-[11px]"
                    onClick={() => window.open(`tel:${selectedAppointment.Caregiver?.User?.phone}`)}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-7 text-[11px]"
                    onClick={() => window.open(`mailto:${selectedAppointment.Caregiver?.User?.email}`)}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reschedule Modal */}
        <RescheduleModal
          open={showRescheduleModal}
          onClose={() => {
            setShowRescheduleModal(false);
            setAppointmentToReschedule(null);
          }}
          appointment={appointmentToReschedule}
          onRescheduleSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
          }}
        />

        {/* Cancel Modal */}
        {appointmentToCancel && (
          <CancelModal
            isOpen={showCancelModal}
            onClose={() => {
              setShowCancelModal(false);
              setAppointmentToCancel(null);
            }}
            onConfirm={(reason) => {
              cancelAppointmentMutation.mutate({
                appointmentId: appointmentToCancel.id,
                reason
              });
            }}
            appointmentDetails={{
              date: new Date(appointmentToCancel.scheduledDate || appointmentToCancel.TimeSlot?.date).toLocaleDateString(),
              time: appointmentToCancel.TimeSlot?.startTime || new Date(appointmentToCancel.scheduledDate).toLocaleTimeString(),
              caregiver: `${appointmentToCancel.Caregiver?.User?.firstName || ''} ${appointmentToCancel.Caregiver?.User?.lastName || ''}`.trim() || 'Caregiver'
            }}
            isLoading={cancelAppointmentMutation.isPending}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
