import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TimePeriod } from "@shared/schema";

interface EngagementChartProps {
  clientId: number;
  timePeriod: TimePeriod;
  platform?: string;
  customStartDate?: Date;
  customEndDate?: Date;
}

export default function EngagementChart({ clientId, timePeriod, platform, customStartDate, customEndDate }: EngagementChartProps) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['/api/clients', clientId, 'metrics/chart', timePeriod, platform, customStartDate, customEndDate],
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
          <CardTitle>Engagement Over Time</CardTitle>
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
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      Meta: item.meta.engagement,
      Instagram: item.instagram.engagement,
    }));
  };

  const formattedData = chartData ? formatData(chartData) : [];

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Engagement Over Time
            </CardTitle>
            <p className="text-sm text-slate-500">Daily engagement metrics</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-xs text-slate-600">Meta</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span className="text-xs text-slate-600">Instagram</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
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
                <Line
                  type="monotone"
                  dataKey="Meta"
                  stroke="#1E40AF"
                  strokeWidth={2}
                  dot={{ fill: '#1E40AF', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Instagram"
                  stroke="#9333ea"
                  strokeWidth={2}
                  dot={{ fill: '#9333ea', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              No engagement data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
