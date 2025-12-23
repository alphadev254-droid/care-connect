import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  User,
  ArrowUpRight,
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

  return (
    <DashboardLayout userRole={user?.role || 'patient'}>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Payment & Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your payments and billing information
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-xl font-bold">MWK {totalPaid.toLocaleString()}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-green-700" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span className="text-green-600">Completed payments</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="text-xl font-bold">MWK {totalPending.toLocaleString()}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-orange-700" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <ArrowUpRight className="h-3 w-3 text-orange-600" />
                <span className="text-orange-600">Awaiting payment</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Transactions</p>
                  <p className="text-xl font-bold">{payments.length}</p>
                </div>
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Total transactions</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unpaid Appointments */}
        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Unpaid Appointments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Appointments requiring payment
            </p>
          </div>
          <CardContent className="p-0">
            {loadingAppointments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : appointments.filter((apt: any) => apt.status !== 'cancelled').length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold text-sm mb-1">All caught up!</h3>
                <p className="text-xs text-muted-foreground">No unpaid appointments</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                    <TableHead className="text-xs font-semibold">Caregiver</TableHead>
                    <TableHead className="text-xs font-semibold">Service</TableHead>
                    <TableHead className="text-xs font-semibold">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .filter((apt: any) => apt.status !== 'cancelled')
                    .map((appointment: any) => {
                      const caregiverName = appointment.Caregiver?.User
                        ? `${appointment.Caregiver.User.firstName} ${appointment.Caregiver.User.lastName}`
                        : "Caregiver";
                      const specialtyName = appointment.Specialty?.name || "General Care";

                      return (
                        <TableRow key={appointment.id} className="hover:bg-muted/30">
                          <TableCell className="text-xs">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {new Date(appointment.scheduledDate).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(appointment.scheduledDate).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                {caregiverName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{caregiverName}</p>
                                <p className="text-xs text-muted-foreground">ID: #{appointment.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{specialtyName}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {appointment.sessionType || 'In-person'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="font-semibold text-sm">
                              MWK {appointment.totalCost?.toLocaleString() || '0'}
                            </p>
                            <p className="text-xs text-muted-foreground">Total cost</p>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handlePayment(appointment.id)}
                              disabled={initiatingPayment === appointment.id}
                              size="sm"
                              className="h-7 text-xs"
                            >
                              {initiatingPayment === appointment.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pay Now
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold">Payment History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              All your payment transactions
            </p>
          </div>
          <CardContent className="p-0">
            {loadingPayments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold text-sm mb-1">No payment history</h3>
                <p className="text-xs text-muted-foreground">Your transactions will appear here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Date & Time</TableHead>
                    <TableHead className="text-xs font-semibold">Transaction ID</TableHead>
                    <TableHead className="text-xs font-semibold">Appointment</TableHead>
                    <TableHead className="text-xs font-semibold">Method</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: any) => (
                    <TableRow key={payment.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(payment.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-mono">{payment.transactionId || `TXN-${payment.id}`}</p>
                        <p className="text-xs text-muted-foreground">{payment.currency || 'MWK'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">Appointment #{payment.appointmentId}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm capitalize">{payment.paymentMethod}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === 'completed'
                              ? 'default'
                              : payment.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="text-xs"
                        >
                          {payment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {payment.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                          {payment.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-semibold text-sm">
                          MWK {parseFloat(payment.amount).toLocaleString()}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {payments.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Payments</p>
                  <p className="text-lg font-bold">{payments.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Successful</p>
                  <p className="text-lg font-bold text-green-600">
                    {payments.filter((p: any) => p.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-bold">
                    MWK {totalPaid.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Billing;
