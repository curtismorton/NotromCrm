import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, AlertTriangle, Clock, Package, Shield } from "lucide-react";

interface TalentStats {
  activeCampaigns: number;
  deliverablesDueToday: number;
  deliverablesDueThisWeek: number;
  pipelineValue: string;
  pipelineCount: number;
  overdueInvoicesCount: number;
  overdueInvoicesAmount: string;
  usageExpiringCount: number;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<TalentStats>({
    queryKey: ['/api/talent/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-32">
        {[1, 2, 3].map(i => (
          <div key={i} className="card">
            <div className="card__content">
              <div className="skeleton" style={{ height: '80px' }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const kpiTiles = stats ? [
    {
      title: "Active Campaigns",
      value: stats.activeCampaigns,
      icon: TrendingUp,
      color: "cyan",
      description: "Campaigns in progress"
    },
    {
      title: "Due Today",
      value: stats.deliverablesDueToday,
      icon: Clock,
      color: stats.deliverablesDueToday > 0 ? "yellow" : "cyan",
      description: "Deliverables due today"
    },
    {
      title: "Due This Week",
      value: stats.deliverablesDueThisWeek,
      icon: Package,
      color: "cyan",
      description: "Deliverables this week"
    },
    {
      title: "Pipeline Value",
      value: formatCurrency(stats.pipelineValue),
      icon: DollarSign,
      color: "cyan",
      description: `${stats.pipelineCount} talent in pipeline`
    },
    {
      title: "Overdue Invoices",
      value: stats.overdueInvoicesCount,
      icon: AlertTriangle,
      color: stats.overdueInvoicesCount > 0 ? "red" : "cyan",
      description: stats.overdueInvoicesCount > 0 ? formatCurrency(stats.overdueInvoicesAmount) : "All paid"
    },
    {
      title: "Usage Expiring",
      value: stats.usageExpiringCount,
      icon: Shield,
      color: stats.usageExpiringCount > 0 ? "yellow" : "cyan",
      description: "Contracts expiring soon"
    }
  ] : [];

  const getColorVar = (color: string) => {
    switch(color) {
      case 'cyan': return 'var(--action-cyan-500)';
      case 'yellow': return 'var(--alert-yellow-500)';
      case 'red': return 'var(--alert-red-500)';
      default: return 'var(--action-cyan-500)';
    }
  };

  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Talent Command Center</h1>
          <p className="text-meta">Your talent management dashboard at a glance.</p>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24">
        {kpiTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.title} className="card" data-testid={`kpi-${tile.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="card__content">
                <div className="flex items-center justify-between mb-16">
                  <div>
                    <h3 className="text-meta mb-8">{tile.title.toUpperCase()}</h3>
                    <p className="text-h2 mb-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {tile.value}
                    </p>
                  </div>
                  <Icon className="w-8 h-8" style={{ color: getColorVar(tile.color) }} />
                </div>
                <p className="text-meta">{tile.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Summary */}
      <div className="card">
        <div className="card__header">
          <h3 className="card__title">Operations Summary</h3>
          <p className="card__meta">Current status overview</p>
        </div>
        <div className="card__content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
            <div>
              <h4 className="text-body mb-12" style={{ color: 'var(--ink-200)' }}>Campaign Pipeline</h4>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-meta">Active campaigns</span>
                  <span className="text-body font-medium">{stats?.activeCampaigns || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-meta">Total pipeline value</span>
                  <span className="text-body font-medium">{stats ? formatCurrency(stats.pipelineValue) : '$0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-meta">Talent in pipeline</span>
                  <span className="text-body font-medium">{stats?.pipelineCount || 0}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-body mb-12" style={{ color: 'var(--ink-200)' }}>Deliverables & Finance</h4>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <span className="text-meta">Due today</span>
                  <span className={`text-body font-medium ${(stats?.deliverablesDueToday || 0) > 0 ? 'text-alert-yellow-500' : ''}`}>
                    {stats?.deliverablesDueToday || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-meta">Due this week</span>
                  <span className="text-body font-medium">{stats?.deliverablesDueThisWeek || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-meta">Overdue invoices</span>
                  <span className={`text-body font-medium ${(stats?.overdueInvoicesCount || 0) > 0 ? 'text-alert-red-500' : ''}`}>
                    {stats?.overdueInvoicesCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      {stats && (stats.deliverablesDueToday > 0 || stats.overdueInvoicesCount > 0 || stats.usageExpiringCount > 0) && (
        <div className="card" style={{ borderColor: 'var(--alert-yellow-500)' }}>
          <div className="card__header">
            <h3 className="card__title" style={{ color: 'var(--alert-yellow-500)' }}>Attention Required</h3>
            <p className="card__meta">Items needing immediate action</p>
          </div>
          <div className="card__content">
            <div className="space-y-12">
              {stats.deliverablesDueToday > 0 && (
                <div className="flex items-center gap-12">
                  <Clock className="w-5 h-5" style={{ color: 'var(--alert-yellow-500)' }} />
                  <p className="text-body">
                    <span className="font-medium">{stats.deliverablesDueToday}</span> deliverable{stats.deliverablesDueToday > 1 ? 's' : ''} due today
                  </p>
                </div>
              )}
              {stats.overdueInvoicesCount > 0 && (
                <div className="flex items-center gap-12">
                  <AlertTriangle className="w-5 h-5" style={{ color: 'var(--alert-red-500)' }} />
                  <p className="text-body">
                    <span className="font-medium">{stats.overdueInvoicesCount}</span> overdue invoice{stats.overdueInvoicesCount > 1 ? 's' : ''} totaling {formatCurrency(stats.overdueInvoicesAmount)}
                  </p>
                </div>
              )}
              {stats.usageExpiringCount > 0 && (
                <div className="flex items-center gap-12">
                  <Shield className="w-5 h-5" style={{ color: 'var(--alert-yellow-500)' }} />
                  <p className="text-body">
                    <span className="font-medium">{stats.usageExpiringCount}</span> contract{stats.usageExpiringCount > 1 ? 's' : ''} with usage rights expiring soon
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}