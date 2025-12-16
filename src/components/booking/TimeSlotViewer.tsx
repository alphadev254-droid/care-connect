import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, DollarSign, User, RefreshCw, Edit2, Check, X, Square, CheckSquare } from 'lucide-react';
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
  const [editingSlot, setEditingSlot] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [bulkEditing, setBulkEditing] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<string>('');
  const [selectedSlots, setSelectedSlots] = useState<Set<number>>(new Set());

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

  const startEditPrice = (slot: TimeSlot) => {
    setEditingSlot(slot.id);
    setEditPrice(slot.price.toString());
  };

  const cancelEditPrice = () => {
    setEditingSlot(null);
    setEditPrice('');
  };

  const savePrice = async (slotId: number) => {
    try {
      const newPrice = parseFloat(editPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      await api.put(`/timeslots/${slotId}/price`, { price: newPrice });
      toast.success('Price updated successfully');
      
      setEditingSlot(null);
      setEditPrice('');
      refreshSlots();
    } catch (error) {
      toast.error('Failed to update price');
    }
  };

  const startBulkEdit = () => {
    setBulkEditing(true);
    setBulkPrice('');
    setSelectedSlots(new Set());
  };

  const cancelBulkEdit = () => {
    setBulkEditing(false);
    setBulkPrice('');
    setSelectedSlots(new Set());
  };

  const toggleSlotSelection = (slotId: number) => {
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slotId)) {
      newSelected.delete(slotId);
    } else {
      newSelected.add(slotId);
    }
    setSelectedSlots(newSelected);
  };

  const selectAllAvailable = () => {
    const availableSlotIds = filteredSlots
      .filter(slot => slot.status === 'available')
      .map(slot => slot.id);
    setSelectedSlots(new Set(availableSlotIds));
  };

  const deselectAll = () => {
    setSelectedSlots(new Set());
  };

  const saveBulkPrice = async () => {
    try {
      const newPrice = parseFloat(bulkPrice);
      if (isNaN(newPrice) || newPrice <= 0) {
        toast.error('Please enter a valid price');
        return;
      }

      const slotIds = selectedSlots.size > 0 ? Array.from(selectedSlots) : null;
      const response = await api.put('/timeslots/bulk/price', { 
        price: newPrice,
        slotIds 
      });
      
      toast.success(`Updated ${response.data.updatedCount} time slots`);
      
      setBulkEditing(false);
      setBulkPrice('');
      setSelectedSlots(new Set());
      refreshSlots();
    } catch (error) {
      toast.error('Failed to update prices');
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
            My Time Slots
          </CardTitle>
          <div className="flex gap-2">
            {availableCount > 0 && (
              <Button variant="outline" size="sm" onClick={startBulkEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Bulk Edit Price
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={refreshSlots} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk Edit Interface */}
        {bulkEditing && (
          <Card className="border-primary">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Bulk Update Time Slot Prices</h4>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={selectAllAvailable}>
                      Select All Available ({availableCount})
                    </Button>
                    <Button size="sm" variant="outline" onClick={deselectAll}>
                      Deselect All
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">New price:</span>
                    <Input
                      type="number"
                      value={bulkPrice}
                      onChange={(e) => setBulkPrice(e.target.value)}
                      placeholder="Enter price in MWK"
                      className="w-40"
                    />
                    <span className="text-sm text-muted-foreground">MWK</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveBulkPrice}>
                      <Check className="h-4 w-4 mr-1" />
                      Update {selectedSlots.size > 0 ? `${selectedSlots.size} Selected` : 'All Available'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelBulkEdit}>
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {selectedSlots.size > 0 
                    ? `${selectedSlots.size} slots selected for update`
                    : 'No slots selected - will update all available slots'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}
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
              <Card key={slot.id} className={`hover:shadow-sm transition-shadow ${
                bulkEditing && selectedSlots.has(slot.id) ? 'ring-2 ring-primary' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {bulkEditing && slot.status === 'available' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSlotSelection(slot.id)}
                          className="p-1 h-auto"
                        >
                          {selectedSlots.has(slot.id) ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(slot.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {editingSlot === slot.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-24 h-8"
                              placeholder="Price"
                            />
                            <Button size="sm" variant="ghost" onClick={() => savePrice(slot.id)}>
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditPrice}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>MWK {slot.price}</span>
                            {slot.status === 'available' && (
                              <Button size="sm" variant="ghost" onClick={() => startEditPrice(slot)}>
                                <Edit2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
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