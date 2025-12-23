import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const Earnings = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState("this-month");

  const { data: earningsData, isLoading } = useQuery({
    queryKey: ["earnings", selectedPeriod, user?.role],
    queryFn: async () => {
      const endpoint = user?.role === 'caregiver'
        ? `/earnings/caregiver?period=${selectedPeriod}`
        : `/payments/history?period=${selectedPeriod}`;
      const response = await api.get(endpoint);
      return response.data || {};
    },
  });

  const earnings = earningsData || {};
  const transactions = Array.isArray(earnings.transactions)
    ? earnings.transactions
    : Array.isArray(earnings.payments)
    ? earnings.payments
    : [];

  const getStats = () => {
    if (user?.role === 'caregiver') {
      return [
        {
          title: "Total Earnings",
          value: `MWK ${(earnings.total || 0).toLocaleString()}`,
          icon: DollarSign,
          trendUp: true,
        },
        {
          title: "This Month",
          value: `MWK ${(earnings.thisMonth || 0).toLocaleString()}`,
          icon: TrendingUp,
          trendUp: true,
        },
        {
          title: "Sessions",
          value: earnings.sessionsCompleted || 0,
          icon: Clock,
          trendUp: false,
        },
        {
          title: "Avg/Session",
          value: `MWK ${(earnings.averagePerSession || 0).toLocaleString()}`,
          icon: CreditCard,
          trendUp: true,
        },
      ];
    } else {
      const totalSpent = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
      return [
        {
          title: "Total Spent",
          value: `MWK ${totalSpent.toFixed(0)}`,
          icon: DollarSign,
          trendUp: false,
        },
        {
          title: "This Month",
          value: `MWK ${(earnings.thisMonth || 0).toLocaleString()}`,
          icon: TrendingUp,
          trendUp: false,
        },
        {
          title: "Payments",
          value: transactions.filter((t: any) => t.status === 'completed').length,
          icon: Clock,
          trendUp: false,
        },
        {
          title: "Avg/Payment",
          value: `MWK ${transactions.length > 0 ? (totalSpent / transactions.length).toFixed(0) : 0}`,
          icon: CreditCard,
          trendUp: true,
        },
      ];
    }
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={mapUserRole(user?.role || 'caregiver')}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {user?.role === 'caregiver' ? 'Earnings' : 'Payment History'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {user?.role === 'caregiver'
                ? 'Track your income and transactions'
                : 'View your healthcare payments'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 text-xs gap-1">
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-xl font-bold">{stat.value}</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <stat.icon className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={stat.trendUp ? "text-green-600" : "text-muted-foreground"}>
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions Table */}
        <Card>
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              {user?.role === 'caregiver' ? 'Recent Earnings' : 'Payment Transactions'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              View all your {user?.role === 'caregiver' ? 'earnings' : 'payments'} and transaction details
            </p>
          </div>
          <CardContent className="p-0">
            {transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-semibold">Date</TableHead>
                    <TableHead className="text-xs font-semibold">
                      {user?.role === 'caregiver' ? 'Patient' : 'Caregiver'}
                    </TableHead>
                    <TableHead className="text-xs font-semibold">Service</TableHead>
                    <TableHead className="text-xs font-semibold">Payment Type</TableHead>
                    <TableHead className="text-xs font-semibold">Method</TableHead>
                    <TableHead className="text-xs font-semibold">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: any) => (
                    <TableRow key={transaction.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {user?.role === 'caregiver'
                              ? transaction.Appointment.Patient?.User?.firstName?.charAt(0) || 'P'
                              : transaction.Appointment.Caregiver?.User?.firstName?.charAt(0) || 'C'
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {user?.role === 'caregiver'
                                ? `${transaction.Appointment.Patient?.User?.firstName} ${transaction.Appointment.Patient?.User?.lastName}`
                                : `${transaction.Appointment.Caregiver?.User?.firstName} ${transaction.Appointment.Caregiver?.User?.lastName}`
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {transaction.transactionId || `TXN-${transaction.id}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.Appointment?.Specialty?.name || 'General Care'}
                        <p className="text-xs text-muted-foreground">
                          {transaction.Appointment?.duration || '180'} min
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {transaction.paymentType === 'booking_fee' ? 'Booking' : 'Session'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {transaction.paymentMethod || 'Card'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-semibold text-sm">
                          {user?.role === 'caregiver' ? '+' : '-'}MWK {parseFloat(transaction.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.currency || 'MWK'}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <DollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="font-semibold text-sm mb-1">No transactions yet</h3>
                <p className="text-xs text-muted-foreground">
                  {user?.role === 'caregiver'
                    ? 'Your earnings from completed sessions will appear here'
                    : 'Your payment transactions will appear here'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Footer */}
        {transactions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
                  <p className="text-lg font-bold">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Completed</p>
                  <p className="text-lg font-bold text-green-600">
                    {transactions.filter((t: any) => t.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="text-lg font-bold text-orange-600">
                    {transactions.filter((t: any) => t.status === 'pending').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {user?.role === 'caregiver' ? 'Total Earned' : 'Total Paid'}
                  </p>
                  <p className="text-lg font-bold">
                    MWK {transactions
                      .filter((t: any) => t.status === 'completed')
                      .reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0)
                      .toLocaleString()}
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

export default Earnings;
