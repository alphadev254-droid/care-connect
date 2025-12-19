import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, RefreshCw } from 'lucide-react';
import { timeSlotService, TimeSlot } from '@/services/timeSlotService';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export const TimeSlotViewer = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [caregiverId, setCaregiverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'booked'>('all');

  useEffect(() => {
    if (user) {
      fetchCaregiverProfile();
    }
  }, [user]);

  const fetchCaregiverProfile = async () => {
    try {
      const response = await api.get('/caregivers/profile');
      const caregiver = response.data.caregiver;
      setCaregiverId(caregiver.id);
      loadTimeSlots(caregiver.id);
    } catch (error) {
      toast.error('Failed to load caregiver profile');
    }
  };

  const loadTimeSlots = async (id: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/timeslots/caregiver/${id}`);
      setSlots(response.data.slots || []);
    } catch (error) {
      // Fallback to available slots endpoint
      try {
        const availableSlots = await timeSlotService.getAvailableSlots({ caregiverId: id });
        setSlots(availableSlots);
      } catch (fallbackError) {
        toast.error('Failed to load time slots');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshSlots = () => {
    if (caregiverId) {
      loadTimeSlots(caregiverId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'locked':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSlots = slots.filter(slot => {
    if (filter === 'all') return true;
    if (filter === 'available') return slot.status === 'available';
    if (filter === 'booked') return slot.status === 'booked';
    return true;
  });

  const availableCount = slots.filter(s => s.status === 'available').length;
  const bookedCount = slots.filter(s => s.status === 'booked').length;
  const lockedCount = slots.filter(s => s.status === 'locked').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Time Slots (3-hour sessions)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={refreshSlots} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{availableCount}</div>
            <div className="text-sm text-green-700">Available</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{bookedCount}</div>
            <div className="text-sm text-blue-700">Booked</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{lockedCount}</div>
            <div className="text-sm text-yellow-700">Locked</div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({slots.length})
          </Button>
          <Button
            variant={filter === 'available' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('available')}
          >
            Available ({availableCount})
          </Button>
          <Button
            variant={filter === 'booked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('booked')}
          >
            Booked ({bookedCount})
          </Button>
        </div>

        {/* Slots Grid */}
        {loading ? (
          <div className="text-center py-8">Loading time slots...</div>
        ) : filteredSlots.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No time slots found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'Generate time slots from your availability first'
                : `No ${filter} slots available`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {filteredSlots.map((slot) => (
              <Card key={slot.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(slot.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <Badge variant="secondary" className="text-xs">3hrs</Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(slot.status)}>
                        {slot.status}
                      </Badge>
                      {slot.status === 'booked' && slot.appointmentId && (
                        <Badge variant="outline">
                          <User className="h-3 w-3 mr-1" />
                          Appointment #{slot.appointmentId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};