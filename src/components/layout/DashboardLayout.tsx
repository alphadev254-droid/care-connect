import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  Bell,
  LogOut,
  User,
  Search,
  Video,
  CreditCard,
  Shield,
  ChevronDown,
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "patient" | "caregiver" | "physician" | "admin";
}

const DashboardLayout = ({ children, userRole = "patient" }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Use actual user role if available, fallback to prop
  const actualRole = user?.role === 'system_manager' || user?.role === 'regional_manager' ? 'admin' : (user?.role || userRole);

  // Get user initials
  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  };

  // Get full name
  const getFullName = () => {
    if (!user) return "User";
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = {
    patient: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Search, label: "Find Caregivers", href: "/dashboard/caregivers" },
      { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
      { icon: Video, label: "Teleconference", href: "/dashboard/teleconference" },
      { icon: FileText, label: "Care Reports", href: "/dashboard/reports" },
      { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
    ],
    caregiver: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Calendar, label: "Schedule", href: "/dashboard/schedule" },
      { icon: Users, label: "My Patients", href: "/dashboard/patients" },
      { icon: Video, label: "Teleconference", href: "/dashboard/teleconference" },
      { icon: FileText, label: "Care Reports", href: "/dashboard/reports" },
      { icon: CreditCard, label: "Earnings", href: "/dashboard/earnings" },
    ],
    physician: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: Users, label: "Patients", href: "/dashboard/patients" },
      { icon: Heart, label: "Recommendations", href: "/dashboard/recommendations" },
      { icon: FileText, label: "Health Reports", href: "/dashboard/reports" },
    ],
    admin: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      // { icon: Shield, label: "Administration", href: "/dashboard/admin" },
      { icon: Users, label: "User Management", href: "/dashboard/users" },
      { icon: Heart, label: "Specialties", href: "/dashboard/specialties" },
      { icon: CreditCard, label: "Earnings", href: "/dashboard/earnings" },
      { icon: FileText, label: "Reports", href: "/dashboard/reports" },
    ],
  };

  const currentMenu = menuItems[actualRole as keyof typeof menuItems] || [];

  const isActive = (href: string) => location.pathname === href;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r">
          <div className="p-4 border-b">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                Care<span className="text-primary">Connect</span>
              </span>
            </Link>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {currentMenu.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                      >
                        <Link to={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard/profile")}>
                      <Link to="/dashboard/profile">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/dashboard/settings")}>
                      <Link to="/dashboard/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b bg-card flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden md:block">
                <h1 className="font-display font-semibold capitalize">
                  {location.pathname.split("/").pop() || "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {getInitials()}
                    </div>
                    <span className="hidden md:inline">{getFullName()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
