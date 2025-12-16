import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { mapUserRole } from "@/lib/roleMapper";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  User,
  Download,
  Eye,
  CreditCard,
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
          value: `$${earnings.total || 0}`,
          icon: DollarSign,
        },
        {
          title: "This Month",
          value: `$${earnings.thisMonth || 0}`,
          icon: TrendingUp,
        },
        {
          title: "Sessions Completed",
          value: earnings.sessionsCompleted || 0,
          icon: Clock,
        },
        {
          title: "Average per Session",
          value: `$${earnings.averagePerSession || 0}`,
          icon: CreditCard,
        },
      ];
    } else {
      // Patient view - show spending instead of earnings
      const totalSpent = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
      return [
        {
          title: "Total Spent",
          value: `$${totalSpent.toFixed(2)}`,
          icon: DollarSign,
        },
        {
          title: "This Month",
          value: `$${earnings.thisMonth || 0}`,
          icon: TrendingUp,
        },
        {
          title: "Sessions Paid",
          value: transactions.filter((t: any) => t.status === 'completed').length,
          icon: Clock,
        },
        {
          title: "Average per Session",
          value: `$${transactions.length > 0 ? (totalSpent / transactions.length).toFixed(2) : 0}`,
          icon: CreditCard,
        },
      ];
    }
  };

  const stats = getStats();

  const TransactionCard = ({ transaction }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {transaction.Patient?.User?.firstName?.charAt(0) || 'P'}
            </div>
            <div>
              <h3 className="font-semibold">
                {transaction.Patient?.User?.firstName} {transaction.Patient?.User?.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {transaction.Appointment?.Specialty?.name || 'General Care'}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                {new Date(transaction.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-success">
              +${transaction.amount}
            </div>
            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
              {transaction.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Session Type:</span>
            <p className="font-medium">{transaction.Appointment?.sessionType || 'In-person'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Duration:</span>
            <p className="font-medium">{transaction.Appointment?.duration || '1 hour'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Payment Method:</span>
            <p className="font-medium capitalize">{transaction.paymentMethod || 'Card'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Transaction ID:</span>
            <p className="font-medium text-xs">{transaction.transactionId || `TXN-${transaction.id}`}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t mt-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Receipt
          </Button>
        </div>
      </CardContent>
    </Card>
  );

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">
              {user?.role === 'caregiver' ? 'Earnings' : 'Payment History'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === 'caregiver' 
                ? 'Track your income and payment history'
                : 'View your healthcare payments and transactions'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
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
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Earnings Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Earnings Overview</CardTitle>
            <CardDescription>Your earnings trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Earnings chart will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">Recent Transactions</TabsTrigger>
            <TabsTrigger value="pending">Pending Payments</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            {transactions.length > 0 ? (
              <div className="grid gap-4">
                {transactions.slice(0, 10).map((transaction: any) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground">
                    Your earnings from completed sessions will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4">
              {transactions
                .filter((t: any) => t.status === 'pending')
                .map((transaction: any) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid gap-4">
              {transactions
                .filter((t: any) => t.status === 'completed')
                .map((transaction: any) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Earnings;