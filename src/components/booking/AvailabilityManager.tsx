import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus, Trash2, Edit2 } from 'lucide-react';
import { availabilityService, AvailabilitySlot, CaregiverAvailability } from '@/services/availabilityService';
import { timeSlotService } from '@/services/timeSlotService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

export const AvailabilityManager = () => {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [savedAvailability, setSavedAvailability] = useState<CaregiverAvailability[]>([]);
  const [caregiverId, setCaregiverId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCaregiverProfile();
    }
  }, [user]);

  const fetchCaregiverProfile = async () => {
    try {
      const response = await api.get('/caregivers/profile');
      const caregiver = response.data.caregiver;
      console.log('caregiver ',caregiver)
      const actualCaregiverId = caregiver.id
      setCaregiverId(actualCaregiverId);
      loadAvailability(actualCaregiverId);
    } catch (error) {
      console.error('Failed to fetch caregiver profile:', error);
      toast.error('Failed to load caregiver profile');
    }
  };

  const loadAvailability = async (id: number) => {
    try {
      const data = await availabilityService.getAvailability(id);
      setSavedAvailability(data);
      setAvailability(data.map((item: any) => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      })));
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
    }
  };

  const addAvailabilitySlot = () => {
    setAvailability([...availability, { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }]);
  };

  const removeAvailabilitySlot = (index: number) => {
    const updatedAvailability = availability.filter((_, i) => i !== index);
    setAvailability(updatedAvailability);
    // No auto-save - user must click "Save" button
  };

  const updateAvailabilitySlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const saveAvailability = async () => {
    // if (!caregiverId || caregiverId === 0) {
    //   toast.error('Caregiver ID not found');
    //   return;
    // }

    setLoading(true);
    try {
      const response = await availabilityService.setAvailability(availability);
      await loadAvailability(caregiverId);
      setEditing(false);

      if (response.deleted !== undefined && response.created !== undefined) {
        toast.success(`Availability saved (${response.deleted} deleted, ${response.created} created)`);
      } else {
        toast.success('Availability saved successfully');
      }
    } catch (error: any) {
      console.error('Failed to save availability:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.errors?.join(', ') || 'Failed to save availability';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = () => {
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    // Reset to saved availability
    setAvailability(savedAvailability.map((item: any) => ({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
    })));
  };

  const deleteIndividualSlot = async (slotId: number) => {
    if (!caregiverId) {
      toast.error('Caregiver ID not found');
      return;
    }

    setLoading(true);
    try {
      await availabilityService.deleteSlot(slotId);
      await loadAvailability(caregiverId);
      toast.success('Availability slot deleted');
    } catch (error: any) {
      console.error('Failed to delete slot:', error);
      toast.error(error?.response?.data?.error || 'Failed to delete availability slot');
    } finally {
      setLoading(false);
    }
  };

  const clearAllAvailability = async () => {
    if (!caregiverId) {
      toast.error('Caregiver ID not found');
      return;
    }

    setLoading(true);
    try {
      const response = await availabilityService.clearAll();
      await loadAvailability(caregiverId);
      setAvailability([]);
      setEditing(false);
      toast.success(`All availability cleared (${response.deleted} slots deleted)`);
    } catch (error: any) {
      console.error('Failed to clear availability:', error);
      toast.error(error?.response?.data?.error || 'Failed to clear availability');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = async () => {
    if (!caregiverId) return;
    
    setGenerating(true);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await timeSlotService.generateTimeSlots({
        caregiverId,
        startDate,
        endDate,
      });
      
      toast.success('Time slots generated for next 30 days');
    } catch (error) {
      toast.error('Failed to generate time slots');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Availability Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!editing && savedAvailability.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Current Schedule</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={startEditing}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={clearAllAvailability}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {savedAvailability.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">
                      {DAYS.find(d => d.value === slot.dayOfWeek)?.label}
                    </Badge>
                    <span className="text-sm">{slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteIndividualSlot(slot.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(editing || savedAvailability.length === 0) && (
          <>
            {availability.map((slot, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) => updateAvailabilitySlot(index, 'dayOfWeek', parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md"
                >
                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateAvailabilitySlot(index, 'startTime', e.target.value)}
                  className="w-32"
                />
                
                <span className="text-muted-foreground">to</span>
                
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateAvailabilitySlot(index, 'endTime', e.target.value)}
                  className="w-32"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeAvailabilitySlot(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </>
        )}

        {(editing || savedAvailability.length === 0) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={addAvailabilitySlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
            
            <Button
              onClick={saveAvailability}
              disabled={loading || availability.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Saving...' : `Save Availability (${availability.length})`}
            </Button>
            
            {editing && (
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            )}
          </div>
        )}

        {savedAvailability.length > 0 && (
          <div className="pt-4 border-t">
            <Button onClick={generateTimeSlots} disabled={generating} className="w-full">
              {generating ? 'Generating...' : 'Generate Time Slots (Next 30 Days)'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};