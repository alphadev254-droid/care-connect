import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, ArrowDownToLine, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { withdrawalService } from '@/services/withdrawalService';
import DashboardLayout from '@/components/layout/DashboardLayout';

const WithdrawalsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [recipientType, setRecipientType] = useState('mobile_money');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch balance using React Query
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['caregiver-balance', user?.id],
    queryFn: () => withdrawalService.getBalance(),
    enabled: !!user?.id
  });

  // Fetch withdrawal history using React Query
  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['withdrawal-history', user?.id],
    queryFn: () => withdrawalService.getHistory(),
    enabled: !!user?.id
  });

  // Withdrawal request mutation
  const withdrawalMutation = useMutation({
    mutationFn: withdrawalService.requestWithdrawal,
    onSuccess: () => {
      toast.success('Withdrawal request submitted successfully');
      setIsDialogOpen(false);
      setWithdrawalAmount('');
      setRecipientNumber('');
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['caregiver-balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-history'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit withdrawal request');
    }
  });

  const withdrawals = withdrawalsData?.withdrawals || [];
  const loading = balanceLoading || withdrawalsLoading;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole="caregiver">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Withdrawals</h1>
            <p className="text-muted-foreground">Manage your earnings and withdrawal requests</p>
          </div>
        </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
          <CardDescription>Your current earnings and available balance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold text-blue-600">
                {balance?.currency} {balance?.totalEarnings || '0.00'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {balance?.currency} {balance?.availableBalance || '0.00'}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full"
                    disabled={!balance || parseFloat(balance.availableBalance) <= 0}
                  >
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Withdrawal</DialogTitle>
                    <DialogDescription>
                      Withdraw your earnings to your mobile money or bank account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">Amount ({balance?.currency})</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        max={balance?.availableBalance}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Available: {balance?.currency} {balance?.availableBalance}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="recipientType">Recipient Type</Label>
                      <Select value={recipientType} onValueChange={setRecipientType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="bank">Bank Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="recipientNumber">
                        {recipientType === 'mobile_money' ? 'Phone Number' : 'Account Number'}
                      </Label>
                      <Input
                        id="recipientNumber"
                        placeholder={recipientType === 'mobile_money' ? 'e.g., 265998123456' : 'Account number'}
                        value={recipientNumber}
                        onChange={(e) => setRecipientNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => {
                        const amount = parseFloat(withdrawalAmount);
                        if (!amount || amount <= 0) {
                          toast.error('Please enter a valid amount');
                          return;
                        }
                        if (amount > parseFloat(balance?.availableBalance || '0')) {
                          toast.error('Amount exceeds available balance');
                          return;
                        }
                        if (!recipientNumber) {
                          toast.error('Please enter recipient details');
                          return;
                        }
                        withdrawalMutation.mutate({ amount, recipientType, recipientNumber });
                      }} 
                      disabled={withdrawalMutation.isPending}
                    >
                      {withdrawalMutation.isPending ? 'Processing...' : 'Submit Request'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>Your recent withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownToLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No withdrawals yet</h3>
              <p className="text-muted-foreground">Your withdrawal requests will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Net Payout</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {new Date(withdrawal.requestedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {balance?.currency} {parseFloat(withdrawal.requestedAmount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {balance?.currency} {parseFloat(withdrawal.withdrawalFee).toFixed(2)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {balance?.currency} {parseFloat(withdrawal.netPayout).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="capitalize">{withdrawal.recipientType.replace('_', ' ')}</p>
                        <p className="text-muted-foreground">{withdrawal.recipientNumber}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(withdrawal.status)}
                          <span className="capitalize">{withdrawal.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default WithdrawalsPage;