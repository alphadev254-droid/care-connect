import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Clock, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
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
  const [generatingSlotId, setGeneratingSlotId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<'single' | 'all' | null>(null);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

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
      const response = await availabilityService.getAvailability(id);
      const availabilityData = response.availability || [];
      setSavedAvailability(availabilityData);
      setAvailability(availabilityData.map((item: any) => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
      })));
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
      setSavedAvailability([]);
      setAvailability([]);
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
      // Error messages are handled by api interceptor
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
    setAvailability((savedAvailability || []).map((item: any) => ({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
    })));
  };

  const openDeleteDialog = (slotId: number) => {
    setSlotToDelete(slotId);
    setDeleteAction('single');
    setDeleteDialogOpen(true);
  };

  const openClearAllDialog = () => {
    setDeleteAction('all');
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!caregiverId) {
      toast.error('Caregiver ID not found');
      setDeleteDialogOpen(false);
      return;
    }

    setLoading(true);
    try {
      if (deleteAction === 'single' && slotToDelete) {
        await availabilityService.deleteSlot(slotToDelete);
        await loadAvailability(caregiverId);
        toast.success('Availability slot and related time slots deleted');
      } else if (deleteAction === 'all') {
        const response = await availabilityService.clearAll();
        await loadAvailability(caregiverId);
        setAvailability([]);
        setEditing(false);
        toast.success(`All availability cleared (${response.deleted} slots deleted)`);
      }
    } catch (error: any) {
      console.error('Failed to delete:', error);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSlotToDelete(null);
      setDeleteAction(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSlotToDelete(null);
    setDeleteAction(null);
  };


  const generateTimeSlotsForSlot = async (availabilityId: number) => {
    if (!caregiverId) return;

    setGeneratingSlotId(availabilityId);
    try {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      await timeSlotService.generateTimeSlotsForAvailability({
        availabilityId,
        startDate,
        endDate,
      });

      // Reload availability to update hasTimeSlots flags
      await loadAvailability(caregiverId);
      toast.success('Time slots generated for next 30 days');
    } catch (error) {
      toast.error('Failed to generate time slots');
    } finally {
      setGeneratingSlotId(null);
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
        {!editing && savedAvailability && savedAvailability.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Current Schedule</h4>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={openClearAllDialog}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {savedAvailability.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant="secondary">
                      {DAYS.find(d => d.value === slot.dayOfWeek)?.label}
                    </Badge>
                    <span className="text-sm">{slot.startTime?.slice(0,5)} - {slot.endTime?.slice(0,5)}</span>
                    {slot.hasTimeSlots && (
                      <Badge variant="outline" className="text-xs">
                        {slot.timeSlotCount} slots generated
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!slot.hasTimeSlots && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => generateTimeSlotsForSlot(slot.id)}
                        disabled={generatingSlotId === slot.id || loading}
                      >
                        {generatingSlotId === slot.id ? 'Generating...' : 'Generate Slots'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(slot.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(editing || (savedAvailability && savedAvailability.length === 0)) && (
          <>
            {availability && availability.map((slot, index) => (
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

        {(editing || (savedAvailability && savedAvailability.length === 0)) && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={addAvailabilitySlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>

            <Button
              onClick={saveAvailability}
              disabled={loading || !availability || availability.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Saving...' : `Save Availability (${availability?.length || 0})`}
            </Button>

            {editing && (
              <Button variant="outline" onClick={cancelEditing}>
                Cancel
              </Button>
            )}
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </DialogTitle>
              <DialogDescription>
                {deleteAction === 'single'
                  ? 'Deleting this availability will also remove all related time slots. Are you sure you want to continue?'
                  : 'This will clear all availability and delete all related time slots. Are you sure you want to continue?'
                }
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDelete} disabled={loading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};