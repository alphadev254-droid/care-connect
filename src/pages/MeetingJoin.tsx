import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { meetingService, type MeetingJoinResponse } from '@/services/meetingService';
import { Loader2, Video, Clock, AlertCircle, CheckCircle2, User, Calendar, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MeetingJoin = () => {
  const { token } = useParams<{ token: string }>();
  const [meetingData, setMeetingData] = useState<MeetingJoinResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid meeting link');
      setLoading(false);
      return;
    }

    // Validate token and get meeting details
    meetingService.joinWithToken(token)
      .then(response => {
        setMeetingData(response);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || err.response?.data?.message || 'Invalid or expired meeting link');
        setLoading(false);
      });
  }, [token]);

  const joinMeeting = () => {
    if (!meetingData) {
      console.error('No meeting data available');
      return;
    }

    const { jitsiConfig, appointment, participant } = meetingData;

    console.log('Joining meeting with config:', {
      domain: jitsiConfig.domain,
      roomName: jitsiConfig.roomName,
      participant: participant.name
    });

    // Set hasJoined to true to show the container
    setHasJoined(true);

    // Load Jitsi script if not already loaded
    if (!window.JitsiMeetExternalAPI) {
      console.log('Loading Jitsi External API script...');
      const script = document.createElement('script');

      // Use http:// for IP addresses, https:// for domains
      const protocol = jitsiConfig.domain.includes('localhost') ||
                       jitsiConfig.domain.match(/^\d+\.\d+\.\d+\.\d+/)
                       ? 'http'
                       : 'https';

      script.src = `${protocol}://${jitsiConfig.domain}/external_api.js`;
      script.async = true;
      script.onload = () => {
        console.log('Jitsi script loaded successfully');
        initializeJitsi();
      };
      script.onerror = (error) => {
        console.error('Failed to load Jitsi script:', error);
        alert('Failed to load video conference. Please check your connection.');
      };
      document.body.appendChild(script);
    } else {
      console.log('Jitsi API already loaded');
      initializeJitsi();
    }

    function initializeJitsi() {
      if (!jitsiContainerRef.current) {
        console.error('Jitsi container not found');
        return;
      }

      console.log('Initializing Jitsi meeting...');

      try {
        const options = {
          roomName: jitsiConfig.roomName,
          width: '100%',
          height: 600,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: jitsiConfig.userInfo.displayName,
            email: jitsiConfig.userInfo.email,
          },
          configOverwrite: {
            startWithAudioMuted: jitsiConfig.configOverwrite.startWithAudioMuted,
            startWithVideoMuted: jitsiConfig.configOverwrite.startWithVideoMuted,
            prejoinPageEnabled: jitsiConfig.configOverwrite.prejoinPageEnabled,
            enableWelcomePage: false,
            enableClosePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
              'tileview', 'help', 'mute-everyone'
            ],
          },
        };

        console.log('Creating Jitsi API instance with options:', options);
        const api = new window.JitsiMeetExternalAPI(jitsiConfig.domain, options);
        jitsiApiRef.current = api;

        console.log('Jitsi API instance created successfully');

        // Track join
        api.addEventListener('videoConferenceJoined', () => {
          console.log('User joined video conference');
          meetingService.trackJoin({
            appointmentId: appointment.id,
            participantRole: participant.role,
            participantId: participant.id,
            participantName: participant.name,
          }).catch(err => console.error('Failed to track join:', err));
        });

        // Track leave
        api.addEventListener('readyToClose', () => {
          console.log('User leaving video conference');
          meetingService.trackLeave({
            appointmentId: appointment.id,
            participantRole: participant.role,
            participantId: participant.id,
            participantName: participant.name,
          }).catch(err => console.error('Failed to track leave:', err));
        });
      } catch (error) {
        console.error('Error initializing Jitsi:', error);
        alert('Failed to initialize video conference. Error: ' + error);
      }
    }
  };

  useEffect(() => {
    // Cleanup Jitsi on unmount
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading meeting details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <CardTitle>Unable to Access Meeting</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <p className="mt-4 text-sm text-muted-foreground">
              Please check your email for the correct meeting link or contact support if you continue to experience issues.
            </p>
            <Button className="w-full mt-4" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!meetingData) return null;

  const { accessCheck, appointment, participant } = meetingData;

  // Can't join yet (too early)
  if (accessCheck.status === 'too_early') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <CardTitle>Meeting Opens Soon</CardTitle>
                <CardDescription>Your appointment hasn't started yet</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Please Wait</AlertTitle>
              <AlertDescription>{accessCheck.message}</AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">Appointment Details:</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(appointment.scheduledDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{participant.role === 'patient' ? appointment.caregiverName : appointment.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.duration} minutes</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              You can join the meeting 15 minutes before your scheduled appointment time.
              Please refresh this page when it's time to join.
            </p>

            <Button className="w-full" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Meeting expired
  if (accessCheck.status === 'expired') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <CardTitle>Meeting Has Ended</CardTitle>
                <CardDescription>This meeting link has expired</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Expired</AlertTitle>
              <AlertDescription>{accessCheck.message}</AlertDescription>
            </Alert>
            <p className="mt-4 text-sm text-muted-foreground">
              If you need to schedule another appointment, please contact your healthcare provider or use the patient portal.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Can join - show meeting interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto p-4">
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-lg">Video Consultation</CardTitle>
                  <CardDescription>
                    Welcome, {participant.name} ({participant.role === 'patient' ? 'Patient' : 'Healthcare Provider'})
                  </CardDescription>
                </div>
              </div>
              {hasJoined && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Connected</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">With</p>
                <p className="font-medium">{participant.role === 'patient' ? appointment.caregiverName : appointment.patientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Specialty</p>
                <p className="font-medium">{appointment.specialty}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Duration</p>
                <p className="font-medium">{appointment.duration} minutes</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Session</p>
                <p className="font-medium capitalize">{appointment.sessionType.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            {!hasJoined ? (
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Join?</h3>
                <p className="text-muted-foreground mb-6">
                  Click the button below to join your video consultation
                </p>
                <Button size="lg" onClick={joinMeeting} className="px-8">
                  <Video className="mr-2 h-5 w-5" />
                  Join Meeting
                </Button>
              </div>
            ) : (
              <div ref={jitsiContainerRef} className="rounded-lg overflow-hidden bg-black" />
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            This is a secure, end-to-end encrypted video consultation.
            Please ensure you're in a private location.
          </p>
        </div>
      </div>
    </div>
  );
};

// Add type declaration for JitsiMeetExternalAPI
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

export default MeetingJoin;
