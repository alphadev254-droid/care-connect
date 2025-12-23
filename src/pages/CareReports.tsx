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
      const reports = response.data.reports || [];

      // Parse JSON strings for attachments and vitals
      return reports.map(report => {
        let attachments = [];
        let vitals = {};

        // Safely parse attachments
        if (typeof report.attachments === 'string') {
          try {
            attachments = JSON.parse(report.attachments);
          } catch (e) {
            console.error('Failed to parse attachments:', e);
            attachments = [];
          }
        } else {
          attachments = report.attachments || [];
        }

        // Safely parse vitals
        if (typeof report.vitals === 'string') {
          try {
            vitals = JSON.parse(report.vitals);
          } catch (e) {
            console.error('Failed to parse vitals:', e);
            vitals = {};
          }
        } else {
          vitals = report.vitals || {};
        }

        return {
          ...report,
          attachments,
          vitals
        };
      });
    },
  });

  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  const reports = Array.isArray(reportsData) ? reportsData : [];

  console.log('Appointments:', appointments);
  console.log('Reports:', reports);

  const completedAppointments = appointments.filter(apt =>
    isCaregiver ?
      // Show appointments where both fees are completed (ready for reports)
      (apt?.sessionFeeStatus === 'completed' && apt?.bookingFeeStatus === 'completed') ||
      (apt?.status === 'session_attended' || apt?.status === 'completed')
    : (apt?.status === 'session_attended' || apt?.status === 'completed')
  );

  const appointmentsWithReports = completedAppointments.map(apt => ({
    ...apt,
    hasReport: reports.some(report => report?.appointmentId === apt?.id),
    report: reports.find(report => report?.appointmentId === apt?.id)
  }));

  console.log('Appointments with reports:', appointmentsWithReports);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [reportForm, setReportForm] = useState({
    observations: '',
    interventions: '',
    sessionSummary: '',
    patientStatus: 'stable',
    recommendations: '',
    followUpDate: '',
    medications: '',
    activities: '',
    notes: '',
    vitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenLevel: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      bloodSugar: ''
    },
    attachments: []
  });

  useEffect(() => {
    if (appointmentId && completedAppointments.length > 0) {
      const appointment = appointmentsWithReports.find(apt => apt.id.toString() === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        if (appointment.report) {
          setReportForm({
            observations: appointment.report.observations || '',
            interventions: appointment.report.interventions || '',
            sessionSummary: appointment.report.sessionSummary || '',
            patientStatus: appointment.report.patientStatus || 'stable',
            recommendations: appointment.report.recommendations || '',
            followUpDate: appointment.report.followUpDate || '',
            medications: appointment.report.medications || '',
            activities: appointment.report.activities || '',
            notes: appointment.report.notes || '',
            vitals: appointment.report.vitals || {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              oxygenLevel: '',
              respiratoryRate: '',
              oxygenSaturation: '',
              bloodSugar: ''
            },
            attachments: appointment.report.attachments || []
          });
        }
      }
    }
  }, [appointmentId, appointmentsWithReports]);

  const createReportMutation = useMutation({
    mutationFn: async (reportData) => {
      const formData = new FormData();
      
      // Add text fields
      formData.append('appointmentId', reportData.appointmentId);
      formData.append('patientId', reportData.patientId);
      formData.append('caregiverId', reportData.caregiverId);
      formData.append('observations', reportData.observations);
      formData.append('interventions', reportData.interventions);
      formData.append('sessionSummary', reportData.sessionSummary);
      formData.append('patientStatus', reportData.patientStatus);
      formData.append('recommendations', reportData.recommendations || '');
      formData.append('followUpDate', reportData.followUpDate || '');
      formData.append('medications', reportData.medications || '');
      formData.append('activities', reportData.activities || '');
      formData.append('notes', reportData.notes || '');
      formData.append('vitals', JSON.stringify(reportData.vitals));
      
      // Add file attachments
      if (reportData.attachments && reportData.attachments.length > 0) {
        reportData.attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }
      
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
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
    onError: (error) => {
      console.error('Report creation error:', error);
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

  if (!user) {
    return (
      <DashboardLayout userRole={mapUserRole('patient')}>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please log in to view reports</p>
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
                      <Label htmlFor="observations">Observations *</Label>
                      <Textarea
                        id="observations"
                        placeholder="Enter observations..."
                        value={reportForm.observations}
                        onChange={(e) => setReportForm({...reportForm, observations: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="interventions">Interventions *</Label>
                      <Textarea
                        id="interventions"
                        placeholder="Enter interventions performed..."
                        value={reportForm.interventions}
                        onChange={(e) => setReportForm({...reportForm, interventions: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="sessionSummary">Session Summary *</Label>
                      <Textarea
                        id="sessionSummary"
                        placeholder="Enter session summary..."
                        value={reportForm.sessionSummary}
                        onChange={(e) => setReportForm({...reportForm, sessionSummary: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="patientStatus">Patient Status *</Label>
                      <select
                        id="patientStatus"
                        className="w-full p-2 border rounded-md"
                        value={reportForm.patientStatus}
                        onChange={(e) => setReportForm({...reportForm, patientStatus: e.target.value})}
                        required
                      >
                        <option value="stable">Stable</option>
                        <option value="improving">Improving</option>
                        <option value="deteriorating">Deteriorating</option>
                        <option value="critical">Critical</option>
                        <option value="cured">Cured</option>
                        <option value="deceased">Deceased</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
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
                      <Label htmlFor="medications">Medications</Label>
                      <Textarea
                        id="medications"
                        placeholder="Medications prescribed or administered..."
                        value={reportForm.medications}
                        onChange={(e) => setReportForm({...reportForm, medications: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="activities">Activities</Label>
                      <Textarea
                        id="activities"
                        placeholder="Activities performed with patient (exercises, therapy, etc.)..."
                        value={reportForm.activities}
                        onChange={(e) => setReportForm({...reportForm, activities: e.target.value})}
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
                      <Label>Vital Signs</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Blood Pressure (e.g., 120/80)"
                          value={reportForm.vitals.bloodPressure}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, bloodPressure: e.target.value}})}
                        />
                        <Input
                          placeholder="Heart Rate (bpm)"
                          value={reportForm.vitals.heartRate}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, heartRate: e.target.value}})}
                        />
                        <Input
                          placeholder="Temperature (°C)"
                          value={reportForm.vitals.temperature}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, temperature: e.target.value}})}
                        />
                        <Input
                          placeholder="Respiratory Rate"
                          value={reportForm.vitals.respiratoryRate}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, respiratoryRate: e.target.value}})}
                        />
                        <Input
                          placeholder="Oxygen Saturation (%)"
                          value={reportForm.vitals.oxygenSaturation}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, oxygenSaturation: e.target.value}})}
                        />
                        <Input
                          placeholder="Blood Sugar (mg/dL)"
                          value={reportForm.vitals.bloodSugar}
                          onChange={(e) => setReportForm({...reportForm, vitals: {...reportForm.vitals, bloodSugar: e.target.value}})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="attachments">File Attachments</Label>
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setReportForm({...reportForm, attachments: files});
                        }}
                      />
                      {reportForm.attachments.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            {reportForm.attachments.length} file(s) selected
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAppointment.report ? (
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-5 h-9">
                        <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
                        <TabsTrigger value="vitals" className="text-xs">Vitals</TabsTrigger>
                        <TabsTrigger value="treatment" className="text-xs">Treatment</TabsTrigger>
                        <TabsTrigger value="recommendations" className="text-xs">Notes</TabsTrigger>
                        <TabsTrigger value="attachments" className="text-xs">
                          Files
                          {selectedAppointment.report.attachments?.length > 0 && (
                            <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
                              {selectedAppointment.report.attachments.length}
                            </Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-3 mt-4">
                        <div className="grid md:grid-cols-3 gap-3">
                          <div className="border rounded-lg p-3 bg-white">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
                            <div className="mt-1.5">
                              <Badge
                                variant={
                                  selectedAppointment.report.patientStatus === 'stable' ||
                                  selectedAppointment.report.patientStatus === 'improving' ||
                                  selectedAppointment.report.patientStatus === 'cured' ? 'default' : 'destructive'
                                }
                                className="text-xs font-medium"
                              >
                                {selectedAppointment.report.patientStatus?.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                          {selectedAppointment.report.followUpDate && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up</Label>
                              <p className="text-sm font-medium mt-1.5">
                                {new Date(selectedAppointment.report.followUpDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          <div className="border rounded-lg p-3 bg-white">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Report Date</Label>
                            <p className="text-sm font-medium mt-1.5">
                              {new Date(selectedAppointment.report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Observations</Label>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedAppointment.report.observations || 'No observations recorded'}
                          </p>
                        </div>

                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Interventions</Label>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedAppointment.report.interventions || 'No interventions recorded'}
                          </p>
                        </div>

                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Summary</Label>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedAppointment.report.sessionSummary || 'No summary recorded'}
                          </p>
                        </div>

                        {selectedAppointment.report.notes && (
                          <div className="border rounded-lg p-3 bg-white">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Additional Notes</Label>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedAppointment.report.notes}
                            </p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="vitals" className="space-y-3 mt-4">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedAppointment?.report?.vitals?.bloodPressure && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Blood Pressure</Label>
                              <p className="text-lg font-semibold mt-1">{selectedAppointment.report.vitals.bloodPressure}</p>
                              <p className="text-xs text-muted-foreground">mmHg</p>
                            </div>
                          )}
                          {selectedAppointment.report.vitals?.heartRate && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Heart Rate</Label>
                              <p className="text-lg font-semibold mt-1">{selectedAppointment.report.vitals.heartRate}</p>
                              <p className="text-xs text-muted-foreground">bpm</p>
                            </div>
                          )}
                          {selectedAppointment.report.vitals?.temperature && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Temperature</Label>
                              <p className="text-lg font-semibold mt-1">{selectedAppointment.report.vitals.temperature}</p>
                              <p className="text-xs text-muted-foreground">°C</p>
                            </div>
                          )}
                          {selectedAppointment.report.vitals?.respiratoryRate && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Respiratory Rate</Label>
                              <p className="text-lg font-semibold mt-1">{selectedAppointment.report.vitals.respiratoryRate}</p>
                              <p className="text-xs text-muted-foreground">breaths/min</p>
                            </div>
                          )}
                          {selectedAppointment.report.vitals?.oxygenSaturation && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Oxygen Saturation</Label>
                              <p className="text-lg font-semibold mt-1">{selectedAppointment.report.vitals.oxygenSaturation}%</p>
                              <p className="text-xs text-muted-foreground">SpO2</p>
                            </div>
                          )}
                          {selectedAppointment.report.vitals?.bloodSugar && (
                            <div className="border rounded-lg p-3 bg-white">
                              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Blood Sugar</Label>
                              <p className="text-lg font-semibold mt-1">{selectedAppointment.report.vitals.bloodSugar}</p>
                              <p className="text-xs text-muted-foreground">mg/dL</p>
                            </div>
                          )}
                        </div>
                        {(!selectedAppointment?.report?.vitals || Object.keys(selectedAppointment?.report?.vitals || {}).length === 0) && (
                          <div className="text-center p-6 text-muted-foreground border rounded-lg bg-gray-50">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No vital signs recorded</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="treatment" className="space-y-3 mt-4">
                        {selectedAppointment.report.medications && (
                          <div className="border rounded-lg p-3 bg-white">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Medications</Label>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedAppointment.report.medications}
                            </p>
                          </div>
                        )}

                        {selectedAppointment.report.activities && (
                          <div className="border rounded-lg p-3 bg-white">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Activities Performed</Label>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedAppointment.report.activities}
                            </p>
                          </div>
                        )}

                        {!selectedAppointment.report.medications && !selectedAppointment.report.activities && (
                          <div className="text-center p-6 text-muted-foreground border rounded-lg bg-gray-50">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No treatment information recorded</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="recommendations" className="space-y-3 mt-4">
                        {selectedAppointment.report.recommendations ? (
                          <div className="border rounded-lg p-3 bg-white">
                            <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Recommendations</Label>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {selectedAppointment.report.recommendations}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center p-6 text-muted-foreground border rounded-lg bg-gray-50">
                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No recommendations provided</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="attachments" className="space-y-3 mt-4">
                        {selectedAppointment.report.attachments && selectedAppointment.report.attachments.length > 0 ? (
                          <div className="grid gap-2">
                            {selectedAppointment.report.attachments.map((attachment, index) => (
                              <div key={index} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-primary/10 rounded">
                                      <FileText className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm truncate">{attachment.filename || attachment.name || `Document ${index + 1}`}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {attachment.size ? `${(attachment.size / 1024).toFixed(2)} KB` : 'File'}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs ml-2"
                                    onClick={() => {
                                      const url = attachment.url || attachment.path;
                                      if (url) {
                                        window.open(url, '_blank');
                                      }
                                    }}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-6 text-muted-foreground border rounded-lg bg-gray-50">
                            <Upload className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No documents attached</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <p className="text-muted-foreground">No report available for this session.</p>
                  )}
                </div>
              )}

              {isCaregiver && !selectedAppointment.hasReport && (
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={handleSubmitReport}
                    disabled={createReportMutation.isPending || !reportForm.observations || !reportForm.interventions || !reportForm.sessionSummary}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createReportMutation.isPending ? 'Saving...' : 'Save Report & Complete Session'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="h-9">
              <TabsTrigger value="pending" className="text-xs">
                {isCaregiver ? 'Sessions Ready for Reports' : 'Sessions without Reports'}
                <Badge variant="secondary" className="ml-2 text-xs px-1 py-0 h-4">
                  {appointmentsWithReports.filter(apt => !apt.hasReport).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Sessions with Reports
                <Badge variant="secondary" className="ml-2 text-xs px-1 py-0 h-4">
                  {appointmentsWithReports.filter(apt => apt.hasReport).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {appointmentsWithReports.filter(apt => !apt.hasReport).length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="font-semibold text-sm mb-1">No sessions pending reports</h3>
                      <p className="text-xs text-muted-foreground">
                        Sessions ready for reports will appear here
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left text-xs font-semibold p-3">Session</th>
                          <th className="text-left text-xs font-semibold p-3">Patient</th>
                          <th className="text-left text-xs font-semibold p-3">Specialty</th>
                          <th className="text-left text-xs font-semibold p-3">Payment Status</th>
                          <th className="text-left text-xs font-semibold p-3">Duration</th>
                          <th className="text-right text-xs font-semibold p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsWithReports
                          .filter(apt => !apt.hasReport)
                          .map((appointment) => (
                            <tr key={appointment.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.scheduledTime || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                    {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ID: #{appointment.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {appointment.sessionType || 'In-person'}
                                </p>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant={appointment.bookingFeeStatus === 'completed' ? 'default' : 'outline'}
                                    className="text-xs w-fit"
                                  >
                                    {appointment.bookingFeeStatus === 'completed' ? '✓' : '○'} Booking
                                  </Badge>
                                  <Badge
                                    variant={appointment.sessionFeeStatus === 'completed' ? 'default' : 'outline'}
                                    className="text-xs w-fit"
                                  >
                                    {appointment.sessionFeeStatus === 'completed' ? '✓' : '○'} Session
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-3">
                                <p className="text-sm">{appointment.duration || 180} min</p>
                                <p className="text-xs text-muted-foreground">3 hours</p>
                              </td>
                              <td className="p-3 text-right">
                                {isCaregiver ? (
                                  <Button
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => setSelectedAppointment(appointment)}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Create Report
                                  </Button>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    Pending
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {appointmentsWithReports.filter(apt => apt.hasReport).length === 0 ? (
                    <div className="py-12 text-center">
                      <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="font-semibold text-sm mb-1">No completed reports yet</h3>
                      <p className="text-xs text-muted-foreground">
                        Completed session reports will appear here
                      </p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left text-xs font-semibold p-3">Session</th>
                          <th className="text-left text-xs font-semibold p-3">Patient</th>
                          <th className="text-left text-xs font-semibold p-3">Specialty</th>
                          <th className="text-left text-xs font-semibold p-3">Report Status</th>
                          <th className="text-left text-xs font-semibold p-3">Created</th>
                          <th className="text-right text-xs font-semibold p-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsWithReports
                          .filter(apt => apt.hasReport)
                          .map((appointment) => (
                            <tr key={appointment.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.scheduledTime || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-semibold">
                                    {appointment.Patient?.User?.firstName?.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Patient?.User?.firstName} {appointment.Patient?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      ID: #{appointment.id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {appointment.duration || 180} min session
                                </p>
                              </td>
                              <td className="p-3">
                                <Badge variant="default" className="text-xs bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                                {appointment.report?.attachments?.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {appointment.report.attachments.length} attachment(s)
                                  </p>
                                )}
                              </td>
                              <td className="p-3">
                                <p className="text-sm">
                                  {appointment.report?.createdAt
                                    ? new Date(appointment.report.createdAt).toLocaleDateString()
                                    : 'N/A'
                                  }
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {appointment.report?.createdAt
                                    ? new Date(appointment.report.createdAt).toLocaleTimeString()
                                    : ''
                                  }
                                </p>
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  onClick={() => setSelectedAppointment(appointment)}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Report
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CareReports;