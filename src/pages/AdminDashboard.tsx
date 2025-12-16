import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActiveUsers, setShowActiveUsers] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ open: false, title: "", description: "", action: () => {} });

  const { data: pendingVerification, isLoading } = useQuery({
    queryKey: ["admin", "pending-verification"],
    queryFn: async () => {
      const response = await api.get("/admin/caregivers/pending-verification");
      return response.data.caregivers || [];
    },
  });

  const { data: allUsers } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.users || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.put(`/admin/caregivers/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Caregiver verified successfully");
      setConfirmDialog(prev => ({ ...prev, open: false }));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/admin/caregivers/${userId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Caregiver application rejected");
      setConfirmDialog(prev => ({ ...prev, open: false }));
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

  const handleVerify = (caregiver: any) => {
    setConfirmDialog({
      open: true,
      title: "Verify Caregiver",
      description: `Are you sure you want to verify ${caregiver.firstName} ${caregiver.lastName}?`,
      action: () => approveMutation.mutate(caregiver.id)
    });
  };

  const handleReject = (caregiver: any) => {
    setConfirmDialog({
      open: true,
      title: "Reject Application",
      description: `Are you sure you want to reject ${caregiver.firstName} ${caregiver.lastName}'s application?`,
      action: () => rejectMutation.mutate(caregiver.id)
    });
  };

  const handleBulkVerify = () => {
    if (selectedUsers.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Verify Multiple Caregivers",
      description: `Are you sure you want to verify ${selectedUsers.length} selected caregivers?`,
      action: () => {
        selectedUsers.forEach(userId => approveMutation.mutate(userId));
        setSelectedUsers([]);
      }
    });
  };

  const handleBulkReject = () => {
    if (selectedUsers.length === 0) return;
    setConfirmDialog({
      open: true,
      title: "Reject Multiple Applications",
      description: `Are you sure you want to reject ${selectedUsers.length} selected caregiver applications?`,
      action: () => {
        selectedUsers.forEach(userId => rejectMutation.mutate(userId));
        setSelectedUsers([]);
      }
    });
  };

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

  const filteredUsers = allUsers?.filter((u: any) => u.isActive === showActiveUsers) || [];

  const stats = [
    {
      title: "Pending Verification",
      value: pendingVerification?.length || 0,
      icon: Clock,
      color: "bg-warning/10 text-warning",
    },
    {
      title: "Total Users",
      value: allUsers?.length || 0,
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Active Caregivers",
      value: allUsers?.filter((u: any) => u.Role?.name === 'caregiver' && u.isActive)?.length || 0,
      icon: UserCheck,
      color: "bg-success/10 text-success",
    },
    {
      title: "Total Patients",
      value: allUsers?.filter((u: any) => u.Role?.name === 'patient')?.length || 0,
      icon: Users,
      color: "bg-secondary/10 text-secondary",
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
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {user?.role === 'system_manager' ? 'System Administration' : 'Regional Management'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage caregivers, users, and system oversight
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

        {/* Management Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Verification</TabsTrigger>
            <TabsTrigger value="users">All Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingVerification?.length > 0 ? (
              <>
                <div className="flex gap-2 mb-4">
                  <Button 
                    onClick={handleBulkVerify}
                    disabled={selectedUsers.length === 0 || approveMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Verify Selected ({selectedUsers.length})
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={selectedUsers.length === 0 || rejectMutation.isPending}
                    className="gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Selected ({selectedUsers.length})
                  </Button>
                </div>
                {pendingVerification.map((caregiver: any) => (
                  <Card key={caregiver.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedUsers.includes(caregiver.id)}
                        onCheckedChange={() => toggleUserSelection(caregiver.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{caregiver.firstName} {caregiver.lastName}</h3>
                            <p className="text-sm text-muted-foreground">{caregiver.email}</p>
                          </div>
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            Pending
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">License:</span> {caregiver.Caregiver?.licenseNumber || 'N/A'}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Experience:</span> {caregiver.Caregiver?.experience || 0}y
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rate:</span> ${caregiver.Caregiver?.hourlyRate || 0}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Phone:</span> {caregiver.phone}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleVerify(caregiver)}
                            disabled={approveMutation.isPending}
                            className="gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Verify
                          </Button>
                          <Button 
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(caregiver)}
                            disabled={rejectMutation.isPending}
                            className="gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline" 
                            className="gap-1"
                            onClick={() => navigate(`/dashboard/user/${caregiver.id}`)}
                          >
                            <Eye className="h-3 w-3" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No pending approvals</h3>
                  <p className="text-muted-foreground">
                    All caregiver applications have been processed
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button 
                variant={showActiveUsers ? "default" : "outline"}
                onClick={() => setShowActiveUsers(true)}
              >
                Active Users
              </Button>
              <Button 
                variant={!showActiveUsers ? "default" : "outline"}
                onClick={() => setShowActiveUsers(false)}
              >
                Inactive Users
              </Button>
            </div>
            <div className="grid gap-4">
              {filteredUsers.map((user: any) => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                          {user.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{user.Role?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          size="sm"
                          variant={user.isActive ? "outline" : "default"}
                          onClick={() => handleToggleUser(user)}
                          disabled={toggleUserMutation.isPending}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user)}
                          disabled={deleteUserMutation.isPending}
                        >
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/dashboard/user/${user.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>


        </Tabs>
        
        <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
          if (!approveMutation.isPending && !rejectMutation.isPending) {
            setConfirmDialog(prev => ({ ...prev, open }));
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={approveMutation.isPending || rejectMutation.isPending || toggleUserMutation.isPending || deleteUserMutation.isPending}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDialog.action}
                disabled={approveMutation.isPending || rejectMutation.isPending || toggleUserMutation.isPending || deleteUserMutation.isPending}
              >
                {approveMutation.isPending || rejectMutation.isPending || toggleUserMutation.isPending || deleteUserMutation.isPending ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;