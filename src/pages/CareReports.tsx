import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  FileText,
  Download,
  Upload,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  User,
  Save,
  ArrowLeft,
} from "lucide-react";

const CareReports = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const appointmentId = searchParams.get('appointment');
  const isCaregiver = user?.role === 'caregiver';

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments-reports"],
    queryFn: async () => {
      const response = await api.get("/appointments");
      return response.data.appointments || [];
    },
  });

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["care-reports"],
    queryFn: async () => {
      const response = await api.get("/reports");
      return response.data.reports || [];
    },
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  const reports = Array.isArray(reportsData) ? reportsData : [];

  const completedAppointments = appointments.filter(apt => 
    isCaregiver ? 
      // Show appointments where both fees are completed (ready for reports)
      (apt.sessionFeeStatus === 'completed' && apt.bookingFeeStatus === 'completed') ||
      (apt.status === 'session_attended')
    : apt.status === 'session_attended'
  );

  const appointmentsWithReports = completedAppointments.map(apt => ({
    ...apt,
    hasReport: reports.some(report => report.appointmentId === apt.id),
    report: reports.find(report => report.appointmentId === apt.id)
  }));

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reportForm, setReportForm] = useState({
    diagnosis: '',
    treatment: '',
    medications: '',
    recommendations: '',
    followUpDate: '',
    notes: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenLevel: ''
    }
  });

  useEffect(() => {
    if (appointmentId && completedAppointments.length > 0) {
      const appointment = appointmentsWithReports.find(apt => apt.id.toString() === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        if (appointment.report) {
          setReportForm({
            diagnosis: appointment.report.diagnosis || '',
            treatment: appointment.report.treatment || '',
            medications: appointment.report.medications || '',
            recommendations: appointment.report.recommendations || '',
            followUpDate: appointment.report.followUpDate || '',
            notes: appointment.report.notes || '',
            vitals: appointment.report.vitals || {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              oxygenLevel: ''
            }
          });
        }
      }
    }
  }, [appointmentId, appointmentsWithReports]);

  const createReportMutation = useMutation({
    mutationFn: async (reportData) => {
      const response = await api.post('/reports', reportData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Report created successfully');
      queryClient.invalidateQueries({ queryKey: ['care-reports'] });
      queryClient.invalidateQueries({ queryKey: ['appointments-reports'] });
      // Mark appointment as completed
      api.patch(`/appointments/${selectedAppointment.id}/status`, { status: 'session_attended' });
      navigate('/dashboard/reports');
    },
    onError: () => {
      toast.error('Failed to create report');
    }
  });

  const handleSubmitReport = () => {
    if (!selectedAppointment) return;
    
    createReportMutation.mutate({
      appointmentId: selectedAppointment.id,
      patientId: selectedAppointment.patientId,
      caregiverId: selectedAppointment.caregiverId,
      ...reportForm
    });
  };

  if (appointmentsLoading || reportsLoading) {
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
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {isCaregiver ? 'Session Reports' : 'My Care Reports'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isCaregiver ? 'Create and manage session reports' : 'View your healthcare reports'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointmentsWithReports.filter(apt => apt.hasReport).length}</p>
                  <p className="text-sm text-muted-foreground">Sessions with Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{appointmentsWithReports.filter(apt => !apt.hasReport).length}</p>
                  <p className="text-sm text-muted-foreground">{isCaregiver ? 'Pending Reports' : 'Sessions without Reports'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedAppointments.length}</p>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedAppointment ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Session Report</CardTitle>
                  <CardDescription>
                    {isCaregiver ? 'Create report for' : 'Report for'} {selectedAppointment.Patient?.User?.firstName} {selectedAppointment.Patient?.User?.lastName} - {new Date(selectedAppointment.scheduledDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sessions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isCaregiver && !selectedAppointment.hasReport ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Textarea
                        id="diagnosis"
                        placeholder="Enter diagnosis..."
                        value={reportForm.diagnosis}
                        onChange={(e) => setReportForm({...reportForm, diagnosis: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="treatment">Treatment Provided</Label>
                      <Textarea
                        id="treatment"
                        placeholder="Describe treatment..."
                        value={reportForm.treatment}
                        onChange={(e) => setReportForm({...reportForm, treatment: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="medications">Medications Prescribed</Label>
                      <Textarea
                        id="medications"
                        placeholder="List medications..."
                        value={reportForm.medications}
                        onChange={(e) => setReportForm({...reportForm, medications: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Vitals</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Blood Pressure"
                          value={reportForm.vitals.bloodPressure}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, bloodPressure: e.target.value}})}
                        />
                        <Input
                          placeholder="Heart Rate"
                          value={reportForm.vitals.heartRate}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, heartRate: e.target.value}})}
                        />
                        <Input
                          placeholder="Temperature"
                          value={reportForm.vitals.temperature}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, temperature: e.target.value}})}
                        />
                        <Input
                          placeholder="Oxygen Level"
                          value={reportForm.vitals.oxygenLevel}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, oxygenLevel: e.target.value}})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="recommendations">Recommendations</Label>
                      <Textarea
                        id="recommendations"
                        placeholder="Enter recommendations..."
                        value={reportForm.recommendations}
                        onChange={(e) => setReportForm({...reportForm, recommendations: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="followUpDate">Follow-up Date</Label>
                      <Input
                        id="followUpDate"
                        type="date"
                        value={reportForm.followUpDate}
                        onChange={(e) => setReportForm({...reportForm, followUpDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes..."
                        value={reportForm.notes}
                        onChange={(e) => setReportForm({...reportForm, notes: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="attachments">Attachments</Label>
                      <Input id="attachments" type="file" multiple />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button onClick={handleSubmitReport} disabled={createReportMutation.isPending}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Report & Complete Session
                    </Button>
                  </div>
                </div>
              ) : selectedAppointment.hasReport ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Diagnosis</h3>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded">{selectedAppointment.report.diagnosis || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Treatment</h3>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded">{selectedAppointment.report.treatment || 'Not provided'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Medications</h3>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded">{selectedAppointment.report.medications || 'None prescribed'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <p className="text-muted-foreground bg-muted/50 p-3 rounded">{selectedAppointment.report.recommendations || 'None provided'}</p>
                    </div>
                  </div>
                  {selectedAppointment.report.vitals && (
                    <div>
                      <h3 className="font-semibold mb-2">Vitals</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedAppointment.report.vitals.bloodPressure && (
                          <div className="bg-muted/50 p-3 rounded text-center">
                            <p className="text-sm text-muted-foreground">Blood Pressure</p>
                            <p className="font-semibold">{selectedAppointment.report.vitals.bloodPressure}</p>
                          </div>
                        )}
                        {selectedAppointment.report.vitals.heartRate && (
                          <div className="bg-muted/50 p-3 rounded text-center">
                            <p className="text-sm text-muted-foreground">Heart Rate</p>
                            <p className="font-semibold">{selectedAppointment.report.vitals.heartRate}</p>
                          </div>
                        )}
                        {selectedAppointment.report.vitals.temperature && (
                          <div className="bg-muted/50 p-3 rounded text-center">
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-semibold">{selectedAppointment.report.vitals.temperature}</p>
                          </div>
                        )}
                        {selectedAppointment.report.vitals.oxygenLevel && (
                          <div className="bg-muted/50 p-3 rounded text-center">
                            <p className="text-sm text-muted-foreground">Oxygen Level</p>
                            <p className="font-semibold">{selectedAppointment.report.vitals.oxygenLevel}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold mb-2">Additional Notes</h3>
                    <p className="text-muted-foreground bg-muted/50 p-3 rounded">{selectedAppointment.report.notes || 'No additional notes'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Report not available</h3>
                  <p className="text-muted-foreground">
                    The caregiver hasn't uploaded a report for this session yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="with-reports">With Reports</TabsTrigger>
              <TabsTrigger value="without-reports">{isCaregiver ? 'Pending Reports' : 'Without Reports'}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="grid gap-4">
                {appointmentsWithReports.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {isCaregiver ? 
                                `${appointment.Patient?.User?.firstName} ${appointment.Patient?.User?.lastName}` :
                                `${appointment.Caregiver?.User?.firstName} ${appointment.Caregiver?.User?.lastName}`
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.Specialty?.name} • {new Date(appointment.scheduledDate).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={appointment.hasReport ? 'default' : 'outline'}>
                            {appointment.hasReport ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />Report Available</>
                            ) : (
                              <><AlertCircle className="h-3 w-3 mr-1" />{isCaregiver ? 'Report Pending' : 'No Report'}</>
                            )}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            {appointment.hasReport ? (
                              <><Eye className="h-4 w-4 mr-2" />View Report</>
                            ) : isCaregiver ? (
                              <><Plus className="h-4 w-4 mr-2" />Create Report</>
                            ) : (
                              <><Eye className="h-4 w-4 mr-2" />View Session</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="with-reports" className="space-y-4">
              <div className="grid gap-4">
                {appointmentsWithReports.filter(apt => apt.hasReport).map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {isCaregiver ? 
                                `${appointment.Patient?.User?.firstName} ${appointment.Patient?.User?.lastName}` :
                                `${appointment.Caregiver?.User?.firstName} ${appointment.Caregiver?.User?.lastName}`
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.Specialty?.name} • {new Date(appointment.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="without-reports" className="space-y-4">
              <div className="grid gap-4">
                {appointmentsWithReports.filter(apt => !apt.hasReport).map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {isCaregiver ? 
                                `${appointment.Patient?.User?.firstName} ${appointment.Patient?.User?.lastName}` :
                                `${appointment.Caregiver?.User?.firstName} ${appointment.Caregiver?.User?.lastName}`
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {appointment.Specialty?.name} • {new Date(appointment.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCaregiver && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Create Report
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CareReports;