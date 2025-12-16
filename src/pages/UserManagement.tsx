import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
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
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });
  const queryClient = useQueryClient();

  const { data: allUsers, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.users || [];
    },
  });

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

  const filteredUsers = allUsers?.filter((u: any) => {
    const matchesSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === 'all' || 
      (u.Role?.name === 'caregiver' && u.Caregiver?.Specialties?.some((s: any) => s.id.toString() === selectedSpecialty));
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && u.isActive) || 
      (statusFilter === 'inactive' && !u.isActive);
    return matchesSearch && matchesSpecialty && matchesStatus;
  }) || [];

  const toggleUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.put(`/admin/users/${userId}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("User status updated successfully");
      setConfirmDialog(prev => ({ ...prev, open: false }));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("User deleted successfully");
      setConfirmDialog(prev => ({ ...prev, open: false }));
    },
  });

  const handleToggleUser = (user: any) => {
    setConfirmDialog({
      open: true,
      title: user.isActive ? "Deactivate User" : "Activate User",
      description: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`,
      action: () => toggleUserMutation.mutate(user.id)
    });
  };

  const handleDeleteUser = (user: any) => {
    setConfirmDialog({
      open: true,
      title: "Delete User",
      description: `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      action: () => deleteUserMutation.mutate(user.id)
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkActivate = () => {
    if (selectedUsers.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Activate Multiple Users",
      description: `Are you sure you want to activate ${selectedUsers.length} selected users?`,
      action: () => {
        selectedUsers.forEach(userId => toggleUserMutation.mutate(userId));
        setSelectedUsers([]);
      }
    });
  };

  const handleBulkDeactivate = () => {
    if (selectedUsers.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Deactivate Multiple Users",
      description: `Are you sure you want to deactivate ${selectedUsers.length} selected users?`,
      action: () => {
        selectedUsers.forEach(userId => toggleUserMutation.mutate(userId));
        setSelectedUsers([]);
      }
    });
  };

  const stats = [
    {
      title: "Total Users",
      value: allUsers?.length || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Users",
      value: allUsers?.filter((u: any) => u.isActive)?.length || 0,
      icon: UserCheck,
      color: "bg-success/10 text-success",
    },
    {
      title: "Caregivers",
      value: allUsers?.filter((u: any) => u.Role?.name === 'caregiver')?.length || 0,
      icon: Users,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Patients",
      value: allUsers?.filter((u: any) => u.Role?.name === 'patient')?.length || 0,
      icon: Users,
      color: "bg-accent/10 text-accent",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all system users and their permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search and Filter Users</CardTitle>
            <CardDescription>Find users by name, email, or specialty</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {specialties?.map((specialty: any) => (
                    <SelectItem key={specialty.id} value={specialty.id.toString()}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="caregivers">Caregivers</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="admins">Administrators</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={handleBulkActivate}
                disabled={selectedUsers.length === 0 || toggleUserMutation.isPending}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Activate Selected ({selectedUsers.length})
              </Button>
              <Button 
                variant="destructive"
                onClick={handleBulkDeactivate}
                disabled={selectedUsers.length === 0 || toggleUserMutation.isPending}
                className="gap-2"
              >
                <XCircle className="h-4 w-4" />
                Deactivate Selected ({selectedUsers.length})
              </Button>
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                            {user.firstName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.Role?.name?.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.Role?.name === 'caregiver' && user.Caregiver?.Specialties?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.Caregiver.Specialties.slice(0, 2).map((specialty: any) => (
                              <Badge key={specialty.id} variant="secondary" className="text-xs">
                                {specialty.name}
                              </Badge>
                            ))}
                            {user.Caregiver.Specialties.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{user.Caregiver.Specialties.length - 2}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => navigate(`/dashboard/user/${user.id}`)}
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button 
                            variant={user.isActive ? "destructive" : "default"} 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleToggleUser(user)}
                            disabled={toggleUserMutation.isPending}
                          >
                            {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => handleDeleteUser(user)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Specialties</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers
                    .filter((u: any) => u.Role?.name === 'caregiver')
                    .map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {user.firstName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.Caregiver?.licenseNumber || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.Caregiver?.experience || 0} years
                        </TableCell>
                        <TableCell>
                          {user.Caregiver?.Specialties?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.Caregiver.Specialties.slice(0, 2).map((specialty: any) => (
                                <Badge key={specialty.id} variant="secondary" className="text-xs">
                                  {specialty.name}
                                </Badge>
                              ))}
                              {user.Caregiver.Specialties.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{user.Caregiver.Specialties.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          ${user.Caregiver?.hourlyRate || 0}/hr
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "secondary"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/dashboard/user/${user.id}`)}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers
                    .filter((u: any) => u.Role?.name === 'patient')
                    .map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {user.firstName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.phone || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Patient</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/dashboard/user/${user.id}`)}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers
                    .filter((u: any) => ['system_manager', 'regional_manager'].includes(u.Role?.name))
                    .map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                              {user.firstName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {user.Role?.name?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {user.phone || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => navigate(`/dashboard/user/${user.id}`)}
                          >
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
        
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
          if (!toggleUserMutation.isPending && !deleteUserMutation.isPending) {
            setConfirmDialog(prev => ({ ...prev, open }));
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={toggleUserMutation.isPending || deleteUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDialog.action}
                disabled={toggleUserMutation.isPending || deleteUserMutation.isPending}
              >
                {toggleUserMutation.isPending || deleteUserMutation.isPending ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;