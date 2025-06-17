import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { RefreshCw, BarChart3 } from "lucide-react";
import { TimePeriod, Client } from "@shared/schema";

export default function ClientDashboard() {
  const [, pageParams] = useRoute("/:pageName");
  const pageName = pageParams?.pageName;
  
  console.log('ClientDashboard render - pageName:', pageName);

  // Simple state
  const [clientId, setClientId] = useState<number>(1);
  
  // Get clients first
  const { data: clients = [], isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  // Find client ID when clients load
  useEffect(() => {
    if (pageName && clients.length > 0) {
      const foundClient = clients.find(c => {
        const slug = c.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
          .trim();
        console.log('Comparing:', slug, 'with:', pageName);
        return slug === pageName.toLowerCase();
      });
      if (foundClient) {
        console.log('Found client:', foundClient.id);
        setClientId(foundClient.id);
      }
    }
  }, [pageName, clients]);

  // Get dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error } = useQuery({
    queryKey: ['/api/clients', clientId, 'dashboard'],
    queryFn: async () => {
      console.log('Fetching dashboard for client:', clientId);
      const response = await fetch(`/api/clients/${clientId}/dashboard?period=30d`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: !clientsLoading && clientId > 0,
  });

  // Loading states
  if (clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading client data...</p>
        </div>
      </div>
    );
  }

  if (dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading dashboard for client {clientId}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-red-50 p-6 rounded-lg">
          <p className="text-red-600">Error loading dashboard</p>
          <p className="text-sm text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {dashboardData?.client?.name} Analytics
              </h1>
              <p className="text-sm text-slate-600">Client ID: {clientId} | Page: {pageName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Loaded Successfully</h2>
          <p>Client: {dashboardData?.client?.name}</p>
          <p>Data available: {dashboardData ? 'Yes' : 'No'}</p>
          <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(dashboardData, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  );
}