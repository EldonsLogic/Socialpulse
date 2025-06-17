import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

interface ReportsAlertsWidgetProps {
  clientId: number;
}

export default function ReportsAlertsWidget({ clientId }: ReportsAlertsWidgetProps) {
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/clients', clientId, 'reports'],
    enabled: !!clientId,
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/clients', clientId, 'alerts'],
    enabled: !!clientId,
  });

  const formatSchedule = (schedule: string): string => {
    switch (schedule) {
      case 'daily':
        return 'Every day at 9:00 AM';
      case 'weekly':
        return 'Every Monday at 9:00 AM';
      case 'monthly':
        return '1st of each month';
      default:
        return schedule;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'engagement_drop':
        return AlertTriangle;
      case 'goal_achieved':
        return CheckCircle;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (type: string): string => {
    switch (type) {
      case 'engagement_drop':
        return 'bg-amber-50 border-amber-200';
      case 'goal_achieved':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-amber-50 border-amber-200';
    }
  };

  const getAlertIconColor = (type: string): string => {
    switch (type) {
      case 'engagement_drop':
        return 'bg-amber-500';
      case 'goal_achieved':
        return 'bg-green-500';
      default:
        return 'bg-amber-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Scheduled Reports */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Scheduled Reports
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800">
              Manage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reportsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse p-3 bg-slate-50 rounded-lg">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.slice(0, 2).map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{report.name}</p>
                      <p className="text-xs text-slate-500">{formatSchedule(report.schedule)}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {report.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400 mb-3">No scheduled reports</p>
            </div>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-4 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card className="shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Recent Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-blue-800">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse p-3 bg-slate-50 rounded-lg border">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 2).map((alert: any) => {
                const AlertIcon = getAlertIcon(alert.type);
                return (
                  <div 
                    key={alert.id} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                  >
                    <div className={`w-6 h-6 ${getAlertIconColor(alert.type)} rounded-full flex items-center justify-center mt-0.5`}>
                      <AlertIcon className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(alert.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">No recent alerts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
