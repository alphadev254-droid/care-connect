import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { timeSlotService, TimeSlot } from '@/services/timeSlotService';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: any;
  onRescheduleSuccess: () => void;
}

export const RescheduleModal = ({ open, onClose, appointment, onRescheduleSuccess }: RescheduleModalProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [reason, setReason] = useState('');
  const { user } = useAuth();

  const cutoffHours = parseInt(import.meta.env.VITE_RESCHEDULE_CUTOFF_HOURS) || 12;
  const maxReschedules = parseInt(import.meta.env.VITE_MAX_RESCHEDULES_PER_APPOINTMENT) || 2;

  useEffect(() => {
    if (open && appointment) {
      fetchAvailableSlots();
    }
  }, [open, appointment]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const availableSlots = await timeSlotService.getAvailableSlots({ 
        caregiverId: appointment.caregiverId 
      });
      
      // Filter out past slots on frontend as additional safety
      const now = new Date();
      const futureSlots = availableSlots.filter(slot => {
        const slotDateTime = new Date(`${slot.date} ${slot.startTime}`);
        return slotDateTime > now;
      });
      
      setSlots(futureSlots.slice(0, 20));
    } catch (error) {
      toast.error('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const canReschedule = () => {
    if (!appointment) return false;
    
    const hoursUntilAppointment = (new Date(appointment.scheduledDate) - new Date()) / (1000 * 60 * 60);
    const rescheduleCount = appointment.rescheduleCount || 0;
    
    return hoursUntilAppointment >= cutoffHours && 
           rescheduleCount < maxReschedules &&
           appointment.status === 'session_waiting';
  };

  const handleReschedule = async () => {
    if (!selectedSlot || !appointment) return;

    setRescheduling(true);
    try {
      const response = await api.post(`/appointments/${appointment.id}/reschedule`, {
        newTimeSlotId: selectedSlot.id,
        reason: reason.trim() || undefined,
        rescheduleBy: user?.role === 'caregiver' ? 'caregiver' : 'patient'
      });

      toast.success('Appointment rescheduled successfully');
      onRescheduleSuccess();
      onClose();
    } catch (error) {
      console.error('Reschedule error:', error);
      if (error.response?.data?.error) {
        toast.error(`Reschedule failed: ${error.response.data.error}`);
      } else {
        toast.error('Failed to reschedule appointment');
      }
    } finally {
      setRescheduling(false);
    }
  };

  if (!appointment) return null;

  const hoursUntilAppointment = (new Date(appointment.scheduledDate) - new Date()) / (1000 * 60 * 60);
  const rescheduleCount = appointment.rescheduleCount || 0;
  const canRescheduleNow = canReschedule();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Appointment */}
          <div>
            <h4 className="font-semibold mb-3">Current Appointment</h4>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{appointment.TimeSlot?.startTime} - {appointment.TimeSlot?.endTime}</span>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Reschedules: {rescheduleCount}/{maxReschedules}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reschedule Policy */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Rescheduling Policy</p>
                <ul className="text-blue-700 dark:text-blue-200 space-y-1">
                  <li>• Can reschedule up to {cutoffHours} hours before appointment</li>
                  <li>• Maximum {maxReschedules} reschedules per appointment</li>
                  <li>• Can only reschedule to slots from the same caregiver</li>
                  <li>• Both patient and caregiver will be notified</li>
                </ul>
              </div>
            </div>
          </div>

          {!canRescheduleNow ? (
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-900 dark:text-red-100 mb-1">Cannot Reschedule</p>
                  <p className="text-red-700 dark:text-red-200">
                    {hoursUntilAppointment < cutoffHours 
                      ? `Cannot reschedule within ${cutoffHours} hours of appointment`
                      : rescheduleCount >= maxReschedules
                      ? `Maximum reschedules (${maxReschedules}) exceeded`
                      : 'Appointment cannot be rescheduled'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Available Slots */}
              <div>
                <h4 className="font-semibold mb-3">Select New Time</h4>
                {loading ? (
                  <div className="text-center py-8">Loading available slots...</div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8">No available slots found</div>
                ) : (
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {slots.map((slot) => (
                      <Card 
                        key={slot.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedSlot?.id === slot.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{new Date(slot.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{slot.startTime} - {slot.endTime}</span>
                              </div>
                            </div>
                            <Badge variant="secondary">{slot.duration || 180} min</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Reason */}
              {selectedSlot && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reason">Reason for Rescheduling (Optional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a reason for rescheduling..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-medium mb-3">Reschedule Summary</h5>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(appointment.scheduledDate).toLocaleDateString()}</span>
                        <span>{appointment.TimeSlot?.startTime}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(selectedSlot.date).toLocaleDateString()}</span>
                        <span>{selectedSlot.startTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleReschedule} 
                      disabled={rescheduling}
                      className="flex-1"
                    >
                      {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};