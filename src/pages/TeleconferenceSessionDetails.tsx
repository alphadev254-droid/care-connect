import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Users,
  Activity,
  Copy,
  RefreshCw,
  Trash2,
  User,
  Monitor,
  Wifi,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const TeleconferenceSessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(!location.state?.session);
  const [session, setSession] = useState<any>(location.state?.session || null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Only load if we don't have session data from navigation state
    if (!location.state?.session) {
      loadSessionDetails();
    } else {
      // Still load full details in background for participants and events
      loadSessionDetails();
    }
  }, [sessionId]);

  const loadSessionDetails = async () => {
    try {
      // Only show loading if we don't already have session data
      if (!session) {
        setLoading(true);
      }
      const response = await api.get(`/meeting/sessions/${sessionId}`);
      if (response.data.success) {
        setSession(response.data.session);
        setParticipants(response.data.participants || []);
        setEvents(response.data.events || []);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load session details",
        variant: "destructive",
      });
      if (!session) {
        navigate("/dashboard/admin/teleconference");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleRegenerateTokens = async () => {
    try {
      await api.post(`/meeting/sessions/${session.appointmentId}/regenerate-tokens`);
      toast({
        title: "Success",
        description: "Meeting tokens regenerated successfully",
      });
      loadSessionDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to regenerate tokens",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/meeting/sessions/${sessionId}`);
      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
      navigate("/dashboard/admin/teleconference");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete session",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      scheduled: { variant: "secondary", label: "Scheduled" },
      active: { variant: "default", label: "Active" },
      completed: { variant: "default", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <DashboardLayout userRole={user?.role || "admin"}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard/admin/teleconference")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Session Details</h1>
              {session ? (
                <p className="text-muted-foreground">
                  Session #{session.id} - {session.specialty_name}
                </p>
              ) : (
                <Skeleton className="h-4 w-48" />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRegenerateTokens}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Tokens
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Session
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        {session && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {getStatusBadge(session.session_status)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(session.total_duration_seconds)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Participants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{session.participant_count}</div>
                <p className="text-xs text-muted-foreground">
                  Peak: {session.peak_participants}
                </p>
              </CardContent>
            </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disconnections</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{session.total_disconnections}</div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        {session && (
          <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="participants">
              Participants ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="events">
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="access">Access Links</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Scheduled Date
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(session.scheduledDate), "PPpp")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Session Type
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{session.sessionType.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Patient
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.patient_name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Caregiver
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{session.caregiver_name}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Scheduled Duration
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{session.scheduled_duration} minutes</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Room Name
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Video className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{session.jitsiRoomName}</span>
                    </div>
                  </div>

                  {session.startTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Started At
                      </label>
                      <div className="mt-1">
                        {format(new Date(session.startTime), "PPpp")}
                      </div>
                    </div>
                  )}

                  {session.endTime && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Ended At
                      </label>
                      <div className="mt-1">
                        {format(new Date(session.endTime), "PPpp")}
                      </div>
                    </div>
                  )}
                </div>

                {session.session_notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Session Notes
                    </label>
                    <p className="mt-1 text-sm">{session.session_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle>Session Participants</CardTitle>
                <CardDescription>
                  Detailed information about participants who joined this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>A/V</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-medium">
                          {participant.participant_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {participant.participant_role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {participant.joined_at
                            ? format(new Date(participant.joined_at), "PPpp")
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {formatDuration(participant.session_duration_seconds)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-sm">
                            <span>{participant.device_type || "Unknown"}</span>
                            <span className="text-xs text-muted-foreground">
                              {participant.browser || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              participant.session_status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {participant.session_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {participant.camera_enabled ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" title="Camera On" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" title="Camera Off" />
                            )}
                            {participant.microphone_enabled ? (
                              <Phone className="h-4 w-4 text-green-600" title="Mic On" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" title="Mic Off" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
                <CardDescription>
                  Chronological log of all events during this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event, index) => (
                    <div key={event.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        {index < events.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium capitalize">
                            {event.event_type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(event.timestamp), "PPpp")}
                          </span>
                        </div>
                        {event.event_data && (
                          <pre className="text-sm text-muted-foreground bg-muted p-2 rounded mt-2">
                            {JSON.stringify(event.event_data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Access Links Tab */}
          <TabsContent value="access">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Access Links</CardTitle>
                <CardDescription>
                  Unique magic links for participants to join the meeting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Patient Access Link</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/meeting/join/${session.patientMeetingToken}`}
                      className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/meeting/join/${session.patientMeetingToken}`,
                          "Patient link"
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Caregiver Access Link</label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/meeting/join/${session.caregiverMeetingToken}`}
                      className="flex-1 px-3 py-2 border rounded-md bg-muted font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/meeting/join/${session.caregiverMeetingToken}`,
                          "Caregiver link"
                        )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    These are unique, secure links for each participant. Each link can only be used by the intended participant.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this teleconference session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default TeleconferenceSessionDetails;
