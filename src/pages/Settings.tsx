import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Bell,
  Lock,
  HelpCircle,
  ExternalLink,
  Mail,
  Trash2
} from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const settingsSections = [
    {
      icon: User,
      title: "Profile Settings",
      description: "Update your personal information, contact details, and professional credentials",
      action: () => navigate('/dashboard/profile'),
      buttonText: "Edit Profile",
      color: "text-blue-600"
    },
    {
      icon: Lock,
      title: "Password & Security",
      description: "Change your password and manage account security settings",
      action: () => navigate('/dashboard/profile'),
      buttonText: "Go to Profile",
      color: "text-green-600"
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Email notifications are automatically sent for appointments and important updates",
      info: "Notifications are managed automatically by the system",
      color: "text-purple-600"
    },
    {
      icon: Shield,
      title: "Privacy & Data",
      description: "Your data is protected according to healthcare privacy regulations",
      info: "We follow strict HIPAA-compliant data protection policies",
      color: "text-amber-600"
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Need assistance? Contact our support team",
      action: () => window.location.href = 'mailto:support@careconnect.mw',
      buttonText: "Contact Support",
      color: "text-red-600"
    }
  ];

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {settingsSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center ${section.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span>{section.title}</span>
                  </CardTitle>
                  <CardDescription className="ml-[52px]">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="ml-[52px]">
                  {section.info ? (
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        ℹ️ {section.info}
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={section.action}
                      variant="outline"
                      className="gap-2"
                    >
                      {section.buttonText}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-base">{user?.firstName} {user?.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-base">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p className="text-base capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-base">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button
                onClick={() => navigate('/dashboard/profile')}
                variant="default"
                className="gap-2"
              >
                <User className="h-4 w-4" />
                View Full Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Delete Account - Only for Patients and Caregivers */}
        {(user?.role === 'patient' || user?.role === 'caregiver') && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Delete Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <p className="text-sm font-medium text-destructive mb-4">
                    ⚠️ Warning: This will delete all your appointments, medical records, and profile information.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        window.location.href = 'mailto:support@careconnect.mw?subject=Account Deletion Request&body=I would like to delete my account. Please process this request.';
                      }
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Request Account Deletion
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Information */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-1">
              <p>CareConnect Health Management System</p>
              <p>For technical support: <a href="mailto:support@careconnect.mw" className="text-primary hover:underline">support@careconnect.mw</a></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
