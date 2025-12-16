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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (open && caregiverId) {
      fetchAvailableSlots();
    }
  }, [open, caregiverId]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const availableSlots = await timeSlotService.getAvailableSlots({ caregiverId });
      setSlots(availableSlots.slice(0, 20));
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
      
      // Step 2: Create appointment first
      toast.info('Creating appointment...');
      const appointment = await appointmentService.createAppointment({
        timeSlotId: selectedSlot.id,
        specialtyId,
        sessionType: 'in_person',
      });

      // Step 3: Initiate real payment with Paychangu
      toast.info('Initiating payment...');
      const paymentResponse = await api.post('/payments/initiate', {
        appointmentId: appointment.id,
        phoneNumber: phoneNumber
      });

      // Step 4: Redirect to Paychangu checkout
      if (paymentResponse.data.checkoutUrl) {
        toast.success('Redirecting to payment...');
        // Open payment in new window or redirect
        window.open(paymentResponse.data.checkoutUrl, '_blank');
        
        // Close modal and show success message
        onClose();
        toast.info('Complete payment in the new window to confirm your appointment.');
      } else {
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
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(slot.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>MWK {slot.price}</span>
                          <Badge variant="secondary">{slot.duration}min</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedSlot && (
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
                        <p className="text-sm text-muted-foreground">Duration & Cost</p>
                        <p className="font-medium">{selectedSlot.duration} minutes</p>
                        <p className="text-2xl font-bold text-primary">MWK {selectedSlot.price}</p>
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
                      <h5 className="font-medium">Payment Details</h5>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Session fee:</span>
                          <span>MWK {selectedSlot.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform fee:</span>
                          <span>MWK 0</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>MWK {selectedSlot.price}</span>
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
                      `Proceed to Pay MWK ${selectedSlot.price}`
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    You will be redirected to Paychangu for secure payment. Appointment will be confirmed after successful payment.
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