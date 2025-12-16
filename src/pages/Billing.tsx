import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { appointmentService } from "@/services/appointmentService";
import { paymentService } from "@/services/paymentService";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Receipt,
  Calendar,
  DollarSign,
} from "lucide-react";

const Billing = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [initiatingPayment, setInitiatingPayment] = useState<number | null>(null);

  // Check for payment status in URL (from payment redirect)
  useEffect(() => {
    const status = searchParams.get('status');
    const tx_ref = searchParams.get('tx_ref');

    if (status === 'success' && tx_ref) {
      toast.success('Payment completed successfully!');
    } else if (status === 'failed') {
      toast.error('Payment failed. Please try again.');
    }
  }, [searchParams]);

  // Fetch user's appointments
  const { data: appointmentsData, isLoading: loadingAppointments } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentService.getAppointments(),
  });

  // Fetch payment history
  const { data: paymentsData, isLoading: loadingPayments, refetch: refetchPayments } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => paymentService.getPaymentHistory(),
  });

  const appointments = appointmentsData?.appointments || [];
  const payments = paymentsData?.payments || [];

  // Calculate totals
  const totalPaid = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

  const totalPending = payments
    .filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);

  // Initiate payment for an appointment
  const handlePayment = async (appointmentId: number) => {
    try {
      setInitiatingPayment(appointmentId);

      const result = await paymentService.initiatePayment({ appointmentId });

      // Redirect to payment checkout page
      window.location.href = result.checkoutUrl;
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setInitiatingPayment(null);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variants: any = {
      completed: { variant: "default", icon: CheckCircle, color: "text-success" },
      pending: { variant: "secondary", icon: Clock, color: "text-warning" },
      failed: { variant: "destructive", icon: XCircle, color: "text-destructive" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1 capitalize">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Payment & Billing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your payments and billing information
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">MWK {totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">MWK {totalPending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Unpaid Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Unpaid Appointments</CardTitle>
            <CardDescription>Appointments requiring payment</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAppointments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .filter((apt: any) => apt.status !== 'cancelled')
                  .map((appointment: any) => {
                    const caregiverName = appointment.Caregiver?.User
                      ? `${appointment.Caregiver.User.firstName} ${appointment.Caregiver.User.lastName}`
                      : "Caregiver";
                    const specialtyName = appointment.Specialty?.name || "General Care";
                    const date = new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                            {caregiverName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{caregiverName}</p>
                            <p className="text-sm text-muted-foreground">{specialtyName}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-lg">MWK {appointment.totalCost?.toLocaleString() || '0'}</p>
                          <Button
                            onClick={() => handlePayment(appointment.id)}
                            disabled={initiatingPayment === appointment.id}
                            className="gap-2 bg-gradient-primary"
                          >
                            {initiatingPayment === appointment.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                {appointments.filter((apt: any) => apt.status !== 'cancelled').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No unpaid appointments
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Payment History</CardTitle>
            <CardDescription>All your payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPayments ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment: any) => {
                  const date = new Date(payment.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">Appointment #{payment.appointmentId}</p>
                        <p className="text-sm text-muted-foreground">{date}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {payment.paymentMethod.toUpperCase()} • {payment.currency}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold">MWK {parseFloat(payment.amount).toLocaleString()}</p>
                        <StatusBadge status={payment.status} />
                      </div>
                    </div>
                  );
                })}

                {payments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment history yet
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
