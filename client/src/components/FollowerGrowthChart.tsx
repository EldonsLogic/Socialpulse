import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TimePeriod } from "@shared/schema";

interface FollowerGrowthChartProps {
  clientId: number;
  timePeriod: TimePeriod;
  platform?: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

export default function FollowerGrowthChart({ clientId, timePeriod, platform, customStartDate, customEndDate }: FollowerGrowthChartProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['/api/clients', clientId, 'metrics/chart', timePeriod, 'followers', platform, customStartDate, customEndDate],
    queryFn: async () => {
      let url = `/api/clients/${clientId}/metrics/chart?period=${timePeriod}`;
      if (platform) url += `&platform=${platform}`;
      if (timePeriod === 'custom' && customStartDate && customEndDate) {
        url += `&startDate=${customStartDate.toISOString().split('T')[0]}&endDate=${customEndDate.toISOString().split('T')[0]}`;
      }
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch chart data');
      return response.json();
    },
    enabled: !!clientId,
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle>Follower Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-400">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatData = (data: any[]) => {
    return data.map((item, index) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      followers: (item.meta.reach + item.instagram.reach) / 10, // Mock follower calculation
    }));
  };

  const formattedData = chartData ? formatData(chartData) : [];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Follower Growth
            </CardTitle>
            <p className="text-sm text-slate-500">Growth trend over time</p>
          </div>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800">
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No follower data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
