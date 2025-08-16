import { ProductivityDashboard } from "@/components/analytics/ProductivityDashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 mb-8">Analytics</h1>
          <p className="text-meta">Track your performance and productivity metrics.</p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <div className="card">
        <div className="card__content">
          <ProductivityDashboard />
        </div>
      </div>
    </div>
  );
}