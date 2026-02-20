import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign, Video, MapPin } from 'lucide-react';
import { timeSlotService, TimeSlot } from '@/services/timeSlotService';
import { appointmentService } from '@/services/appointmentService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  caregiverId: number;
  caregiverName: string;
  specialties: any[];
}

export const BookingModal = ({ open, onClose, caregiverId, caregiverName, specialties }: BookingModalProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+265 ');
  const [sessionType, setSessionType] = useState<'teleconference' | 'in_person'>('teleconference');
  const [specialty, setSpecialty] = useState<any>(specialties?.[0] || null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (open && caregiverId) {
      fetchAvailableSlots();
      setSpecialty(specialties?.[0] || null);
    }
  }, [open, caregiverId, specialties]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const availableSlots = await timeSlotService.getAvailableSlots({ caregiverId });
      
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

  const handleBookSlot = async () => {
    if (!selectedSlot) return;
    
    // Check authentication
    if (!isAuthenticated) {
      toast.error('Please login to book an appointment');
      onClose();
      return;
    }
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setBooking(true);
    try {
      // Step 1: Lock the slot
      toast.info('Locking time slot...');
      await timeSlotService.lockSlot(selectedSlot.id);
      
      // Step 2: Initiate booking payment (creates pending booking and payment)
      toast.info('Initiating payment...');
      const paymentResponse = await appointmentService.createAppointment({
        timeSlotId: selectedSlot.id,
        specialtyId: specialty.id,
        sessionType,
        phoneNumber: phoneNumber
      });

      // Step 3: Redirect to Paychangu checkout
      if (paymentResponse.checkoutUrl) {
        toast.success('Redirecting to payment...');
        onClose();
        // Use location.href instead of window.open to avoid popup blockers
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      
      // Show specific error message
      if (error.response?.data?.error) {
        toast.error(`Booking failed: ${error.response.data.error}`);
      } else if (error.message) {
        toast.error(`Booking failed: ${error.message}`);
      } else {
        toast.error('Booking failed. Please try again.');
      }
      
      // Unlock slot if booking fails
      try {
        await timeSlotService.unlockSlot(selectedSlot.id);
      } catch (unlockError) {
        // Unlock failed silently
      }
    } finally {
      setBooking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Appointment with {caregiverName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading available slots...</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">No available slots found</div>
          ) : (
            <>
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

              {/* Specialty Selector — shown only when caregiver has multiple specialties */}
              {specialties.length > 1 && (
                <div className="border-t pt-4 space-y-3">
                  <h5 className="font-semibold text-base">Select Specialty</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {specialties.map((sp: any) => (
                      <button
                        key={sp.id}
                        type="button"
                        onClick={() => { setSpecialty(sp); setSelectedSlot(null); }}
                        className={`text-left p-3 rounded-lg border-2 transition-colors ${
                          specialty?.id === sp.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <p className="text-sm font-semibold">{sp.name}</p>
                        <div className="flex gap-3 mt-1.5">
                          <p className="text-xs text-muted-foreground">Book: <span className="font-medium text-foreground">MWK {Number(sp.bookingFee || 0).toLocaleString()}</span></p>
                          <p className="text-xs text-muted-foreground">Session: <span className="font-medium text-foreground">MWK {Number(sp.sessionFee || 0).toLocaleString()}</span></p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSlot && specialty && (
                <div className="border-t pt-6 space-y-5">
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Booking Summary</h4>
                    <p className="text-sm text-muted-foreground">Review your appointment details and complete payment</p>
                  </div>

                  {/* Appointment Details Card */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Appointment Date & Time</p>
                          <p className="font-semibold text-sm mt-0.5">
                            {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration & Service</p>
                          <p className="font-semibold text-sm mt-0.5">{selectedSlot.duration || 180} minutes</p>
                          <p className="text-sm font-medium text-primary">{specialty.name}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Session Type Selection */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-base">Session Type</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSessionType('teleconference')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          sessionType === 'teleconference'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4" />
                          <span className="text-sm font-medium">Teleconference</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Video call session</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSessionType('in_person')}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          sessionType === 'in_person'
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">In-Person</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Face-to-face session</p>
                      </button>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Payment Information
                    </h5>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mobile Money Number</label>
                      <Input
                        type="tel"
                        placeholder="+265 998 95 15 10"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your mobile money number for payment processing
                      </p>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Two-stage payment: Pay booking fee now, session fee after service
                      </p>
                    </div>

                    {/* Payment Cards */}
                    <div className="grid gap-3">
                      {/* Booking Fee Card */}
                      <div className="border-2 border-green-200 dark:border-green-800 rounded-xl overflow-hidden">
                        <div className="bg-green-50 dark:bg-green-950/30 px-4 py-2.5 border-b border-green-200 dark:border-green-800">
                          <p className="text-sm font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Pay Now - Booking Fee
                          </p>
                        </div>
                        <div className="p-4 space-y-2 bg-white dark:bg-transparent">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base fee</span>
                            <span className="font-medium">MWK {Number(specialty.bookingFee || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Processing ({specialty.convenienceFeePercentage || 2}%)</span>
                            <span className="font-medium">MWK {Math.round(Number(specialty.bookingFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="font-semibold">Subtotal</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              MWK {(Number(specialty.bookingFee || 0) + Math.round(Number(specialty.bookingFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100))).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Session Fee Card */}
                      <div className="border-2 border-blue-200 dark:border-blue-800 rounded-xl overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-950/30 px-4 py-2.5 border-b border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Pay Later - Session Fee
                          </p>
                        </div>
                        <div className="p-4 space-y-2 bg-white dark:bg-transparent">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Base fee</span>
                            <span className="font-medium">MWK {Number(specialty.sessionFee || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax ({specialty.taxRate || 17.5}%)</span>
                            <span className="font-medium">MWK {Math.round(Number(specialty.sessionFee || 0) * ((specialty.taxRate || 17.5) / 100)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Processing ({specialty.convenienceFeePercentage || 2}%)</span>
                            <span className="font-medium">MWK {Math.round(Number(specialty.sessionFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100)).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="font-semibold">Subtotal</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              MWK {(
                                Number(specialty.sessionFee || 0) +
                                Math.round(Number(specialty.sessionFee || 0) * ((specialty.taxRate || 17.5) / 100)) +
                                Math.round(Number(specialty.sessionFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100))
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border-2 border-primary/30">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Total Cost</p>
                          <p className="text-sm text-muted-foreground mt-0.5">Booking + Session fees (incl. tax)</p>
                        </div>
                        <p className="text-2xl font-bold text-primary">
                          MWK {(
                            Number(specialty.bookingFee || 0) + Math.round(Number(specialty.bookingFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100)) +
                            Number(specialty.sessionFee || 0) + Math.round(Number(specialty.sessionFee || 0) * ((specialty.taxRate || 17.5) / 100)) + Math.round(Number(specialty.sessionFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100))
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-base font-semibold shadow-lg"
                    onClick={handleBookSlot}
                    disabled={booking}
                  >
                    {booking ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Preparing Payment...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Pay MWK {(Number(specialty.bookingFee || 0) + Math.round(Number(specialty.bookingFee || 0) * ((specialty.convenienceFeePercentage || 2) / 100))).toLocaleString()} Now
                      </div>
                    )}
                  </Button>

                  <div className="bg-muted/50 rounded-lg p-3 border border-dashed">
                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      You will be redirected to Paychangu to complete the booking fee payment.
                      The session fee will be collected after your appointment is completed.
                    </p>
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