import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { timeSlotService, TimeSlot } from '@/services/timeSlotService';
import { appointmentService } from '@/services/appointmentService';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  caregiverId: number;
  caregiverName: string;
  specialtyId: number;
}

export const BookingModal = ({ open, onClose, caregiverId, caregiverName, specialtyId }: BookingModalProps) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('+265 ');
  const [specialty, setSpecialty] = useState<any>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (open && caregiverId) {
      fetchAvailableSlots();
      fetchSpecialty();
    }
  }, [open, caregiverId, specialtyId]);

  const fetchSpecialty = async () => {
    try {
      const response = await api.get(`/specialties/${specialtyId}`);
      setSpecialty(response.data.specialty);
    } catch (error) {
      toast.error('Failed to load specialty details');
    }
  };

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
        specialtyId,
        sessionType: 'in_person',
        phoneNumber: phoneNumber
      });

      // Step 3: Redirect to Paychangu checkout
      console.log('Payment response:', paymentResponse);
      console.log('Checkout URL:', paymentResponse.checkoutUrl);
      
      if (paymentResponse.checkoutUrl) {
        toast.success('Redirecting to payment...');
        onClose();
        // Use location.href instead of window.open to avoid popup blockers
        window.location.href = paymentResponse.checkoutUrl;
      } else {
        console.error('No checkout URL in response:', paymentResponse);
        throw new Error('Payment URL not received');
      }
    } catch (error) {
      console.error('Booking error:', error);
      
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
        console.error('Failed to unlock slot:', unlockError);
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

              {selectedSlot && specialty && (
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-lg mb-4">Booking Summary</h4>

                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p className="font-medium">
                          {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="font-medium">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration & Specialty</p>
                        <p className="font-medium">{selectedSlot.duration || 180} minutes</p>
                        <p className="font-medium text-primary">{specialty.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <h5 className="font-medium mb-2">Contact Information</h5>
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Phone Number (for payment)</label>
                        <Input
                          type="tel"
                          placeholder="+265 998 95 15 10"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Enter your mobile money number for payment
                        </p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-2">Payment Details</h5>
                      <div className="text-sm space-y-2 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          <strong>Two-stage payment:</strong> Pay booking fee now, session fee after service
                        </p>
                        <div className="flex justify-between">
                          <span>Booking Fee (pay now):</span>
                          <span className="font-semibold text-green-600">
                            MWK {Number(specialty.bookingFee || 0).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Session Fee (pay after):</span>
                          <span className="font-semibold text-blue-600">
                            MWK {Number(specialty.sessionFee || 0).toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 text-base">
                          <span>Total Cost:</span>
                          <span>MWK {(Number(specialty.bookingFee || 0) + Number(specialty.sessionFee || 0)).toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-12 text-lg"
                    onClick={handleBookSlot}
                    disabled={booking}
                  >
                    {booking ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Preparing Payment...
                      </div>
                    ) : (
                      `Pay Booking Fee - MWK ${Number(specialty.bookingFee || 0).toFixed(0)}`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-2">
                    You will be redirected to Paychangu to pay the booking fee. Session fee is paid after the service is completed.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};