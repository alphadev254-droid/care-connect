import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle, Wallet, TrendingUp, ArrowDownToLine, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-3.5 w-3.5" />;
    case 'failed': return <XCircle className="h-3.5 w-3.5" />;
    case 'processing': return <Clock className="h-3.5 w-3.5" />;
    default: return <AlertCircle className="h-3.5 w-3.5" />;
  }
};

const AdminWithdrawalDetailPage = () => {
  const { caregiverId } = useParams<{ caregiverId: string }>();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch single caregiver info from overview
  const { data: overviewData, isLoading: infoLoading } = useQuery({
    queryKey: ['admin-withdrawal-detail-info', caregiverId],
    queryFn: async () => {
      const res = await api.get(`/admin/withdrawals/overview?caregiverId=${caregiverId}`);
      return res.data.caregivers?.[0] || null;
    },
    enabled: !!caregiverId
  });

  // Fetch this caregiver's withdrawal history
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['admin-withdrawal-detail-history', caregiverId, statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        caregiverId: caregiverId!,
        page: page.toString(),
        limit: '30',
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      const res = await api.get(`/admin/withdrawals/history?${params}`);
      return res.data;
    },
    enabled: !!caregiverId
  });

  const caregiver = overviewData;
  const withdrawals = historyData?.withdrawals || [];
  const pagination = historyData?.pagination || {};

  if (infoLoading) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!caregiver) {
    return (
      <DashboardLayout userRole="admin">
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Caregiver not found</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/admin/withdrawals')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Compute totals from history for the Withdrawals tab summary
  const completedTotal = withdrawals
    .filter((w: any) => w.status === 'completed')
    .reduce((sum: number, w: any) => sum + Number(w.netPayout), 0);
  const failedCount = withdrawals.filter((w: any) => w.status === 'failed').length;
  const pendingCount = withdrawals.filter((w: any) => w.status === 'pending' || w.status === 'processing').length;

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="sm" className="mt-0.5" onClick={() => navigate('/dashboard/admin/withdrawals')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{caregiver.name}</h1>
            <p className="text-muted-foreground">{caregiver.email} · {caregiver.region || '—'}, {caregiver.district || '—'}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">MWK {Number(caregiver.totalEarnings).toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">MWK {Number(caregiver.availableBalance).toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Locked (Pending Reports)</p>
                  <p className="text-2xl font-bold text-orange-600">MWK {Number(caregiver.lockedBalance).toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                  <p className="text-2xl font-bold text-purple-600">MWK {Number(caregiver.totalWithdrawn).toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <ArrowDownToLine className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                  <p className="text-2xl font-bold">{caregiver.totalWithdrawals}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="withdrawals">
          <TabsList>
            <TabsTrigger value="withdrawals">Withdrawal History</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          {/* ── Withdrawal History Tab ── */}
          <TabsContent value="withdrawals" className="space-y-4 mt-4">
            <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="text-center py-12">
                    <ArrowDownToLine className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No withdrawals found</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Fee</TableHead>
                          <TableHead className="text-right">Net Payout</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {withdrawals.map((w: any) => (
                          <TableRow key={w.id}>
                            <TableCell className="text-sm">
                              {new Date(w.requestedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {Number(w.requestedAmount).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {Number(w.withdrawalFee).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {Number(w.netPayout).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-sm capitalize">
                              {w.recipientType?.replace('_', ' ')}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {w.recipientNumber}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(w.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(w.status)}
                                  {w.status}
                                </span>
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="flex items-center justify-between px-4 py-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        {pagination.totalRecords > 0
                          ? `Showing ${(page - 1) * 30 + 1}–${Math.min(page * 30, pagination.totalRecords)} of ${pagination.totalRecords}`
                          : 'No records'}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= (pagination.totalPages || 1)}>Next</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Summary Tab ── */}
          <TabsContent value="summary" className="mt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-base">Withdrawal Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="text-sm font-semibold">MWK {completedTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Pending / Processing</span>
                      </div>
                      <span className="text-sm font-semibold">{pendingCount} request{pendingCount !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <span className="text-sm">Failed</span>
                      </div>
                      <span className="text-sm font-semibold">{failedCount} request{failedCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-base">Wallet Snapshot</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lifetime Earnings</span>
                      <span className="text-sm font-semibold">MWK {Number(caregiver.totalEarnings).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Withdrawn</span>
                      <span className="text-sm font-semibold text-purple-600">MWK {Number(caregiver.totalWithdrawn).toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Available Balance</span>
                      <span className="text-sm font-bold text-green-600">MWK {Number(caregiver.availableBalance).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Locked (Pending Reports)</span>
                      <span className="text-sm font-bold text-orange-600">MWK {Number(caregiver.lockedBalance).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {caregiver.lastWithdrawal && (
                <Card className="sm:col-span-2">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Withdrawal</span>
                      <span className="text-sm">{new Date(caregiver.lastWithdrawal).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminWithdrawalDetailPage;
