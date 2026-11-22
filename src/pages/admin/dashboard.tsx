/**
 * /admin/dashboard — Platform Admin Dashboard
 * Visible only to admin+ roles. Shows pending applications, open reports,
 * recent audit events, and quick-action links to other admin consoles.
 */
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, Navigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Shield, FileText, AlertTriangle, Clock, Users, ChevronRight,
  RefreshCw, CheckCircle2, Wand2, Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth/auth-client';
import { formatDistanceToNow } from 'date-fns';
import { admin_dashboard } from 'virtual:content';

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardData {
  pendingApplications: number;
  openReports: number;
  recentApplications: Array<{
    id: number;
    referenceId: string;
    creatorName: string;
    status: string;
    requestedAccountType: string;
    submittedAt: string;
    applicantUsername: string | null;
    applicantImage: string | null;
  }>;
  recentAudit: Array<{
    id: number;
    action: string;
    oldValue: string | null;
    newValue: string | null;
    reason: string | null;
    createdAt: string;
    actorId: string;
  }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function ago(ts: string) {
  return formatDistanceToNow(new Date(ts), { addSuffix: true });
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pending_review: { bg: 'hsl(var(--warning) / 0.15)', text: 'hsl(var(--warning))', label: 'Pending Review' },
    info_requested: { bg: 'hsl(var(--info) / 0.15)', text: 'hsl(var(--info))', label: 'Info Requested' },
    approved: { bg: 'hsl(var(--success) / 0.15)', text: 'hsl(var(--success))', label: 'Approved' },
    rejected: { bg: 'hsl(var(--destructive) / 0.15)', text: 'hsl(var(--destructive))', label: 'Declined' },
    withdrawn: { bg: 'hsl(var(--muted-foreground) / 0.15)', text: 'hsl(var(--muted-foreground))', label: 'Withdrawn' },
  };
  const s = map[status] ?? { bg: 'hsl(var(--muted))', text: 'hsl(var(--muted-foreground))', label: status };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { session, isPending } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const platformRole = (session?.user as { platformRole?: string } | undefined)?.platformRole ?? 'member';
  const isAdmin = ['admin', 'owner'].includes(platformRole);

  function load() {
    setLoading(true);
    setError('');
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json() as Promise<DashboardData>;
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e: Error) => { setError(e.message); setLoading(false); });
  }

  useEffect(() => {
    if (!isPending && isAdmin) load();
    else if (!isPending) setLoading(false);
  }, [isPending, isAdmin]);

  if (!isPending && !isAdmin) return <Navigate to="/account" replace />;

  return (
    <>
      <Helmet>
        <title>{admin_dashboard.meta.title}</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="description" content={admin_dashboard.meta.description} />
      </Helmet>

      <main className="min-h-screen py-8 px-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'hsl(var(--primary) / 0.15)' }}>
              <Shield className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Platform overview and quick actions</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}
            className="text-muted-foreground hover:text-foreground">
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { to: '/admin/roles', icon: <Users className="w-4 h-4" />, label: 'User Roles' },
            { to: '/admin/applications', icon: <FileText className="w-4 h-4" />, label: 'Applications' },
            { to: '/admin/community', icon: <AlertTriangle className="w-4 h-4" />, label: 'Community' },
            { to: '/admin/spells', icon: <Wand2 className="w-4 h-4" />, label: 'Spells' },
          ].map((item) => (
            <Link key={item.to} to={item.to}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors text-sm font-medium text-foreground">
              <span style={{ color: 'hsl(var(--primary))' }}>{item.icon}</span>
              {item.label}
              <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />
            </Link>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            Failed to load dashboard data: {error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(var(--warning) / 0.15)' }}>
                  <FileText className="w-6 h-6" style={{ color: 'hsl(var(--warning))' }} />
                </div>
                <div>
                  {loading ? <Skeleton className="h-8 w-16 mb-1" /> : (
                    <p className="text-3xl font-bold text-foreground">{data?.pendingApplications ?? 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Pending Applications</p>
                </div>
                <Link to="/admin/applications" className="ml-auto">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <Card className="bg-card border-border">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(var(--destructive) / 0.15)' }}>
                  <AlertTriangle className="w-6 h-6" style={{ color: 'hsl(var(--destructive))' }} />
                </div>
                <div>
                  {loading ? <Skeleton className="h-8 w-16 mb-1" /> : (
                    <p className="text-3xl font-bold text-foreground">{data?.openReports ?? 0}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Open Reports</p>
                </div>
                <Link to="/admin/community" className="ml-auto">
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent pending applications */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                Recent Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))
              ) : data?.recentApplications.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No pending applications</p>
                </div>
              ) : (
                data?.recentApplications.map((app) => (
                  <Link key={app.id} to={`/admin/applications?id=${app.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                      {app.applicantImage
                        ? <img src={app.applicantImage} alt="" className="w-full h-full object-cover" />
                        : <span className="text-xs text-muted-foreground">{(app.creatorName[0] ?? '?').toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{app.creatorName}</p>
                      <p className="text-xs text-muted-foreground">{ago(app.submittedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground capitalize">{app.requestedAccountType}</span>
                      <StatusPill status={app.status} />
                    </div>
                  </Link>
                ))
              )}
              {(data?.recentApplications.length ?? 0) > 0 && (
                <Link to="/admin/applications"
                  className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1">
                  View all applications <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Recent audit events */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
                Recent Audit Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))
              ) : data?.recentAudit.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent audit events</p>
              ) : (
                data?.recentAudit.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
                    <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{ev.action}</p>
                      {ev.reason && <p className="text-xs text-muted-foreground truncate">{ev.reason}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">{ago(ev.createdAt)}</span>
                  </div>
                ))
              )}
              <Link to="/admin/roles"
                className="flex items-center justify-center gap-1 text-xs text-primary hover:underline pt-1">
                View audit log <ChevronRight className="w-3 h-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
