import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  User,
  DollarSign,
  ArrowLeft,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
} from "lucide-react";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: appointmentData, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const response = await api.get(`/appointments/${id}`);
      return response.data.appointment;
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!appointmentData) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Appointment not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const appointment = appointmentData;
  const isCaregiver = user?.role === 'caregiver';

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Appointment Details</h1>
            <p className="text-muted-foreground">View complete appointment information</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient/Caregiver Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isCaregiver ? 'Patient Information' : 'Caregiver Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCaregiver ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p>{appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {appointment.Patient?.User?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {appointment.Patient?.User?.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Medical History</label>
                    <p className="text-sm text-muted-foreground">
                      {appointment.Patient?.medicalHistory || 'No medical history provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Current Medications</label>
                    <p className="text-sm text-muted-foreground">
                      {appointment.Patient?.currentMedications || 'No medications listed'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Allergies</label>
                    <p className="text-sm text-muted-foreground">
                      {appointment.Patient?.allergies || 'No allergies listed'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p>{appointment.Caregiver?.User?.firstName} {appointment.Caregiver?.User?.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <p className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {appointment.Caregiver?.User?.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {appointment.Caregiver?.User?.phone}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Specialty</label>
                <p>{appointment.Specialty?.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Date & Time</label>
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Session Type</label>
                <p className="flex items-center gap-2">
                  {appointment.sessionType === 'teleconference' ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {appointment.sessionType === 'teleconference' ? 'Video Call' : 'In-Person Visit'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Duration</label>
                <p>{appointment.duration} minutes</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge className="ml-2">
                  {appointment.status === 'session_waiting' ? 'Waiting for Session' :
                   appointment.status === 'session_attended' ? 'Session Completed' :
                   appointment.status}
                </Badge>
              </div>
              {appointment.notes && (
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {appointment.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Booking Fee</label>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="font-medium">MWK {appointment.bookingFee}</span>
                    <Badge variant={appointment.bookingFeeStatus === 'completed' ? 'default' : 'outline'}>
                      {appointment.bookingFeeStatus === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <DollarSign className="h-3 w-3 mr-1" />
                      )}
                      {appointment.bookingFeeStatus === 'completed' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  {appointment.bookedAt && (
                    <p className="text-xs text-muted-foreground">
                      Paid: {new Date(appointment.bookedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Session Fee</label>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span className="font-medium">MWK {appointment.sessionFee}</span>
                    <Badge variant={appointment.sessionFeeStatus === 'completed' ? 'default' : 'outline'}>
                      {appointment.sessionFeeStatus === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <DollarSign className="h-3 w-3 mr-1" />
                      )}
                      {appointment.sessionFeeStatus === 'completed' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  {appointment.sessionPaidAt && (
                    <p className="text-xs text-muted-foreground">
                      Paid: {new Date(appointment.sessionPaidAt).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Total Cost</label>
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
                    <span className="font-bold text-lg">MWK {appointment.totalCost}</span>
                    <Badge variant={appointment.paymentStatus === 'completed' ? 'default' : 'outline'}>
                      {appointment.paymentStatus === 'completed' ? 'Fully Paid' : 'Partial'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Section (if completed) */}
          {appointment.status === 'session_attended' && appointment.patientFeedback && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Patient Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {appointment.patientRating && (
                    <div>
                      <label className="text-sm font-medium">Rating</label>
                      <p>{appointment.patientRating}/5 stars</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Feedback</label>
                    <p className="text-sm bg-muted/50 p-3 rounded">{appointment.patientFeedback}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentDetails;