import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import OrganizedMetricsOverview from "@/components/OrganizedMetricsOverview";
import EngagementChart from "@/components/EngagementChart";
import FollowerGrowthChart from "@/components/FollowerGrowthChart";
import TopPostsWidget from "@/components/TopPostsWidget";
import ClientConnectionWidget from "@/components/ClientConnectionWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, Facebook, Instagram, ExternalLink } from "lucide-react";
import TimeFrameSelector, { TimeFrameType } from "@/components/TimeFrameSelector";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TimePeriod, Client } from "@shared/schema";

export default function Dashboard() {
  const [selectedClientId, setSelectedClientId] = useState<number>(1);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [activePlatform, setActivePlatform] = useState<'all' | 'meta' | 'instagram'>('all');
  const { toast } = useToast();

  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: dashboardData, isLoading: dashboardLoading, refetch } = useQuery({
    queryKey: ['/api/clients', selectedClientId, 'dashboard', timePeriod, customStartDate, customEndDate],
    queryFn: async () => {
      let url = `/api/clients/${selectedClientId}/dashboard?period=${timePeriod}`;
      if (timePeriod === 'custom' && customStartDate && customEndDate) {
        url += `&customStart=${customStartDate.toISOString().split('T')[0]}&customEnd=${customEndDate.toISOString().split('T')[0]}`;
      }
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!selectedClientId,
  });

  const handleExportReport = async () => {
    try {
      const response = await apiRequest(
        'POST',
        `/api/clients/${selectedClientId}/reports/generate`,
        { period: timePeriod }
      );
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${dashboardData?.client?.name || 'client'}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Report Generated",
        description: "Your PDF report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated with the latest information.",
    });
  };

  const handleTimeFrameChange = (type: TimeFrameType, startDate?: Date, endDate?: Date) => {
    const mappedPeriod: TimePeriod = type === 'custom' ? 'custom' : type as TimePeriod;
    setTimePeriod(mappedPeriod);
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
  };

  if (clientsLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium text-slate-900">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedClient = clients.find((c: any) => c.id === selectedClientId);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        clients={clients}
        selectedClientId={selectedClientId}
        onClientSelect={setSelectedClientId}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
              <p className="text-sm text-slate-600 mt-1">
                Real-time insights for{" "}
                <span className="font-medium text-slate-900">{selectedClient?.name}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Time Frame Selector with 90-day support */}
              <TimeFrameSelector
                onTimeFrameChange={handleTimeFrameChange}
                onRefresh={handleRefresh}
                showRefresh={false}
                className="flex-1"
              />

              {/* Real-time Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-600">Live</span>
              </div>

              <Button onClick={handleExportReport} className="bg-primary hover:bg-blue-800">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              
              <Button 
                onClick={() => {
                  const clientUrl = `${window.location.origin}/madinat-al-ward`;
                  navigator.clipboard.writeText(clientUrl);
                  toast({
                    title: "Client Dashboard Link Copied",
                    description: "Share this link with your client to give them access to their dashboard",
                  });
                }} 
                variant="outline" 
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Client Dashboard Link
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Organized Metrics Overview */}
          <OrganizedMetricsOverview
            metrics={dashboardData?.metrics}
            timePeriod={timePeriod}
            selectedPlatform={activePlatform}
          />

          {/* Platform Tabs */}
          <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as any)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <span>All Platforms</span>
              </TabsTrigger>
              <TabsTrigger value="meta" className="flex items-center space-x-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                <span>Facebook</span>
              </TabsTrigger>
              <TabsTrigger value="instagram" className="flex items-center space-x-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                <span>Instagram</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EngagementChart
                  clientId={selectedClientId}
                  timePeriod={timePeriod}
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                />
                <FollowerGrowthChart
                  clientId={selectedClientId}
                  timePeriod={timePeriod}
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                />
              </div>
            </TabsContent>

            <TabsContent value="meta" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EngagementChart
                  clientId={selectedClientId}
                  timePeriod={timePeriod}
                  platform="meta"
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                />
                <FollowerGrowthChart
                  clientId={selectedClientId}
                  timePeriod={timePeriod}
                  platform="meta"
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                />
              </div>
              <TopPostsWidget
                posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'meta') || []}
              />
            </TabsContent>

            <TabsContent value="instagram" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EngagementChart
                  clientId={selectedClientId}
                  timePeriod={timePeriod}
                  platform="instagram"
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                />
                <FollowerGrowthChart
                  clientId={selectedClientId}
                  timePeriod={timePeriod}
                  platform="instagram"
                  customStartDate={customStartDate}
                  customEndDate={customEndDate}
                />
              </div>
              <TopPostsWidget
                posts={dashboardData?.topPosts?.filter((p: any) => p.platform === 'instagram') || []}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
