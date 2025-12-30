import { useAuth } from '@/contexts/AuthContext';

export const usePermissions = () => {
  const { user, loading } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (loading) return false; // Wait for auth to complete
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (loading) return false; // Wait for auth to complete
    if (!user?.permissions) return false;
    return permissions.some(permission => user.permissions?.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (loading) return false; // Wait for auth to complete
    if (!user?.permissions) return false;
    return permissions.every(permission => user.permissions?.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: user?.permissions || [],
    loading // Expose loading state
  };
};