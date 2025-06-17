import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Link, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ClientConnectionWidgetProps {
  clientId: number;
}

export default function ClientConnectionWidget({ clientId }: ClientConnectionWidgetProps) {
  const [showConnections, setShowConnections] = useState(false);
  const [metaToken, setMetaToken] = useState("");
  const [metaPageId, setMetaPageId] = useState("");
  const [instaToken, setInstaToken] = useState("");
  const [instaAccountId, setInstaAccountId] = useState("");
  const { toast } = useToast();

  const { data: client } = useQuery({
    queryKey: ['/api/clients', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/clients/${clientId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch client');
      return response.json();
    },
    enabled: !!clientId,
  });

  const updateConnectionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PATCH', `/api/clients/${clientId}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Connections Updated",
        description: "Platform connections have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setShowConnections(false);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update platform connections. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateConnections = () => {
    updateConnectionMutation.mutate({
      metaAccessToken: metaToken || null,
      metaPageId: metaPageId || null,
      instagramAccessToken: instaToken || null,
      instagramAccountId: instaAccountId || null,
    });
  };

  const isMetaConnected = client?.metaAccessToken && client?.metaPageId;
  const isInstaConnected = client?.instagramAccessToken && client?.instagramAccountId;

  const getClientDashboardUrl = () => {
    return `${window.location.origin}/client/${clientId}`;
  };

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Platform Connections
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowConnections(!showConnections)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Facebook className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Meta/Facebook</p>
                <div className="flex items-center space-x-1">
                  {isMetaConnected ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                      <span className="text-xs text-amber-600">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Instagram className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">Instagram</p>
                <div className="flex items-center space-x-1">
                  {isInstaConnected ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-amber-600" />
                      <span className="text-xs text-amber-600">Not Connected</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Dashboard Link */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Client Dashboard</p>
                <p className="text-xs text-slate-500">Share this link with your client</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(getClientDashboardUrl());
                  toast({
                    title: "Link Copied",
                    description: "Client dashboard link copied to clipboard.",
                  });
                }}
              >
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Connection Configuration */}
          {showConnections && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="metaToken" className="text-sm font-medium">
                    Meta Access Token
                  </Label>
                  <Input
                    id="metaToken"
                    type="password"
                    placeholder="Enter Meta access token"
                    value={metaToken}
                    onChange={(e) => setMetaToken(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="metaPageId" className="text-sm font-medium">
                    Meta Page ID
                  </Label>
                  <Input
                    id="metaPageId"
                    placeholder="Enter Meta page ID"
                    value={metaPageId}
                    onChange={(e) => setMetaPageId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instaToken" className="text-sm font-medium">
                    Instagram Access Token
                  </Label>
                  <Input
                    id="instaToken"
                    type="password"
                    placeholder="Enter Instagram access token"
                    value={instaToken}
                    onChange={(e) => setInstaToken(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instaAccountId" className="text-sm font-medium">
                    Instagram Account ID
                  </Label>
                  <Input
                    id="instaAccountId"
                    placeholder="Enter Instagram account ID"
                    value={instaAccountId}
                    onChange={(e) => setInstaAccountId(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpdateConnections}
                  disabled={updateConnectionMutation.isPending}
                  className="flex-1"
                >
                  {updateConnectionMutation.isPending ? "Updating..." : "Update Connections"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConnections(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}