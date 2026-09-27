import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ExportButton } from "@/components/shared/ExportButton";
import { RatingModal } from "@/components/RatingModal";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import { toast } from "sonner";
import { dashboardCard } from "@/theme";
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
  Search,
  Filter,
  X,
  MapPin,
  Star,
} from "lucide-react";

const SESSION_STATUS_OPTIONS = [
  { value: "completed_scheduled", label: "Completed as scheduled" },
  { value: "completed_shorter", label: "Completed, but shorter than scheduled" },
  { value: "not_completed", label: "Could not be completed" },
  { value: "client_unavailable", label: "Client unavailable" },
];

const SESSION_STATUS_REASON_OPTIONS = [
  { value: "client_declined", label: "Client declined care" },
  { value: "client_unavailable", label: "Client not at home / not available" },
  { value: "caregiver_delayed", label: "Caregiver delayed or unable to attend" },
  { value: "unsafe_environment", label: "Unsafe environment" },
  { value: "other_operational", label: "Other operational reason" },
];

const CARE_PROVIDED_OPTIONS = [
  { value: "personal_hygiene", label: "Personal hygiene / bathing assistance" },
  { value: "dressing_grooming", label: "Dressing / grooming assistance" },
  { value: "feeding_meal", label: "Feeding / meal assistance" },
  { value: "mobility", label: "Mobility / movement assistance" },
  { value: "toileting", label: "Toileting assistance" },
  { value: "companionship", label: "Companionship / social support" },
  { value: "light_household", label: "Light household assistance" },
];

const SESSION_OUTCOME_OPTIONS = [
  { value: "all_completed", label: "All scheduled care activities completed" },
  { value: "some_not_completed", label: "Some scheduled activities not completed" },
];

const INCOMPLETE_REASON_OPTIONS = [
  { value: "client_declined", label: "Client declined" },
  { value: "insufficient_time", label: "Insufficient time" },
  { value: "equipment_unavailable", label: "Equipment or supplies unavailable" },
  { value: "other_operational", label: "Other operational reason" },
];

const ADDITIONAL_ASSISTANCE_OPTIONS = [
  { value: "none", label: "No additional assistance required" },
  { value: "beyond_scheduled", label: "Care beyond the scheduled activities was needed" },
];

const SAFETY_INCIDENT_OPTIONS = [
  { value: "none", label: "No safety concern or incident" },
  { value: "concern_reported", label: "Safety concern noted and reported to supervisor" },
  { value: "incident_report_submitted", label: "Incident occurred and incident report submitted" },
];

const FOLLOW_UP_OPTIONS = [
  { value: "none", label: "No follow-up required" },
  { value: "supervisor", label: "Supervisor follow-up required" },
  { value: "client_family", label: "Client / family follow-up required" },
];

const optionLabel = (options: Array<{ value: string; label: string }>, value?: string) =>
  options.find((option) => option.value === value)?.label || "Not recorded";

const optionLabels = (options: Array<{ value: string; label: string }>, values?: string[]) =>
  Array.isArray(values) && values.length
    ? values.map((value) => optionLabel(options, value)).join(", ")
    : "None recorded";

const defaultReportForm = {
  actualCheckIn: "",
  actualCheckOut: "",
  sessionStatus: "completed_scheduled",
  sessionStatusReason: "",
  careProvided: [] as string[],
  sessionOutcome: "all_completed",
  incompleteReason: [] as string[],
  additionalAssistance: "none",
  safetyIncident: "none",
  followUpActions: ["none"] as string[],
  caregiverConfirmed: false,
};

