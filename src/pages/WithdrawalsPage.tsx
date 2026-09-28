import React, { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wallet, ArrowDownToLine, Clock, CheckCircle, XCircle, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { withdrawalService, type WithdrawalDetails } from '@/services/withdrawalService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { dashboardCard, responsive } from '@/theme';

const WithdrawalsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [recipientType, setRecipientType] = useState('mobile_money');
  const [recipientNumber, setRecipientNumber] = useState('');
  const [operator, setOperator] = useState<'airtel' | 'tnm'>('airtel');
  const [bankCode, setBankCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawalToken, setWithdrawalToken] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [withdrawalPreview, setWithdrawalPreview] = useState<{
    requestedAmount: string;
    withdrawalFee: string;
    netPayout: string;
    currency: string;
  } | null>(null);

  const withdrawalDetails = (): WithdrawalDetails => ({
    amount: Number(withdrawalAmount),
    recipientType: recipientType as 'mobile_money' | 'bank',
    recipientNumber: recipientNumber.trim(),
    ...(recipientType === 'mobile_money'
      ? { operator }
      : { bankCode: bankCode.trim(), accountName: accountName.trim() })
  });

  // Fetch balance using React Query
  const { data: balance, isLoading: balanceLoading, isError: balanceError, refetch: refetchBalance } = useQuery({
    queryKey: ['caregiver-balance', user?.id],
    queryFn: () => withdrawalService.getBalance(),
    enabled: !!user?.id
  });

  // Fetch withdrawal history using React Query
  const { data: withdrawalsData, isLoading: withdrawalsLoading, isError: historyError, refetch: refetchHistory } = useQuery({
    queryKey: ['withdrawal-history', user?.id, historyPage],
    queryFn: () => withdrawalService.getHistory(historyPage),
    enabled: !!user?.id,
    refetchInterval: (query) =>
      query.state.data?.withdrawals?.some((item) => ['pending', 'processing'].includes(item.status)) ? 15000 : false
  });

  const { data: banks = [], isLoading: banksLoading, isError: banksError } = useQuery({
    queryKey: ['paychangu-payout-banks'],
    queryFn: withdrawalService.getBanks,
    enabled: isDialogOpen && recipientType === 'bank',
    staleTime: 30 * 60 * 1000,
    retry: 1
  });

  // Token request mutation
  const tokenMutation = useMutation({
    mutationFn: withdrawalService.requestWithdrawalToken,
    onSuccess: (data) => {
      setTokenSent(true);
      setWithdrawalPreview(data);
      setTokenExpiry(new Date(Date.now() + 3 * 60 * 1000)); // 3 minutes
      toast.success('Withdrawal token sent to your email');
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      toast.error(error.response?.data?.error || 'Failed to send token');
    }
  });

  // Withdrawal request mutation
  const withdrawalMutation = useMutation({
    mutationFn: withdrawalService.requestWithdrawal,
    onSuccess: (data) => {
      const isComplete = data.status === 'completed';
      const isFailed = data.status === 'failed';
      const notify = isComplete ? toast.success : isFailed ? toast.error : toast.info;
      notify(
        <div className="space-y-2">
          <div className="font-semibold">
            {isComplete ? 'Withdrawal completed' : isFailed ? 'Withdrawal failed' : 'Withdrawal processing'}
          </div>
          <div className="text-sm space-y-1">
            <div>Amount: {data.currency} {data.requestedAmount}</div>
            <div>Fee: {data.currency} {data.withdrawalFee}</div>
            <div>Net Payout: {data.currency} {data.netPayout}</div>
            <div>Reference: {data.paymentReference}</div>
            <div>Recipient: {data.recipientNumber}</div>
          </div>
        </div>,
        { duration: 8000 }
      );
      setIsDialogOpen(false);
      setWithdrawalAmount('');
      setRecipientNumber('');
      setBankCode('');
      setAccountName('');
      setWithdrawalToken('');
      setTokenSent(false);
      setTokenExpiry(null);
      setWithdrawalPreview(null);
      // Invalidate and refetch data
      queryClient.invalidateQueries({ queryKey: ['caregiver-balance'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-history'] });
    },
    onError: (error: AxiosError<{ error?: string }>) => {
      toast.error(error.response?.data?.error || 'Failed to submit withdrawal request');
    }
  });

  useEffect(() => {
    if (!tokenExpiry) {
      setSecondsRemaining(0);
      return;
    }
    const updateCountdown = () =>
      setSecondsRemaining(Math.max(0, Math.ceil((tokenExpiry.getTime() - Date.now()) / 1000)));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [tokenExpiry]);

  const isTokenExpired = tokenSent && secondsRemaining === 0;

  // Reset token state when dialog closes
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setTokenSent(false);
      setTokenExpiry(null);
      setWithdrawalToken('');
      setWithdrawalPreview(null);
    }
  };

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

  if (balanceError || historyError) {
    return (
      <DashboardLayout userRole="caregiver">
        <Card className={dashboardCard.base}>
          <CardContent className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <h2 className={responsive.cardTitle}>We couldn't load your withdrawals</h2>
              <p className={responsive.bodyMuted}>Your balance has not been changed. Please try again.</p>
            </div>
            <Button onClick={() => { void refetchBalance(); void refetchHistory(); }}>
              <RefreshCw className="mr-2 h-4 w-4" /> Try again
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="caregiver">
      <div className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={responsive.pageTitle}>Withdrawals</h1>
            <p className={responsive.pageSubtitle}>Manage your earnings and withdrawal requests</p>
          </div>
        </div>

      {/* Balance Card */}
      <Card className={dashboardCard.base}>
        <CardHeader className={dashboardCard.header}>
          <div>
            <CardTitle className={`flex items-center gap-2 ${responsive.cardTitle}`}>
              <Wallet className="h-5 w-5 text-primary" />
              Wallet Balance
            </CardTitle>
            <CardDescription className={responsive.cardDesc}>Your current earnings and available balance</CardDescription>
          </div>
        </CardHeader>
        <CardContent className={dashboardCard.body}>
          <div className={dashboardCard.compactStatGrid}>
            <div className={dashboardCard.balanceBlockPrimary}>
              <p className={responsive.bodyMuted}>Total Earnings</p>
              <p className={`${dashboardCard.compactBalanceValue} text-primary`}>
                {balance?.currency} {balance?.totalEarnings || '0.00'}
              </p>
            </div>
            <div className={dashboardCard.balanceBlockSuccess}>
              <p className={responsive.bodyMuted}>Available Balance</p>
              <p className={`${dashboardCard.compactBalanceValue} text-success`}>
                {balance?.currency} {balance?.availableBalance || '0.00'}
              </p>
            </div>
            <div className={dashboardCard.balanceBlockWarning}>
              <div className="flex items-center justify-center gap-1">
                <Lock className="h-3 w-3 text-warning" />
                <p className={responsive.bodyMuted}>Locked</p>
              </div>
              <p className={`${dashboardCard.compactBalanceValue} text-warning`}>
                {balance?.currency} {balance?.lockedBalance || '0.00'}
              </p>
              <p className={responsive.bodyMuted}>Submit reports to unlock</p>
            </div>
            <div className={dashboardCard.balanceBlockPrimary}>
              <p className={responsive.bodyMuted}>Processing</p>
              <p className={dashboardCard.compactBalanceValue}>
                {balance?.currency} {balance?.reservedBalance || '0.00'}
              </p>
              <p className={responsive.bodyMuted}>Reserved for payout</p>
            </div>
            <div className={dashboardCard.balanceBlockSuccess}>
              <p className={responsive.bodyMuted}>Total Withdrawn</p>
              <p className={dashboardCard.compactBalanceValue}>
                {balance?.currency} {balance?.totalPaid || '0.00'}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
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
                    <DialogTitle className={responsive.dialogTitle}>Request Withdrawal</DialogTitle>
                    <DialogDescription className={responsive.dialogDesc}>
                      Withdraw your earnings to your mobile money or bank account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {!tokenSent ? (
                      <>
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
                        {recipientType === 'mobile_money' && (
                          <div>
                            <Label htmlFor="operator">Mobile Network</Label>
                            <Select value={operator} onValueChange={(value) => setOperator(value as 'airtel' | 'tnm')}>
                              <SelectTrigger id="operator"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="airtel">Airtel Money</SelectItem>
                                <SelectItem value="tnm">TNM Mpamba</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
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
                        {recipientType === 'bank' && (
                          <>
                            <div>
                              <Label htmlFor="accountName">Account Name</Label>
                              <Input id="accountName" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                            </div>
                            <div>
                              <Label htmlFor="bankCode">Bank</Label>
                              <Select value={bankCode} onValueChange={setBankCode} disabled={banksLoading || banksError}>
                                <SelectTrigger id="bankCode">
                                  <SelectValue placeholder={banksLoading ? 'Loading banks...' : 'Select a bank'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {banks.map((bank) => (
                                    <SelectItem key={bank.uuid} value={bank.uuid}>{bank.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {banksError && <p className="mt-1 text-xs text-destructive">Bank withdrawals are temporarily unavailable.</p>}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-center py-4">
                          <div className="text-green-600 mb-2">
                            ✓ Token sent to your email
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Check your email and enter the 6-digit token below
                          </p>
                          {tokenExpiry && (
                            <p className="text-xs text-orange-600 mt-1">
                              Token expires in {secondsRemaining} seconds
                            </p>
                          )}
                        </div>
                        {withdrawalPreview && (
                          <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                            <div className="flex justify-between"><span>Amount</span><span>{withdrawalPreview.currency} {withdrawalPreview.requestedAmount}</span></div>
                            <div className="flex justify-between"><span>Withdrawal fee</span><span>{withdrawalPreview.currency} {withdrawalPreview.withdrawalFee}</span></div>
                            <div className="mt-2 flex justify-between border-t pt-2 font-semibold"><span>You receive</span><span>{withdrawalPreview.currency} {withdrawalPreview.netPayout}</span></div>
                            <div className="mt-2 flex justify-between text-muted-foreground"><span>Destination</span><span>{recipientNumber}</span></div>
                          </div>
                        )}
                        <div>
                          <Label htmlFor="token">Withdrawal Token</Label>
                          <Input
                            id="token"
                            placeholder="Enter 6-digit token"
                            value={withdrawalToken}
                            onChange={(e) => setWithdrawalToken(e.target.value)}
                            maxLength={6}
                            className="text-center text-lg tracking-widest"
                          />
                        </div>
                        {isTokenExpired && (
                          <div className="text-center">
                            <p className="text-sm text-red-600 mb-2">Token expired</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setTokenSent(false);
                                setTokenExpiry(null);
                                setWithdrawalToken('');
                              }}
                            >
                              Request New Token
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleDialogClose(false)}>
                      Cancel
                    </Button>
                    {!tokenSent ? (
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
                          if (recipientType === 'bank' && (!bankCode.trim() || !accountName.trim())) {
                            toast.error('Enter the bank code and account name');
                            return;
                          }
                          tokenMutation.mutate(withdrawalDetails());
                        }}
                        disabled={tokenMutation.isPending}
                      >
                        {tokenMutation.isPending ? 'Sending...' : 'Send Token'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => {
                          if (!withdrawalToken || withdrawalToken.length !== 6) {
                            toast.error('Please enter the 6-digit token');
                            return;
                          }
                          if (isTokenExpired) {
                            toast.error('Token has expired. Please request a new one.');
                            return;
                          }
                          
                          // First verify token with amount
                          const details = withdrawalDetails();
                          withdrawalService.verifyWithdrawalToken(withdrawalToken, details)
                            .then(() => {
                              // If verification succeeds, proceed with withdrawal
                              withdrawalMutation.mutate({
                                ...details,
                                token: withdrawalToken
                              });
                            })
                            .catch((error) => {
                              toast.error(error.response?.data?.error || 'Token verification failed');
                            });
                        }}
                        disabled={withdrawalMutation.isPending || isTokenExpired}
                      >
                        {withdrawalMutation.isPending ? 'Processing...' : 'Confirm Withdrawal'}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card className={dashboardCard.base}>
        <CardHeader className={dashboardCard.header}>
          <div>
            <CardTitle className={responsive.cardTitle}>Withdrawal History</CardTitle>
            <CardDescription className={responsive.cardDesc}>Your recent withdrawal requests and their status</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownToLine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className={`${responsive.cardTitle} mb-2`}>No withdrawals yet</h3>
              <p className={responsive.bodyMuted}>Your withdrawal requests will appear here</p>
            </div>
          ) : (
            <div className={dashboardCard.tableWrapper}>
              <Table className={dashboardCard.tableMinWidth}>
                <TableHeader>
                  <TableRow>
                    <TableHead className={dashboardCard.th}>Date</TableHead>
                    <TableHead className={dashboardCard.th}>Amount</TableHead>
                    <TableHead className={dashboardCard.th}>Fee</TableHead>
                    <TableHead className={dashboardCard.th}>Net Payout</TableHead>
                    <TableHead className={dashboardCard.th}>Recipient</TableHead>
                    <TableHead className={dashboardCard.th}>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id} className={dashboardCard.tr}>
                      <TableCell className={dashboardCard.td}>
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        {balance?.currency} {parseFloat(withdrawal.requestedAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        {balance?.currency} {parseFloat(withdrawal.withdrawalFee).toFixed(2)}
                      </TableCell>
                      <TableCell className={`${dashboardCard.td} font-medium`}>
                        {balance?.currency} {parseFloat(withdrawal.netPayout).toFixed(2)}
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
                        <div>
                          <p className={`${responsive.body} capitalize`}>{withdrawal.recipientType.replace('_', ' ')}</p>
                          <p className={responsive.bodyMuted}>{withdrawal.recipientNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell className={dashboardCard.td}>
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
              {(withdrawalsData?.pagination?.totalPages || 1) > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className={responsive.bodyMuted}>
                    Page {withdrawalsData.pagination.currentPage} of {withdrawalsData.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage <= 1}
                      onClick={() => setHistoryPage((page) => Math.max(1, page - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={historyPage >= withdrawalsData.pagination.totalPages}
                      onClick={() => setHistoryPage((page) => page + 1)}
                    >
                      Next
                    </Button>
                  </div>
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

export default WithdrawalsPage;
