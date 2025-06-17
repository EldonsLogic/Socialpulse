import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, BarChart3, Heart, Users, TrendingUp, TrendingDown } from "lucide-react";
import { TimePeriod } from "@shared/schema";

interface MetricsData {
  current: {
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  };
  previous: {
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  };
  changes: {
    reach: number;
    impressions: number;
    engagement: number;
    followers: number;
  };
}

interface MetricsOverviewProps {
  metrics?: MetricsData;
  timePeriod: TimePeriod;
}

export default function MetricsOverview({ metrics, timePeriod }: MetricsOverviewProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-slate-200 rounded mb-4"></div>
              <div className="h-8 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metricCards = [
    {
      title: "Total Reach",
      value: metrics.current.reach,
      previousValue: metrics.previous.reach,
      change: metrics.changes.reach,
      icon: Eye,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      title: "Impressions",
      value: metrics.current.impressions,
      previousValue: metrics.previous.impressions,
      change: metrics.changes.impressions,
      icon: BarChart3,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Engagement",
      value: metrics.current.engagement,
      previousValue: metrics.previous.engagement,
      change: metrics.changes.engagement,
      icon: Heart,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Followers",
      value: metrics.current.followers,
      previousValue: metrics.previous.followers,
      change: metrics.changes.followers,
      icon: Users,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toLocaleString();
  };

  const getPeriodLabel = (period: TimePeriod): string => {
    switch (period) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case 'custom':
        return 'Custom period';
      default:
        return 'Last 7 days';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metricCards.map((metric) => (
        <Card key={metric.title} className="shadow-sm border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${metric.iconBg} rounded-lg flex items-center justify-center`}>
                  <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-600">{metric.title}</h3>
                  <p className="text-xs text-slate-500">{getPeriodLabel(timePeriod)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {metric.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    metric.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {metric.change >= 0 ? "+" : ""}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold text-slate-900">
                {formatNumber(metric.value)}
              </p>
              <p className="text-sm text-slate-500">
                vs. {formatNumber(metric.previousValue)} previous period
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
