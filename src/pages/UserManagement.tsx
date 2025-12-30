import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Eye,
  Heart,
  Activity,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserManagement = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });
  const [createUserDialog, setCreateUserDialog] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    idNumber: "",
    roleId: "",
    assignedRegion: ""
  });
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, selectedSpecialty, statusFilter]);

  // Set role filter from URL params
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      setRoleFilter(roleParam);
    }
  }, [searchParams]);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin", "users", currentPage, debouncedSearch, roleFilter, selectedSpecialty, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "100",
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(selectedSpecialty !== "all" && { specialty: selectedSpecialty }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });
      const response = await api.get(`/admin/users?${params}`);
      return response.data;
    },
  });

  const users = usersData?.users || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = Math.ceil(totalUsers / 100);

  // Get stats from separate endpoint
  const { data: statsData } = useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: async () => {
      const response = await api.get("/admin/users/stats");
      return response.data;
    },
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await api.get("/admin/roles");
      return response.data;
    },
  });

  const roles = rolesData?.roles || [];

  const { data: specialties } = useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const response = await api.get("/specialties");
      return response.data.specialties || [];
    },
  });

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

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.post('/admin/users', userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success('User created successfully and credentials sent via email');
      setCreateUserDialog(false);
      setCreateUserForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        idNumber: "",
        roleId: "",
        assignedRegion: ""
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  });

  const handleToggleUser = (user: any) => {
    setConfirmDialog({
      open: true,
      title: user.isActive ? "Deactivate User" : "Activate User",
      description: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}?`,
      action: () => toggleUserMutation.mutate(user.id)
    });
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(createUserForm);
  };

  // Helper function to check if current user can view details of a specific user role
  const canViewUserDetails = (userRole: string) => {
    const role = userRole?.toLowerCase();
    if (role === 'caregiver' && !hasPermission('view_caregivers')) return false;
    if (role === 'patient' && !hasPermission('view_patients')) return false;
    if (role === 'accountant' && !hasPermission('view_accountants')) return false;
    if (role === 'regional_manager' && !hasPermission('view_regional_managers')) return false;
    if (role === 'system_manager' && !hasPermission('view_system_managers')) return false;
    return true;
  };

  // Helper function to check if current user can perform specific actions on user roles
  const canEditUser = (userRole: string) => {
    const role = userRole?.toLowerCase();
    if (role === 'caregiver') return hasPermission('edit_caregivers');
    if (role === 'patient') return hasPermission('edit_patients');
    if (role === 'accountant') return hasPermission('edit_accountants');
    if (role === 'regional_manager') return hasPermission('edit_regional_managers');
    if (role === 'system_manager') return hasPermission('edit_system_managers');
    return false; // Default to false for unknown roles
  };

  const canActivateDeactivateUser = (userRole: string, isActive: boolean) => {
    const role = userRole?.toLowerCase();
    if (role === 'caregiver') {
      return isActive ? hasPermission('deactivate_caregivers') : hasPermission('activate_caregivers');
    }
    if (role === 'patient') {
      return isActive ? hasPermission('deactivate_patients') : hasPermission('activate_patients');
    }
    if (role === 'accountant') {
      return isActive ? hasPermission('deactivate_accountants') : hasPermission('activate_accountants');
    }
    if (role === 'regional_manager') {
      return isActive ? hasPermission('deactivate_regional_managers') : hasPermission('activate_regional_managers');
    }
    if (role === 'system_manager') {
      return isActive ? hasPermission('deactivate_system_managers') : hasPermission('activate_system_managers');
    }
    return false; // Default to false for unknown roles
  };

  // Filter roles for user creation (exclude patient, caregiver, system_manager)
  const createUserRoles = roles.filter((role: any) => 
    !['patient', 'caregiver', 'system_manager'].includes(role.name)
  );

  const requiresRegion = ['regional_manager', 'accountant'].includes(
    roles.find((r: any) => r.id.toString() === createUserForm.roleId)?.name
  );

  const stats = [
    {
      title: "Total Users",
      value: statsData?.total || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Users",
      value: statsData?.active || 0,
      icon: UserCheck,
      color: "bg-success/10 text-success",
    },
    {
      title: "Caregivers",
      value: statsData?.caregivers || 0,
      icon: Heart,
      color: "bg-secondary/10 text-secondary",
    },
    {
      title: "Patients",
      value: statsData?.patients || 0,
      icon: Activity,
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Accountants",
      value: statsData?.accountants || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Regional Managers",
      value: statsData?.regionalManagers || 0,
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "System Managers",
      value: statsData?.systemManagers || 0,
      icon: UserCheck,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <ProtectedRoute requiredPermissions={['view_caregivers', 'view_patients', 'view_accountants', 'view_regional_managers', 'view_system_managers']}>
      <DashboardLayout userRole={mapUserRole(user?.role || 'system_manager')}>
        <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all system users
            </p>
          </div>
          {hasPermission('create_users') && (
            <Button onClick={() => setCreateUserDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create User
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-2">
              <CardContent className="p-2">
                <div className="text-center">
                  <div className={`h-6 w-6 rounded ${stat.color} flex items-center justify-center mx-auto mb-1`}>
                    <stat.icon className="h-3 w-3" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base">Search & Filters</CardTitle>
            <CardDescription className="text-xs">Find users by name, email, role, specialty, or status</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles?.filter((role: any) => {
                    // Filter roles based on permissions
                    const roleName = role.name?.toLowerCase();
                    if (roleName === 'caregiver' && !hasPermission('view_caregivers')) return false;
                    if (roleName === 'patient' && !hasPermission('view_patients')) return false;
                    if (roleName === 'accountant' && !hasPermission('view_accountants')) return false;
                    if (roleName === 'regional_manager' && !hasPermission('view_regional_managers')) return false;
                    if (roleName === 'system_manager' && !hasPermission('view_system_managers')) return false;
                    return true;
                  }).map((role: any) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Users Table */}
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Users ({totalUsers})</CardTitle>
              <div className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages} • Showing {users.length} users
              </div>
            </div>
          </CardHeader>
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length > 0 ? (
                  users.filter((user: any) => {
                    // Filter users based on role permissions
                    const roleName = user.Role?.name?.toLowerCase();
                    if (roleName === 'caregiver' && !hasPermission('view_caregivers')) return false;
                    if (roleName === 'patient' && !hasPermission('view_patients')) return false;
                    if (roleName === 'accountant' && !hasPermission('view_accountants')) return false;
                    if (roleName === 'regional_manager' && !hasPermission('view_regional_managers')) return false;
                    if (roleName === 'system_manager' && !hasPermission('view_system_managers')) return false;
                    return true;
                  }).map((user: any) => (
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
                        {user.Role?.name !== 'system_manager' ? (
                          <div className="flex items-center justify-end gap-1">
                            {canViewUserDetails(user.Role?.name) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-7 text-xs"
                                onClick={() => navigate(`/dashboard/user/${user.id}`)}
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Button>
                            )}
                            {canEditUser(user.Role?.name) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 h-7 text-xs"
                                onClick={() => navigate(`/dashboard/users/edit/${user.id}`)}
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                            )}
                            {canActivateDeactivateUser(user.Role?.name, user.isActive) && (
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
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">Protected</div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      No users found matching the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <div className="text-xs text-muted-foreground">
                  Showing {((currentPage - 1) * 100) + 1} to {Math.min(currentPage * 100, totalUsers)} of {totalUsers} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-1">
                    {(() => {
                      const maxButtons = 5;
                      let startPage: number;
                      let endPage: number;

                      if (totalPages <= maxButtons) {
                        startPage = 1;
                        endPage = totalPages;
                      } else {
                        if (currentPage <= 3) {
                          startPage = 1;
                          endPage = maxButtons;
                        } else if (currentPage >= totalPages - 2) {
                          startPage = totalPages - maxButtons + 1;
                          endPage = totalPages;
                        } else {
                          startPage = currentPage - 2;
                          endPage = currentPage + 2;
                        }
                      }

                      return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                        const pageNum = startPage + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoading}
                            className="h-8 w-8 p-0 text-xs"
                          >
                            {pageNum}
                          </Button>
                        );
                      });
                    })()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

        <Dialog open={createUserDialog} onOpenChange={setCreateUserDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new user account with role assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={createUserForm.firstName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={createUserForm.lastName}
                    onChange={(e) => setCreateUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={createUserForm.email}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={createUserForm.phone}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="idNumber">ID Number (Optional)</Label>
                <Input
                  id="idNumber"
                  value={createUserForm.idNumber}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, idNumber: e.target.value }))}
                  placeholder="Enter ID number"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={createUserForm.roleId} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, roleId: value, assignedRegion: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {createUserRoles.map((role: any) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {requiresRegion && (
                <div>
                  <Label htmlFor="region">Assigned Region</Label>
                  <Select value={createUserForm.assignedRegion} onValueChange={(value) => setCreateUserForm(prev => ({ ...prev, assignedRegion: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {rolesData?.regions?.map((region: string) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateUserDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                disabled={createUserMutation.isPending || !createUserForm.firstName || !createUserForm.lastName || !createUserForm.email || !createUserForm.password || !createUserForm.roleId || (requiresRegion && !createUserForm.assignedRegion)}
              >
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UserManagement;