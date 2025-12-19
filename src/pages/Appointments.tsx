import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
      console.log('Initiating payment for:', appointmentData);
      const response = await api.post('/payments/initiate', {
        appointmentId: appointmentData.id,
        paymentType: 'session_fee',
        amount: appointmentData.sessionFee || 0,
        currency: 'MWK'
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Payment response:', data);
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        toast.success('Payment window opened');
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
                  {getStatusLabel(appointment.status)}
                </Badge>
                {appointment.bookingFeeStatus === 'completed' && (
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Booking Paid
                  </Badge>
                )}
                {appointment.sessionFeeStatus === 'completed' && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Session Paid
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
              <DropdownMenuItem onClick={() => navigate(`/appointment/${appointment.id}`)}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
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

        {appointment.status === "session_waiting" && (
          <div className="flex gap-2 mt-6 pt-4 border-t">
            {appointment.sessionType === "teleconference" ? (
              <Button className="flex-1 gap-2">
                <Video className="h-4 w-4" />
                Join Call
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => handleShowContact(appointment)}
              >
                <Phone className="h-4 w-4" />
                Contact
              </Button>
            )}
            <Button variant="outline" className="flex-1">
              Reschedule
            </Button>
          </div>
        )}

        {appointment.status === "session_waiting" && appointment.sessionFeeStatus === "pending" && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                console.log('Button clicked for appointment:', appointment.id);
                handlePaySessionFee(appointment);
              }}
              disabled={paySessionFeeMutation.isPending}
            >
              <DollarSign className="h-4 w-4" />
              {paySessionFeeMutation.isPending ? 'Processing...' : `Pay Session Fee - MWK ${appointment.sessionFee || 0}`}
            </Button>
          </div>
        )}
        
        {appointment.status === "session_attended" && appointment.sessionFeeStatus === "pending" && (
          <div className="mt-6 pt-4 border-t">
            <Button 
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => handlePaySessionFee(appointment)}
              disabled={paySessionFeeMutation.isPending}
            >
              <DollarSign className="h-4 w-4" />
              Pay Session Fee - MWK {appointment.sessionFee || 0}
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
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {isCaregiver ? "My Appointments" : "Appointments"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isCaregiver ? "Manage your patient appointments" : "Manage your healthcare appointments"}
          </p>
        </div>



        {/* Appointments Tabs */}
        <Tabs defaultValue={isCaregiver ? "confirmed" : "upcoming"} className="space-y-6">
          <TabsList>
            {isCaregiver ? (
              <>
                <TabsTrigger value="confirmed" className="gap-2">
                  Confirmed
                  <Badge variant="secondary">{confirmedAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  Completed
                  <Badge variant="secondary">{completedAppointments.length}</Badge>
                </TabsTrigger>
              </>
            ) : (
              <>
                <TabsTrigger value="upcoming" className="gap-2">
                  Upcoming
                  <Badge variant="secondary">{upcomingAppointments.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  Past
                  <Badge variant="secondary">{pastAppointments.length}</Badge>
                </TabsTrigger>
                {rescheduledAppointments.length > 0 && (
                  <TabsTrigger value="rescheduled" className="gap-2">
                    Rescheduled
                    <Badge variant="secondary">{rescheduledAppointments.length}</Badge>
                  </TabsTrigger>
                )}
              </>
            )}
          </TabsList>

          {isCaregiver ? (
            <>
              <TabsContent value="confirmed">
                <div className="space-y-4">
                  {confirmedAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No confirmed appointments</p>
                      </CardContent>
                    </Card>
                  ) : (
                    confirmedAppointments.map((appointment) => (
                      <CaregiverCard key={appointment.id} appointment={appointment} />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="space-y-4">
                  {completedAppointments.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground">No completed appointments</p>
                      </CardContent>
                    </Card>
                  ) : (
                    completedAppointments.map((appointment) => (
                      <CaregiverCard key={appointment.id} appointment={appointment} />
                    ))
                  )}
                </div>
              </TabsContent>
            </>
          ) : (
            <>
              <TabsContent value="upcoming" className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
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
                <div className="grid md:grid-cols-2 gap-4">
                  {pastAppointments.map((appointment) => (
                    <PatientCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              </TabsContent>
              
              {rescheduledAppointments.length > 0 && (
                <TabsContent value="rescheduled" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
              <DialogTitle>Caregiver Contact Information</DialogTitle>
              <DialogDescription>
                Contact details for your appointment
              </DialogDescription>
            </DialogHeader>
            {selectedAppointment && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedAppointment.Caregiver?.User?.firstName} {selectedAppointment.Caregiver?.User?.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedAppointment.Specialty?.name}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.Caregiver?.User?.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.Caregiver?.User?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.Caregiver?.village && selectedAppointment.Caregiver?.district ? 
                          `${selectedAppointment.Caregiver.village}, ${selectedAppointment.Caregiver.traditionalAuthority || ''} ${selectedAppointment.Caregiver.district}, ${selectedAppointment.Caregiver.region}`.replace(', ,', ',').trim() :
                          'Location will be provided closer to appointment time'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Appointment</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedAppointment.scheduledDate).toLocaleDateString()} at {selectedAppointment.TimeSlot?.startTime}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`tel:${selectedAppointment.Caregiver?.User?.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(`mailto:${selectedAppointment.Caregiver?.User?.email}`)}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Appointments;
