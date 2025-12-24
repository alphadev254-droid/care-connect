import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Eye,
  MapPin,
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
                    <TableHead className="text-xs font-semibold">Service</TableHead>
                    <TableHead className="text-xs font-semibold">Payment Type</TableHead>
                    <TableHead className="text-xs font-semibold">Method</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                    <TableHead className="text-xs font-semibold">Actions</TableHead>
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
                        <p className="text-sm font-mono">{payment.stripePaymentIntentId || `TXN-${payment.id}`}</p>
                        <p className="text-xs text-muted-foreground">{payment.currency || 'MWK'}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">Appointment #{payment.appointmentId}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.Appointment?.scheduledDate ? new Date(payment.Appointment.scheduledDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{payment.Appointment?.Specialty?.name || 'General Care'}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {payment.Appointment?.sessionType || 'in_person'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {payment.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}
                        </Badge>
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
                        <p className="text-xs text-muted-foreground">
                          {payment.paidAt ? `Paid: ${new Date(payment.paidAt).toLocaleDateString()}` : 'Unpaid'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Payment Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Transaction ID:</strong> {payment.stripePaymentIntentId || `TXN-${payment.id}`}</p>
                                    <p><strong>Amount:</strong> MWK {parseFloat(payment.amount).toLocaleString()}</p>
                                    <p><strong>Currency:</strong> {payment.currency || 'MWK'}</p>
                                    <p><strong>Payment Type:</strong> {payment.paymentType === 'booking_fee' ? 'Booking Fee' : 'Session Fee'}</p>
                                    <p><strong>Method:</strong> {payment.paymentMethod}</p>
                                    <p><strong>Status:</strong> {payment.status}</p>
                                    <p><strong>Created:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
                                    {payment.paidAt && <p><strong>Paid At:</strong> {new Date(payment.paidAt).toLocaleString()}</p>}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Appointment Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <p><strong>Appointment ID:</strong> #{payment.appointmentId}</p>
                                    <p><strong>Service:</strong> {payment.Appointment?.Specialty?.name || 'General Care'}</p>
                                    <p><strong>Session Type:</strong> {payment.Appointment?.sessionType || 'in_person'}</p>
                                    <p><strong>Duration:</strong> {payment.Appointment?.duration || 180} minutes</p>
                                    <p><strong>Scheduled Date:</strong> {payment.Appointment?.scheduledDate ? new Date(payment.Appointment.scheduledDate).toLocaleString() : 'N/A'}</p>
                                    <p><strong>Total Cost:</strong> MWK {payment.Appointment?.totalCost || 'N/A'}</p>
                                    <p><strong>Booking Fee:</strong> MWK {payment.Appointment?.bookingFee || 'N/A'}</p>
                                    <p><strong>Session Fee:</strong> MWK {payment.Appointment?.sessionFee || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                              {payment.Appointment?.rescheduleHistory && payment.Appointment.rescheduleHistory.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Reschedule History</h4>
                                  <div className="space-y-2">
                                    {payment.Appointment.rescheduleHistory.map((reschedule: any, index: number) => (
                                      <div key={index} className="p-2 bg-muted rounded text-sm">
                                        <p><strong>From:</strong> {reschedule.from.date} {reschedule.from.startTime}-{reschedule.from.endTime}</p>
                                        <p><strong>To:</strong> {reschedule.to.date} {reschedule.to.startTime}-{reschedule.to.endTime}</p>
                                        <p><strong>By:</strong> {reschedule.rescheduleBy}</p>
                                        {reschedule.reason && <p><strong>Reason:</strong> {reschedule.reason}</p>}
                                        <p><strong>Date:</strong> {new Date(reschedule.timestamp).toLocaleString()}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
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
