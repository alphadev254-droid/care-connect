import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Shield,
  Heart,
  Activity,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const handleToggleUser = (user: any) => {
    setConfirmDialog({
      open: true,
      title: user.isActive ? "Deactivate User" : "Activate User",
      description: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`,
      action: () => toggleUserMutation.mutate(user.id)
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
      icon: Heart,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Patients",
      value: allUsers?.filter((u: any) => u.Role?.name === 'patient')?.length || 0,
      icon: Activity,
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all system users
            </p>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="text-xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters - Compact */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">Search & Filters</CardTitle>
            <CardDescription className="text-xs">Find users by name, email, specialty, or status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="h-9">
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
                <SelectTrigger className="h-9">
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

        {/* Users Tables */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="caregivers">
              Caregivers ({filteredUsers.filter((u: any) => u.Role?.name === 'caregiver').length})
            </TabsTrigger>
            <TabsTrigger value="patients">
              Patients ({filteredUsers.filter((u: any) => u.Role?.name === 'patient').length})
            </TabsTrigger>
            <TabsTrigger value="admins">
              Administrators ({filteredUsers.filter((u: any) => ['system_manager', 'regional_manager'].includes(u.Role?.name)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9">User</TableHead>
                      <TableHead className="h-9">Role</TableHead>
                      <TableHead className="h-9">Contact</TableHead>
                      <TableHead className="h-9">Status</TableHead>
                      <TableHead className="h-9">Joined</TableHead>
                      <TableHead className="h-9 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user: any) => (
                        <TableRow key={user.id}>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                                {user.firstName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.Role?.name?.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {user.phone || '-'}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2 text-xs text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-7 text-xs"
                                onClick={() => navigate(`/dashboard/user/${user.id}`)}
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                              <Button
                                variant={user.isActive ? "outline" : "default"}
                                size="sm"
                                className="gap-1 h-7 text-xs"
                                onClick={() => handleToggleUser(user)}
                                disabled={toggleUserMutation.isPending}
                              >
                                {user.isActive ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caregivers" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9">Caregiver</TableHead>
                      <TableHead className="h-9">License</TableHead>
                      <TableHead className="h-9">Experience</TableHead>
                      <TableHead className="h-9">Specialties</TableHead>
                      <TableHead className="h-9">Verification</TableHead>
                      <TableHead className="h-9">Status</TableHead>
                      <TableHead className="h-9 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.filter((u: any) => u.Role?.name === 'caregiver').length > 0 ? (
                      filteredUsers
                        .filter((u: any) => u.Role?.name === 'caregiver')
                        .map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                                  {user.firstName?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-xs">
                              {user.Caregiver?.licenseNumber || '-'}
                            </TableCell>
                            <TableCell className="py-2 text-xs font-medium">
                              {user.Caregiver?.experience || 0} years
                            </TableCell>
                            <TableCell className="py-2">
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
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge
                                variant={user.Caregiver?.verificationStatus === 'verified' ? 'default' :
                                        user.Caregiver?.verificationStatus === 'pending' ? 'secondary' : 'destructive'}
                                className="text-xs capitalize"
                              >
                                {user.Caregiver?.verificationStatus || 'unverified'}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => navigate(`/dashboard/user/${user.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                          <Heart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No caregivers found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9">Patient</TableHead>
                      <TableHead className="h-9">Contact</TableHead>
                      <TableHead className="h-9">Location</TableHead>
                      <TableHead className="h-9">Status</TableHead>
                      <TableHead className="h-9">Joined</TableHead>
                      <TableHead className="h-9 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.filter((u: any) => u.Role?.name === 'patient').length > 0 ? (
                      filteredUsers
                        .filter((u: any) => u.Role?.name === 'patient')
                        .map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                                  {user.firstName?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2 text-xs">
                              {user.phone || '-'}
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {user.Patient?.region || user.Patient?.district || '-'}
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="default" className="text-xs">Active</Badge>
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => navigate(`/dashboard/user/${user.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No patients found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-9">Administrator</TableHead>
                      <TableHead className="h-9">Role</TableHead>
                      <TableHead className="h-9">Contact</TableHead>
                      <TableHead className="h-9">Status</TableHead>
                      <TableHead className="h-9">Joined</TableHead>
                      <TableHead className="h-9 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.filter((u: any) => ['system_manager', 'regional_manager'].includes(u.Role?.name)).length > 0 ? (
                      filteredUsers
                        .filter((u: any) => ['system_manager', 'regional_manager'].includes(u.Role?.name))
                        .map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
                                  {user.firstName?.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.Role?.name?.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-xs">
                              {user.phone || '-'}
                            </TableCell>
                            <TableCell className="py-2">
                              <Badge variant="default" className="text-xs">Active</Badge>
                            </TableCell>
                            <TableCell className="py-2 text-xs text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="py-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => navigate(`/dashboard/user/${user.id}`)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                          <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No administrators found</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
          if (!toggleUserMutation.isPending) {
            setConfirmDialog(prev => ({ ...prev, open }));
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={toggleUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDialog.action}
                disabled={toggleUserMutation.isPending}
              >
                {toggleUserMutation.isPending ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