const CareReports = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const appointmentId = searchParams.get('appointment');
  const isCaregiver = user?.role === 'caregiver';
  const isPatient = user?.role === 'patient';
  const bypassPermissionCheck = isCaregiver;

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilters, setLocationFilters] = useState({
    region: '',
    district: '',
    traditionalAuthority: '',
    village: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(100);
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    region: '',
    district: '',
    traditionalAuthority: '',
    village: ''
  });

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments-reports", appliedFilters, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(appliedFilters.searchTerm && { search: appliedFilters.searchTerm }),
        ...(appliedFilters.region && { region: appliedFilters.region }),
        ...(appliedFilters.district && { district: appliedFilters.district }),
        ...(appliedFilters.traditionalAuthority && { traditionalAuthority: appliedFilters.traditionalAuthority }),
        ...(appliedFilters.village && { village: appliedFilters.village })
      });
      const response = await api.get(`/appointments?${params}`);
      return response.data;
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

  // Fetch regions
  const { data: regionsData } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const response = await api.get("/locations/regions");
      return response.data.data || [];
    },
  });

  // Fetch districts based on selected region
  const { data: districtsData } = useQuery({
    queryKey: ["districts", locationFilters.region],
    queryFn: async () => {
      if (!locationFilters.region) return [];
      const response = await api.get(`/locations/districts/${locationFilters.region}`);
      return response.data.data || [];
    },
    enabled: !!locationFilters.region,
  });

  // Fetch traditional authorities based on selected region and district
  const { data: traditionalAuthoritiesData } = useQuery({
    queryKey: ["traditional-authorities", locationFilters.region, locationFilters.district],
    queryFn: async () => {
      if (!locationFilters.region || !locationFilters.district) return [];
      const response = await api.get(`/locations/traditional-authorities/${locationFilters.region}/${locationFilters.district}`);
      return response.data.data || [];
    },
    enabled: !!locationFilters.region && !!locationFilters.district,
  });

  // Fetch villages based on selected region, district, and traditional authority
  const { data: villagesData } = useQuery({
    queryKey: ["villages", locationFilters.region, locationFilters.district, locationFilters.traditionalAuthority],
    queryFn: async () => {
      if (!locationFilters.region || !locationFilters.district || !locationFilters.traditionalAuthority) return [];
      const response = await api.get(`/locations/villages/${locationFilters.region}/${locationFilters.district}/${locationFilters.traditionalAuthority}`);
      return response.data.data || [];
    },
    enabled: !!locationFilters.region && !!locationFilters.district && !!locationFilters.traditionalAuthority,
  });

  const appointments = Array.isArray(appointmentsData?.appointments) ? appointmentsData.appointments : [];
  const totalCount = appointmentsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const reports = Array.isArray(reportsData) ? reportsData : [];

  useEffect(() => {
    if (isPatient) {
      navigate('/dashboard', { replace: true });
    }
  }, [isPatient, navigate]);

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

  // Remove frontend filtering since we're using backend filtering
  const filteredAppointments = appointmentsWithReports;

  // Location options for dropdowns
  const locationOptions = {
    regions: regionsData || [],
    districts: districtsData || [],
    traditionalAuthorities: traditionalAuthoritiesData || [],
    villages: villagesData || []
  };

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilters({
      region: '',
      district: '',
      traditionalAuthority: '',
      village: ''
    });
    setAppliedFilters({
      searchTerm: '',
      region: '',
      district: '',
      traditionalAuthority: '',
      village: ''
    });
    setCurrentPage(1);
  };

  // Apply filters function
  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      region: locationFilters.region,
      district: locationFilters.district,
      traditionalAuthority: locationFilters.traditionalAuthority,
      village: locationFilters.village
    });
    setCurrentPage(1);
  };

  // Enhanced export columns with comprehensive data
  const getEnhancedExportColumns = (includeReportData = false) => {
    // Simple table columns for main list views
    if (!includeReportData) {
      return [
        { header: "Session Date", accessor: (row: Record<string, any>) => new Date(row.scheduledDate).toLocaleDateString() },
        { header: "Session Time", accessor: (row: Record<string, any>) => row.TimeSlot ? `${row.TimeSlot.startTime.slice(0,5)} - ${row.TimeSlot.endTime.slice(0,5)}` : 'N/A' },
        { header: "Patient Name", accessor: (row: Record<string, any>) => `${row.Patient?.User?.firstName || ''} ${row.Patient?.User?.lastName || ''}` },
        { header: "Caregiver Name", accessor: (row: Record<string, any>) => `${row.Caregiver?.User?.firstName || ''} ${row.Caregiver?.User?.lastName || ''}` },
        { header: "Specialty", accessor: (row: Record<string, any>) => row.Specialty?.name || 'General Care' },
        { header: "Duration", accessor: (row: Record<string, any>) => `${row.duration || 180} min` },
        { header: "Status", accessor: (row: Record<string, any>) => row.status || 'pending' },
      ];
    }

    // Detailed session export for individual session view
    return [
      { header: "Session ID", accessor: (row: Record<string, any>) => row.id },
      { header: "Session Date", accessor: (row: Record<string, any>) => new Date(row.scheduledDate).toLocaleDateString() },
      { header: "Session Time", accessor: (row: Record<string, any>) => row.TimeSlot ? `${row.TimeSlot.startTime.slice(0,5)} - ${row.TimeSlot.endTime.slice(0,5)}` : 'N/A' },
      { header: "Patient Name", accessor: (row: Record<string, any>) => `${row.Patient?.User?.firstName || ''} ${row.Patient?.User?.lastName || ''}` },
      { header: "Patient Email", accessor: (row: Record<string, any>) => row.Patient?.User?.email || 'N/A' },
      { header: "Patient Phone", accessor: (row: Record<string, any>) => row.Patient?.User?.phone || 'N/A' },
      { header: "Patient Region", accessor: (row: Record<string, any>) => row.Patient?.region || 'N/A' },
      { header: "Patient District", accessor: (row: Record<string, any>) => row.Patient?.district || 'N/A' },
      { header: "Patient Village", accessor: (row: Record<string, any>) => row.Patient?.village || 'N/A' },
      { header: "Caregiver Name", accessor: (row: Record<string, any>) => `${row.Caregiver?.User?.firstName || ''} ${row.Caregiver?.User?.lastName || ''}` },
      { header: "Caregiver Email", accessor: (row: Record<string, any>) => row.Caregiver?.User?.email || 'N/A' },
      { header: "Specialty", accessor: (row: Record<string, any>) => row.Specialty?.name || 'General Care' },
      { header: "Duration", accessor: (row: Record<string, any>) => `${row.duration || 180} min` },
      { header: "Session Status", accessor: (row: Record<string, any>) => optionLabel(SESSION_STATUS_OPTIONS, row.report?.sessionStatus) },
      { header: "Status Reason", accessor: (row: Record<string, any>) => optionLabel(SESSION_STATUS_REASON_OPTIONS, row.report?.sessionStatusReason) },
      { header: "Care Provided", accessor: (row: Record<string, any>) => optionLabels(CARE_PROVIDED_OPTIONS, row.report?.careProvided) },
      { header: "Session Outcome", accessor: (row: Record<string, any>) => optionLabel(SESSION_OUTCOME_OPTIONS, row.report?.sessionOutcome) },
      { header: "Incomplete Reasons", accessor: (row: Record<string, any>) => optionLabels(INCOMPLETE_REASON_OPTIONS, row.report?.incompleteReason) },
      { header: "Additional Assistance", accessor: (row: Record<string, any>) => optionLabel(ADDITIONAL_ASSISTANCE_OPTIONS, row.report?.additionalAssistance) },
      { header: "Safety / Incident", accessor: (row: Record<string, any>) => optionLabel(SAFETY_INCIDENT_OPTIONS, row.report?.safetyIncident) },
      { header: "Follow-up", accessor: (row: Record<string, any>) => optionLabels(FOLLOW_UP_OPTIONS, row.report?.followUpActions) },
      { header: "Actual Check-in", accessor: (row: Record<string, any>) => row.report?.actualCheckIn ? new Date(row.report.actualCheckIn).toLocaleString() : 'N/A' },
      { header: "Actual Check-out", accessor: (row: Record<string, any>) => row.report?.actualCheckOut ? new Date(row.report.actualCheckOut).toLocaleString() : 'N/A' },
      { header: "Report Created", accessor: (row: Record<string, any>) => row.report?.createdAt ? new Date(row.report.createdAt).toLocaleDateString() : 'N/A' },
    ];
  };

  console.log('Appointments with reports:', appointmentsWithReports);

  // Use refs for form inputs to prevent focus loss
  const observationsRef = useRef<HTMLTextAreaElement>(null);
  const interventionsRef = useRef<HTMLTextAreaElement>(null);
  const sessionSummaryRef = useRef<HTMLTextAreaElement>(null);
  const patientStatusRef = useRef<HTMLSelectElement>(null);
  const recommendationsRef = useRef<HTMLTextAreaElement>(null);
  const followUpDateRef = useRef<HTMLInputElement>(null);
  const medicationsRef = useRef<HTMLTextAreaElement>(null);
  const activitiesRef = useRef<HTMLTextAreaElement>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const bloodPressureRef = useRef<HTMLInputElement>(null);
  const heartRateRef = useRef<HTMLInputElement>(null);
  const temperatureRef = useRef<HTMLInputElement>(null);
  const respiratoryRateRef = useRef<HTMLInputElement>(null);
  const oxygenSaturationRef = useRef<HTMLInputElement>(null);
  const bloodSugarRef = useRef<HTMLInputElement>(null);
  const attachmentsRef = useRef<HTMLInputElement>(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [reportForm, setReportForm] = useState(defaultReportForm);

  const updateReportField = (field: keyof typeof defaultReportForm, value: any) => {
    setReportForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleReportArrayValue = (field: "careProvided" | "incompleteReason" | "followUpActions", value: string) => {
    setReportForm((prev) => {
      const current = prev[field] || [];
      if (field === "followUpActions" && value === "none") {
        return { ...prev, followUpActions: ["none"] };
      }

      const withoutNone = field === "followUpActions" ? current.filter((item) => item !== "none") : current;
      const next = withoutNone.includes(value)
        ? withoutNone.filter((item) => item !== value)
        : [...withoutNone, value];

      return { ...prev, [field]: next };
    });
  };

  useEffect(() => {
    if (appointmentId && completedAppointments.length > 0) {
      const appointment = appointmentsWithReports.find(apt => apt.id.toString() === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
        if (appointment.report) {
          // Set form values using refs
          if (observationsRef.current) observationsRef.current.value = appointment.report.observations || '';
          if (interventionsRef.current) interventionsRef.current.value = appointment.report.interventions || '';
          if (sessionSummaryRef.current) sessionSummaryRef.current.value = appointment.report.sessionSummary || '';
          if (patientStatusRef.current) patientStatusRef.current.value = appointment.report.patientStatus || 'stable';
          if (recommendationsRef.current) recommendationsRef.current.value = appointment.report.recommendations || '';
          if (followUpDateRef.current) followUpDateRef.current.value = appointment.report.followUpDate || '';
          if (medicationsRef.current) medicationsRef.current.value = appointment.report.medications || '';
          if (activitiesRef.current) activitiesRef.current.value = appointment.report.activities || '';
          if (notesRef.current) notesRef.current.value = appointment.report.notes || '';
          if (appointment.report.vitals) {
            if (bloodPressureRef.current) bloodPressureRef.current.value = appointment.report.vitals.bloodPressure || '';
            if (heartRateRef.current) heartRateRef.current.value = appointment.report.vitals.heartRate || '';
            if (temperatureRef.current) temperatureRef.current.value = appointment.report.vitals.temperature || '';
            if (respiratoryRateRef.current) respiratoryRateRef.current.value = appointment.report.vitals.respiratoryRate || '';
            if (oxygenSaturationRef.current) oxygenSaturationRef.current.value = appointment.report.vitals.oxygenSaturation || '';
            if (bloodSugarRef.current) bloodSugarRef.current.value = appointment.report.vitals.bloodSugar || '';
          }
        }
      }
    }
  }, [appointmentId, appointmentsWithReports]);

  useEffect(() => {
    if (!selectedAppointment) {
      setReportForm(defaultReportForm);
      return;
    }

    const report = selectedAppointment.report;
    if (!report) {
      setReportForm(defaultReportForm);
      return;
    }

    setReportForm({
      actualCheckIn: report.actualCheckIn ? new Date(report.actualCheckIn).toISOString().slice(0, 16) : "",
      actualCheckOut: report.actualCheckOut ? new Date(report.actualCheckOut).toISOString().slice(0, 16) : "",
      sessionStatus: report.sessionStatus || "completed_scheduled",
      sessionStatusReason: report.sessionStatusReason || "",
      careProvided: Array.isArray(report.careProvided) ? report.careProvided : [],
      sessionOutcome: report.sessionOutcome || "all_completed",
      incompleteReason: Array.isArray(report.incompleteReason) ? report.incompleteReason : [],
      additionalAssistance: report.additionalAssistance || "none",
      safetyIncident: report.safetyIncident || "none",
      followUpActions: Array.isArray(report.followUpActions) && report.followUpActions.length ? report.followUpActions : ["none"],
      caregiverConfirmed: Boolean(report.caregiverConfirmed),
    });
  }, [selectedAppointment]);

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const formData = new FormData();

      formData.append('appointmentId', reportData.appointmentId.toString());
      formData.append('actualCheckIn', reportData.actualCheckIn || '');
      formData.append('actualCheckOut', reportData.actualCheckOut || '');
      formData.append('sessionStatus', reportData.sessionStatus);
      formData.append('sessionStatusReason', reportData.sessionStatusReason || '');
      formData.append('careProvided', JSON.stringify(reportData.careProvided || []));
      formData.append('sessionOutcome', reportData.sessionOutcome);
      formData.append('incompleteReason', JSON.stringify(reportData.incompleteReason || []));
      formData.append('additionalAssistance', reportData.additionalAssistance || '');
      formData.append('safetyIncident', reportData.safetyIncident);
      formData.append('followUpActions', JSON.stringify(reportData.followUpActions || []));
      formData.append('caregiverConfirmed', reportData.caregiverConfirmed ? 'true' : 'false');

      console.log('Submitting report data:', {
        appointmentId: reportData.appointmentId,
        sessionStatus: reportData.sessionStatus,
        sessionOutcome: reportData.sessionOutcome,
        safetyIncident: reportData.safetyIncident
      });
      
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Report creation response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Report created successfully:', data);
      toast.success('Report created successfully');
      queryClient.invalidateQueries({ queryKey: ['care-reports'] });
      queryClient.invalidateQueries({ queryKey: ['appointments-reports'] });
      // Close the form and go back to sessions list
      setSelectedAppointment(null);
    },
    onError: (error: any) => {
      console.error('Report creation error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create report');
    }
  });

  const handleSubmitReport = () => {
    if (!selectedAppointment) return;

    if (!reportForm.sessionStatus || !reportForm.sessionOutcome || !reportForm.safetyIncident) {
      toast.error('Complete session status, outcome, and safety/incident sections');
      return;
    }

    if (
      ["completed_shorter", "not_completed", "client_unavailable"].includes(reportForm.sessionStatus) &&
      !reportForm.sessionStatusReason
    ) {
      toast.error('Select a reason for the session status');
      return;
    }

    if (reportForm.sessionStatus === "completed_scheduled" && reportForm.careProvided.length === 0) {
      toast.error('Select at least one care activity provided');
      return;
    }

    if (reportForm.sessionOutcome === "some_not_completed" && reportForm.incompleteReason.length === 0) {
      toast.error('Select why some activities were not completed');
      return;
    }

    if (!reportForm.caregiverConfirmed) {
      toast.error('Please confirm the report is accurate');
      return;
    }

    createReportMutation.mutate({
      appointmentId: selectedAppointment.id,
      ...reportForm
    });
  };

  // Rating submission mutation
  const submitRatingMutation = useMutation({
    mutationFn: async ({ appointmentId, rating, feedback }: { appointmentId: number; rating: number; feedback: string }) => {
      const response = await api.post('/appointments/submit-feedback', {
        appointmentId,
        rating,
        feedback
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Rating submitted successfully!');
      setShowRatingModal(false);
      queryClient.invalidateQueries({ queryKey: ['appointments-reports'] });
    },
    onError: (error) => {
      console.error('Rating submission error:', error);
      toast.error('Failed to submit rating');
    }
  });

  const handleRatingSubmit = (rating: number, feedback: string) => {
    if (!selectedAppointment) return;
    submitRatingMutation.mutate({
      appointmentId: selectedAppointment.id,
      rating,
      feedback
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

  // Caregivers don't need permission check, but patients/admins do
  const PageContent = () => (
    <DashboardLayout userRole={mapUserRole(user?.role || 'patient')}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-xl md:text-2xl font-bold">
            {isCaregiver ? 'Session Reports' : 'My Care Reports'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isCaregiver ? 'Create and manage session reports' : 'View your healthcare reports'}
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={isCaregiver ? "Search by patient name or email..." : "Search by caregiver name or email..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="pl-10"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={applyFilters}
                  className="h-10 text-xs"
                >
                  Search
                </Button>
                {isCaregiver && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(locationFilters.region || locationFilters.district || locationFilters.traditionalAuthority || locationFilters.village) && (
                      <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
                        Active
                      </Badge>
                    )}
                  </Button>
                )}
                {(searchTerm || locationFilters.region || locationFilters.district || locationFilters.traditionalAuthority || locationFilters.village) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Location Filters - Only for Caregivers */}
              {isCaregiver && showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      Patient Region
                    </Label>
                    <Select
                      value={locationFilters.region || 'all'}
                      onValueChange={(value) => {
                        setLocationFilters({
                          region: value === 'all' ? '' : value,
                          district: '',
                          traditionalAuthority: '',
                          village: ''
                        });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All regions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All regions</SelectItem>
                        {locationOptions.regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Patient District
                    </Label>
                    <Select
                      value={locationFilters.district || 'all'}
                      onValueChange={(value) => {
                        setLocationFilters({
                          ...locationFilters,
                          district: value === 'all' ? '' : value,
                          traditionalAuthority: '',
                          village: ''
                        });
                      }}
                      disabled={!locationFilters.region}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All districts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All districts</SelectItem>
                        {locationOptions.districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Patient Traditional Authority
                    </Label>
                    <Select
                      value={locationFilters.traditionalAuthority || 'all'}
                      onValueChange={(value) => {
                        setLocationFilters({
                          ...locationFilters,
                          traditionalAuthority: value === 'all' ? '' : value,
                          village: ''
                        });
                      }}
                      disabled={!locationFilters.district}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All TAs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All TAs</SelectItem>
                        {locationOptions.traditionalAuthorities.map((ta) => (
                          <SelectItem key={ta} value={ta}>
                            {ta}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Patient Village
                    </Label>
                    <Select
                      value={locationFilters.village || 'all'}
                      onValueChange={(value) => {
                        setLocationFilters({
                          ...locationFilters,
                          village: value === 'all' ? '' : value
                        });
                      }}
                      disabled={!locationFilters.traditionalAuthority}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="All villages" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All villages</SelectItem>
                        {locationOptions.villages.map((village) => (
                          <SelectItem key={village} value={village}>
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Apply Filters Button - Only for Caregivers */}
              {isCaregiver && showFilters && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="h-8 text-xs"
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyFilters}
                    className="h-8 text-xs"
                  >
                    Apply Filters
                  </Button>
                </div>
              )}

              {/* Results Summary */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Showing {appointments.length} of {totalCount} sessions
                  {(appliedFilters.searchTerm || appliedFilters.region || appliedFilters.district || appliedFilters.traditionalAuthority || appliedFilters.village) && (
                    <span className="ml-1">(filtered)</span>
                  )}
                </span>
                {totalPages > 1 && (
                  <span>Page {currentPage} of {totalPages}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{appointmentsWithReports.filter(apt => apt.hasReport).length}</p>
                  <p className="text-xs text-muted-foreground">Sessions with Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{appointmentsWithReports.filter(apt => !apt.hasReport).length}</p>
                  <p className="text-xs text-muted-foreground">{isCaregiver ? 'Pending Reports' : 'Sessions without Reports'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{totalCount}</p>
                  <p className="text-xs text-muted-foreground">Total Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        )}

        {selectedAppointment ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Session Report</CardTitle>
                  <CardDescription className="text-xs">
                    {isCaregiver ? 'Create report for' : 'Report for'} {selectedAppointment.Patient?.User?.firstName} {selectedAppointment.Patient?.User?.lastName} - {new Date(selectedAppointment.scheduledDate).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {selectedAppointment.hasReport && (
                    <ExportButton
                      data={[selectedAppointment]}
                      columns={getEnhancedExportColumns(true)}
                      filename={`session-report-${selectedAppointment.id}-${new Date().toISOString().split('T')[0]}`}
                      title={`Session Report - ${selectedAppointment.Patient?.User?.firstName} ${selectedAppointment.Patient?.User?.lastName}`}
                    />
                  )}
                  <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setSelectedAppointment(null)}>
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    Back to Sessions
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {isCaregiver && !selectedAppointment.hasReport ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-3 rounded-lg border bg-muted/20 p-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Caregiver name / ID</Label>
                      <p className="text-sm font-medium">{selectedAppointment.Caregiver?.User?.firstName} {selectedAppointment.Caregiver?.User?.lastName} / #{selectedAppointment.caregiverId}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Booking / session ID</Label>
                      <p className="text-sm font-medium">#{selectedAppointment.id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p className="text-sm font-medium">{new Date(selectedAppointment.scheduledDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Scheduled time</Label>
                      <p className="text-sm font-medium">{selectedAppointment.TimeSlot ? `${selectedAppointment.TimeSlot.startTime.slice(0,5)} - ${selectedAppointment.TimeSlot.endTime.slice(0,5)}` : 'N/A'}</p>
                    </div>
                    <div>
                      <Label htmlFor="actualCheckIn" className="text-xs">Actual check-in</Label>
                      <Input
                        id="actualCheckIn"
                        type="datetime-local"
                        value={reportForm.actualCheckIn}
                        onChange={(e) => updateReportField('actualCheckIn', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="actualCheckOut" className="text-xs">Actual check-out</Label>
                      <Input
                        id="actualCheckOut"
                        type="datetime-local"
                        value={reportForm.actualCheckOut}
                        onChange={(e) => updateReportField('actualCheckOut', e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-4">
                    <div className="space-y-3 rounded-lg border p-3">
                      <h3 className="text-sm font-semibold">1. Session status</h3>
                      {SESSION_STATUS_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sessionStatus"
                            value={option.value}
                            checked={reportForm.sessionStatus === option.value}
                            onChange={() => updateReportField('sessionStatus', option.value)}
                          />
                          {option.label}
                        </label>
                      ))}

                      {["completed_shorter", "not_completed", "client_unavailable"].includes(reportForm.sessionStatus) && (
                        <div className="border-t pt-3 space-y-2">
                          <Label className="text-xs font-medium">1a. Reason</Label>
                          {SESSION_STATUS_REASON_OPTIONS.map((option) => (
                            <label key={option.value} className="flex items-center gap-2 text-sm">
                              <input
                                type="radio"
                                name="sessionStatusReason"
                                value={option.value}
                                checked={reportForm.sessionStatusReason === option.value}
                                onChange={() => updateReportField('sessionStatusReason', option.value)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                      <h3 className="text-sm font-semibold">2. Care provided</h3>
                      <p className="text-xs text-muted-foreground">Tick all provided. Skip if the session did not take place.</p>
                      {CARE_PROVIDED_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={reportForm.careProvided.includes(option.value)}
                            onChange={() => toggleReportArrayValue('careProvided', option.value)}
                            disabled={reportForm.sessionStatus === 'not_completed' || reportForm.sessionStatus === 'client_unavailable'}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                      <h3 className="text-sm font-semibold">3. Session outcome</h3>
                      {SESSION_OUTCOME_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="sessionOutcome"
                            value={option.value}
                            checked={reportForm.sessionOutcome === option.value}
                            onChange={() => updateReportField('sessionOutcome', option.value)}
                          />
                          {option.label}
                        </label>
                      ))}

                      {reportForm.sessionOutcome === 'some_not_completed' && (
                        <div className="border-t pt-3 space-y-2">
                          <Label className="text-xs font-medium">3a. Reason activities were not completed</Label>
                          {INCOMPLETE_REASON_OPTIONS.map((option) => (
                            <label key={option.value} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={reportForm.incompleteReason.includes(option.value)}
                                onChange={() => toggleReportArrayValue('incompleteReason', option.value)}
                              />
                              {option.label}
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="border-t pt-3 space-y-2">
                        <Label className="text-xs font-medium">3b. Additional assistance</Label>
                        {ADDITIONAL_ASSISTANCE_OPTIONS.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name="additionalAssistance"
                              value={option.value}
                              checked={reportForm.additionalAssistance === option.value}
                              onChange={() => updateReportField('additionalAssistance', option.value)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-lg border p-3">
                      <h3 className="text-sm font-semibold">4. Safety / incident</h3>
                      {SAFETY_INCIDENT_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name="safetyIncident"
                            value={option.value}
                            checked={reportForm.safetyIncident === option.value}
                            onChange={() => updateReportField('safetyIncident', option.value)}
                          />
                          {option.label}
                        </label>
                      ))}

                      <div className="border-t pt-3 space-y-2">
                        <h3 className="text-sm font-semibold">5. Follow-up</h3>
                        {FOLLOW_UP_OPTIONS.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={reportForm.followUpActions.includes(option.value)}
                              onChange={() => toggleReportArrayValue('followUpActions', option.value)}
                            />
                            {option.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 rounded-lg border p-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={reportForm.caregiverConfirmed}
                      onChange={(e) => updateReportField('caregiverConfirmed', e.target.checked)}
                    />
                    <span>I confirm this report accurately reflects the care provided during this session.</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedAppointment.report ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Session status</Label>
                          <p className="text-sm font-medium mt-1.5">{optionLabel(SESSION_STATUS_OPTIONS, selectedAppointment.report.sessionStatus)}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Session outcome</Label>
                          <p className="text-sm font-medium mt-1.5">{optionLabel(SESSION_OUTCOME_OPTIONS, selectedAppointment.report.sessionOutcome)}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Date submitted</Label>
                          <p className="text-sm font-medium mt-1.5">{new Date(selectedAppointment.report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Actual check-in</Label>
                          <p className="text-sm mt-1.5">{selectedAppointment.report.actualCheckIn ? new Date(selectedAppointment.report.actualCheckIn).toLocaleString() : 'Not recorded'}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Actual check-out</Label>
                          <p className="text-sm mt-1.5">{selectedAppointment.report.actualCheckOut ? new Date(selectedAppointment.report.actualCheckOut).toLocaleString() : 'Not recorded'}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status reason</Label>
                          <p className="text-sm mt-1.5">{optionLabel(SESSION_STATUS_REASON_OPTIONS, selectedAppointment.report.sessionStatusReason)}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Additional assistance</Label>
                          <p className="text-sm mt-1.5">{optionLabel(ADDITIONAL_ASSISTANCE_OPTIONS, selectedAppointment.report.additionalAssistance)}</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3 bg-white">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Care provided</Label>
                        <p className="text-sm mt-1.5">{optionLabels(CARE_PROVIDED_OPTIONS, selectedAppointment.report.careProvided)}</p>
                      </div>

                      <div className="border rounded-lg p-3 bg-white">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Reasons activities were not completed</Label>
                        <p className="text-sm mt-1.5">{optionLabels(INCOMPLETE_REASON_OPTIONS, selectedAppointment.report.incompleteReason)}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Safety / incident</Label>
                          <p className="text-sm mt-1.5">{optionLabel(SAFETY_INCIDENT_OPTIONS, selectedAppointment.report.safetyIncident)}</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-white">
                          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up</Label>
                          <p className="text-sm mt-1.5">{optionLabels(FOLLOW_UP_OPTIONS, selectedAppointment.report.followUpActions)}</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3 bg-white">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Caregiver confirmation</Label>
                        <p className="text-sm mt-1.5">{selectedAppointment.report.caregiverConfirmed ? 'Confirmed' : 'Not confirmed'}</p>
                      </div>

                      {!selectedAppointment.report.sessionStatus && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                          This is an older report format. Some operational fields were not captured on this report.
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No report available for this session.</p>
                  )}
                </div>
              )}

              {isCaregiver && !selectedAppointment.hasReport && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    onClick={handleSubmitReport}
                    className="h-9 text-xs"
                    disabled={createReportMutation.isPending}
                  >
                    <Save className="h-3 w-3 mr-1" />
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
                  {filteredAppointments.filter(apt => !apt.hasReport).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                Sessions with Reports
                <Badge variant="secondary" className="ml-2 text-xs px-1 py-0 h-4">
                  {filteredAppointments.filter(apt => apt.hasReport).length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {isCaregiver ? 'Sessions Ready for Reports' : 'Sessions without Reports'}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {filteredAppointments.filter(apt => !apt.hasReport).length} session(s) pending reports
                      </CardDescription>
                    </div>
                    {appointmentsWithReports.filter(apt => !apt.hasReport).length > 0 && (
                      <ExportButton
                        data={appointmentsWithReports.filter(apt => !apt.hasReport)}
                        columns={getEnhancedExportColumns(false)}
                        filename={`sessions-pending-reports-${new Date().toISOString().split('T')[0]}`}
                        title="Sessions Pending Reports"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {filteredAppointments.filter(apt => !apt.hasReport).length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="font-semibold text-sm mb-1">No sessions pending reports</h3>
                      <p className="text-xs text-muted-foreground">
                        Sessions ready for reports will appear here
                      </p>
                    </div>
                  ) : (
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold">Session</TableHead>
                          <TableHead className="text-xs font-semibold">Patient</TableHead>
                          <TableHead className="text-xs font-semibold">Caregiver</TableHead>
                          <TableHead className="text-xs font-semibold">Specialty</TableHead>
                          <TableHead className="text-xs font-semibold">Payment Status</TableHead>
                          <TableHead className="text-xs font-semibold">Duration</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointmentsWithReports
                          .filter(apt => !apt.hasReport)
                          .map((appointment) => (
                            <TableRow key={appointment.id} className="hover:bg-muted/30">
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.TimeSlot ? `${appointment.TimeSlot.startTime.slice(0,5)} - ${appointment.TimeSlot.endTime.slice(0,5)}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
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
                                      ID: #{appointment.id}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                                    {appointment.Caregiver?.User?.firstName?.charAt(0) || 'C'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.Caregiver?.User?.firstName} {appointment.Caregiver?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.Caregiver?.User?.email || 'No email'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {appointment.sessionType || 'In-person'}
                                </p>
                              </TableCell>
                              <TableCell className="p-3">
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
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.duration || 180} min</p>
                                <p className="text-xs text-muted-foreground">3 hours</p>
                              </TableCell>
                              <TableCell className="p-3 text-right">
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
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Sessions with Reports</CardTitle>
                      <CardDescription className="text-xs">
                        {filteredAppointments.filter(apt => apt.hasReport).length} completed report(s)
                      </CardDescription>
                    </div>
                    {filteredAppointments.filter(apt => apt.hasReport).length > 0 && (
                      <ExportButton
                        data={filteredAppointments.filter(apt => apt.hasReport)}
                        columns={getEnhancedExportColumns(true)}
                        filename={`sessions-with-reports-${new Date().toISOString().split('T')[0]}`}
                        title="Sessions with Completed Reports"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden">
                  {filteredAppointments.filter(apt => apt.hasReport).length === 0 ? (
                    <div className="py-12 text-center">
                      <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="font-semibold text-sm mb-1">No completed reports yet</h3>
                      <p className="text-xs text-muted-foreground">
                        Completed session reports will appear here
                      </p>
                    </div>
                  ) : (
                    <div className={dashboardCard.tableWrapper}>
                    <Table className={dashboardCard.tableMinWidth}>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-xs font-semibold">Session</TableHead>
                          <TableHead className="text-xs font-semibold">Patient</TableHead>
                          <TableHead className="text-xs font-semibold">Caregiver</TableHead>
                          <TableHead className="text-xs font-semibold">Specialty</TableHead>
                          <TableHead className="text-xs font-semibold">Report Status</TableHead>
                          <TableHead className="text-xs font-semibold">Created</TableHead>
                          <TableHead className="text-xs font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments
                          .filter(apt => apt.hasReport)
                          .map((appointment) => (
                            <TableRow key={appointment.id} className="hover:bg-muted/30">
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">
                                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.TimeSlot ? `${appointment.TimeSlot.startTime.slice(0,5)} - ${appointment.TimeSlot.endTime.slice(0,5)}` : 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
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
                                      ID: #{appointment.id}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold">
                                    {appointment.report?.Appointment?.Caregiver?.User?.firstName?.charAt(0) || appointment.Caregiver?.User?.firstName?.charAt(0) || 'C'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {appointment.report?.Appointment?.Caregiver?.User?.firstName || appointment.Caregiver?.User?.firstName} {appointment.report?.Appointment?.Caregiver?.User?.lastName || appointment.Caregiver?.User?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {appointment.report?.Appointment?.Caregiver?.User?.email || appointment.Caregiver?.User?.email || 'No email'}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="p-3">
                                <p className="text-sm">{appointment.Specialty?.name || 'General Care'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {appointment.duration || 180} min session
                                </p>
                              </TableCell>
                              <TableCell className="p-3">
                                <Badge variant="default" className="text-xs bg-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Completed
                                </Badge>
                                {appointment.report?.attachments?.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {appointment.report.attachments.length} attachment(s)
                                  </p>
                                )}
                              </TableCell>
                              <TableCell className="p-3">
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
                              </TableCell>
                              <TableCell className="p-3 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => setSelectedAppointment(appointment)}
                                  >
                                    <Eye className="h-3 w-3 mr-1" />
                                    View Report
                                  </Button>
                                  {isPatient && !appointment.patientRating && (
                                    <Button
                                      size="sm"
                                      className="h-7 text-xs bg-yellow-600 hover:bg-yellow-700"
                                      onClick={() => {
                                        setSelectedAppointment(appointment);
                                        setShowRatingModal(true);
                                      }}
                                    >
                                      <Star className="h-3 w-3 mr-1" />
                                      Rate
                                    </Button>
                                  )}
                                  {appointment.patientRating && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      {appointment.patientRating}/5
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        caregiverName={selectedAppointment ? `${selectedAppointment.Caregiver?.User?.firstName} ${selectedAppointment.Caregiver?.User?.lastName}` : ""}
        isSubmitting={submitRatingMutation.isPending}
      />
    </DashboardLayout>
  );

  // Caregivers and patients bypass permission check, others need view_care_plans permission
  return bypassPermissionCheck ? (
    <PageContent />
  ) : (
    <ProtectedRoute requiredPermission="view_care_plans">
      <PageContent />
    </ProtectedRoute>
  );
};

export default CareReports;
