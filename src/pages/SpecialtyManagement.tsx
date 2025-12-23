import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import DashboardLayout from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import { Users, Calendar } from "lucide-react";
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  RotateCcw,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface Specialty {
  id: number;
  name: string;
  description: string;
  sessionFee: number;
  bookingFee: number;
  isActive: boolean;
  completedAppointments?: number;
  totalIncome?: number;
  activeCaregiversCount?: number;
}

const SpecialtyManagement = () => {
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sessionFee: "",
    bookingFee: "",
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MW', {
      style: 'currency',
      currency: 'MWK'
    }).format(amount);
  };

  const { data: specialties, isLoading } = useQuery({
    queryKey: ["specialties", "all"],
    queryFn: async () => {
      const response = await api.get("/specialties?includeInactive=true");
      return response.data.specialties || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await api.post("/specialties", {
        name: data.name,
        description: data.description,
        sessionFee: parseFloat(data.sessionFee) || 0,
        bookingFee: parseFloat(data.bookingFee) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty created successfully");
      setCreateDialog(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      await api.put(`/specialties/${id}`, {
        name: data.name,
        description: data.description,
        sessionFee: parseFloat(data.sessionFee) || 0,
        bookingFee: parseFloat(data.bookingFee) || 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty updated successfully");
      setEditDialog(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/specialties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty deactivated successfully");
      setDeleteDialog(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/specialties/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["specialties"] });
      toast.success("Specialty restored successfully");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", sessionFee: "", bookingFee: "" });
    setSelectedSpecialty(null);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a specialty name");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setFormData({
      name: specialty.name,
      description: specialty.description || "",
      sessionFee: specialty.sessionFee?.toString() || "0",
      bookingFee: specialty.bookingFee?.toString() || "0",
    });
    setEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedSpecialty) return;
    if (!formData.name.trim()) {
      toast.error("Please enter a specialty name");
      return;
    }
    updateMutation.mutate({ id: selectedSpecialty.id, data: formData });
  };

  const handleDelete = (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedSpecialty) {
      deleteMutation.mutate(selectedSpecialty.id);
    }
  };

  const handleRestore = (id: number) => {
    restoreMutation.mutate(id);
  };

  const activeSpecialties = specialties?.filter((s: Specialty) => s.isActive) || [];
  const inactiveSpecialties = specialties?.filter((s: Specialty) => !s.isActive) || [];

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Specialty Management</h1>
            <p className="text-muted-foreground">
              Manage healthcare specialties and their associated fees
            </p>
          </div>
          <Button onClick={() => setCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Specialty
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Caregivers</CardTitle>
              <Users className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-lg font-bold">
                {activeSpecialties.reduce((sum, s) => sum + (s.activeCaregiversCount || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Patients Booked</CardTitle>
              <Calendar className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-lg font-bold">
                {activeSpecialties.reduce((sum, s) => sum + (s.completedAppointments || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Income (MWK)</CardTitle>
              <DollarSign className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-lg font-bold text-green-600">
                {activeSpecialties.reduce((sum, s) => sum + parseFloat(s.totalIncome?.toString() || '0'), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="p-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">Active Specialties</CardTitle>
              <CheckCircle className="h-3 w-3 text-success" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-lg font-bold">{activeSpecialties.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Specialties</CardTitle>
            <CardDescription>
              Currently available specialties for caregivers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Caregivers</TableHead>
                  <TableHead>Patients Booked</TableHead>
                  <TableHead>Total Income (MWK)</TableHead>
                  <TableHead>Session Fee (MWK)</TableHead>
                  <TableHead>Booking Fee (MWK)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading specialties...
                    </TableCell>
                  </TableRow>
                ) : activeSpecialties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No active specialties found
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSpecialties.map((specialty: Specialty) => {
                    const caregiverCount = specialty.activeCaregiversCount || 0;
                    const patientCount = specialty.completedAppointments || 0;
                    const income = parseFloat(specialty.totalIncome?.toString() || '0');
                    
                    return (
                      <TableRow key={specialty.id}>
                        <TableCell className="font-medium">{specialty.name}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {specialty.description || "-"}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {caregiverCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {patientCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            {income.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                             {specialty.sessionFee || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            {specialty.bookingFee || 0}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(specialty)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(specialty)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {inactiveSpecialties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Inactive Specialties</CardTitle>
              <CardDescription>
                Deactivated specialties that can be restored
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Session Fee</TableHead>
                    <TableHead>Booking Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveSpecialties.map((specialty: Specialty) => (
                    <TableRow key={specialty.id}>
                      <TableCell className="font-medium opacity-60">{specialty.name}</TableCell>
                      <TableCell className="max-w-xs truncate opacity-60">
                        {specialty.description || "-"}
                      </TableCell>
                      <TableCell className="opacity-60">
                        MWK {specialty.sessionFee || 0}
                      </TableCell>
                      <TableCell className="opacity-60">
                        MWK {specialty.bookingFee || 0}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Inactive</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(specialty.id)}
                          className="gap-2"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Specialty</DialogTitle>
            <DialogDescription>
              Add a new healthcare specialty with associated fees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Specialty Name</Label>
              <Input
                id="name"
                placeholder="e.g., Elderly Care"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the specialty"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sessionFee">Session Fee (MWK)</Label>
                <Input
                  id="sessionFee"
                  type="number"
                  placeholder="0.00"
                  value={formData.sessionFee}
                  onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bookingFee">Booking Fee (MWK)</Label>
                <Input
                  id="bookingFee"
                  type="number"
                  placeholder="0.00"
                  value={formData.bookingFee}
                  onChange={(e) => setFormData({ ...formData, bookingFee: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Specialty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Specialty</DialogTitle>
            <DialogDescription>
              Update specialty information and fees
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Specialty Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sessionFee">Session Fee (MWK)</Label>
                <Input
                  id="edit-sessionFee"
                  type="number"
                  value={formData.sessionFee}
                  onChange={(e) => setFormData({ ...formData, sessionFee: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bookingFee">Booking Fee (MWK)</Label>
                <Input
                  id="edit-bookingFee"
                  type="number"
                  value={formData.bookingFee}
                  onChange={(e) => setFormData({ ...formData, bookingFee: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update Specialty"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Specialty</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate this specialty? This will remove
              it from the active specialties list, but you can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SpecialtyManagement;
