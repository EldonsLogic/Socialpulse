import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();
  const [accessToken, setAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [instagramId, setInstagramId] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
  });

  const updateTokenMutation = useMutation({
    mutationFn: async (data: { accessToken: string; pageId?: string; instagramId?: string }) => {
      return apiRequest('/api/settings/token', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Token Updated",
        description: "API credentials have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setAccessToken('');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update token.",
        variant: "destructive",
      });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/settings/test-connection', {
        method: 'POST',
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Test",
        description: data.success ? "API connection is working!" : "API connection failed.",
        variant: data.success ? "default" : "destructive",
      });
    },
  });

  const handleUpdateToken = () => {
    if (!accessToken.trim()) {
      toast({
        title: "Missing Token",
        description: "Please enter an access token.",
        variant: "destructive",
      });
      return;
    }

    updateTokenMutation.mutate({
      accessToken: accessToken.trim(),
      pageId: pageId.trim() || undefined,
      instagramId: instagramId.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Settings className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Facebook API Configuration</span>
            </CardTitle>
            <CardDescription>
              Configure global system settings and API configurations for Facebook and Instagram data access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Status */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Current API Status</h3>
              <div className="flex items-center space-x-2">
                {settings?.tokenValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 dark:text-green-300">API Connection Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 dark:text-red-300">API Connection Issues</span>
                  </>
                )}
              </div>
              {settings?.lastSync && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Last sync: {new Date(settings.lastSync).toLocaleString()}
                </p>
              )}
            </div>

            {/* Token Update Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="access-token">Facebook Page Access Token</Label>
                <Textarea
                  id="access-token"
                  placeholder="Enter your Facebook Page Access Token..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Generate this from Facebook Developer Console > Your App > Graph API Explorer
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page-id">Facebook Page ID (Optional)</Label>
                  <Input
                    id="page-id"
                    placeholder="e.g., 446365348569001"
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="instagram-id">Instagram Account ID (Optional)</Label>
                  <Input
                    id="instagram-id"
                    placeholder="e.g., 17841400455970028"
                    value={instagramId}
                    onChange={(e) => setInstagramId(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleUpdateToken}
                  disabled={updateTokenMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {updateTokenMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Update Token</span>
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => testConnectionMutation.mutate()}
                  disabled={testConnectionMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  {testConnectionMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4" />
                  )}
                  <span>Test Connection</span>
                </Button>
              </div>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Token Requirements:</strong> Use a Page Access Token, not a User Access Token. 
                Generate from Facebook Developer Console and ensure it has pages_read_engagement, 
                pages_show_list, and instagram_basic permissions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current system status and configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Database Status:</strong> Connected
              </div>
              <div>
                <strong>Auto-refresh:</strong> Every 30 seconds
              </div>
              <div>
                <strong>Data Retention:</strong> 90 days
              </div>
              <div>
                <strong>Last Update:</strong> {new Date().toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}