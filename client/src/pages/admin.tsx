import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings, Users, BarChart, Calendar, Trash2, Edit, ExternalLink, Clipboard } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema } from "@shared/schema";
import { z } from "zod";

const clientFormSchema = insertClientSchema.extend({
  name: z.string().min(1, "Client name is required"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function AdminPanel() {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const { toast } = useToast();

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    },
  });

  const addClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to add client');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsAddClientOpen(false);
      toast({
        title: "Client Added",
        description: "New client has been successfully added.",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add client",
        variant: "destructive",
      });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete client');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client Deleted",
        description: "Client has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive",
      });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ClientFormData> }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update client');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setEditingClient(null);
      editForm.reset();
      toast({
        title: "Client Updated",
        description: "Client has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update client",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      metaAccessToken: "",
      instagramAccessToken: "",
      twitterAccessToken: "",
      linkedinAccessToken: "",
      tiktokAccessToken: "",
      metaPageId: "",
      instagramAccountId: "",
      twitterUserId: "",
      linkedinPageId: "",
      tiktokUserId: "",
    },
  });

  const editForm = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      metaAccessToken: "",
      instagramAccessToken: "",
      twitterAccessToken: "",
      linkedinAccessToken: "",
      tiktokAccessToken: "",
      metaPageId: "",
      instagramAccountId: "",
      twitterUserId: "",
      linkedinPageId: "",
      tiktokUserId: "",
    },
  });

  const onSubmit = (data: ClientFormData) => {
    addClientMutation.mutate(data);
  };

  const onEditSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClientMutation.mutate({ id: editingClient.id, data });
    }
  };

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    editForm.reset({
      name: client.name || "",
      metaAccessToken: client.metaAccessToken || "",
      instagramAccessToken: client.instagramAccessToken || "",
      twitterAccessToken: client.twitterAccessToken || "",
      linkedinAccessToken: client.linkedinAccessToken || "",
      tiktokAccessToken: client.tiktokAccessToken || "",
      metaPageId: client.metaPageId || "",
      instagramAccountId: client.instagramAccountId || "",
      twitterUserId: client.twitterUserId || "",
      linkedinPageId: client.linkedinPageId || "",
      tiktokUserId: client.tiktokUserId || "",
    });
  };

  const handleDeleteClient = (clientId: number) => {
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      deleteClientMutation.mutate(clientId);
    }
  };

  const generateClientUrl = (client: any) => {
    const slug = client.name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .trim();
    return `${window.location.origin}/${slug}`;
  };

  const copyClientUrl = (client: any) => {
    const url = generateClientUrl(client);
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Client dashboard URL has been copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <BarChart className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold">SocialPulse Admin</h1>
          </div>
          <div className="ml-auto">
            <Badge variant="secondary">Admin Panel</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="clients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="clients" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Clients</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Client Management</h2>
                <p className="text-slate-600">Manage your clients and their social media accounts.</p>
              </div>
              <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Client</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Client Name</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Enter client name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="metaAccessToken">Meta Access Token</Label>
                      <Input
                        id="metaAccessToken"
                        {...form.register("metaAccessToken")}
                        placeholder="Enter Meta access token"
                      />
                    </div>
                    <div>
                      <Label htmlFor="metaPageId">Meta Page ID</Label>
                      <Input
                        id="metaPageId"
                        {...form.register("metaPageId")}
                        placeholder="Enter Meta page ID"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagramAccessToken">Instagram Access Token</Label>
                      <Input
                        id="instagramAccessToken"
                        {...form.register("instagramAccessToken")}
                        placeholder="Enter Instagram access token"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagramAccountId">Instagram Account ID</Label>
                      <Input
                        id="instagramAccountId"
                        {...form.register("instagramAccountId")}
                        placeholder="Enter Instagram account ID"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddClientOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addClientMutation.isPending}>
                        {addClientMutation.isPending ? "Adding..." : "Add Client"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Clients</CardTitle>
              </CardHeader>
              <CardContent>
                {clientsLoading ? (
                  <div className="text-center py-8">Loading clients...</div>
                ) : clients?.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No clients found. Add your first client to get started.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Status</TableHead>
                          <TableHead className="min-w-[150px]">Platforms</TableHead>
                          <TableHead className="hidden lg:table-cell">Dashboard URL</TableHead>
                          <TableHead className="min-w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {clients?.map((client: any) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={
                              client.metaAccessToken || client.instagramAccessToken || 
                              client.twitterAccessToken || client.linkedinAccessToken || 
                              client.tiktokAccessToken ? "default" : "secondary"
                            }>
                              {client.metaAccessToken || client.instagramAccessToken || 
                               client.twitterAccessToken || client.linkedinAccessToken || 
                               client.tiktokAccessToken ? "Connected" : "Setup Required"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {client.metaAccessToken && <Badge variant="outline">Meta</Badge>}
                              {client.instagramAccessToken && <Badge variant="outline">Instagram</Badge>}
                              {client.twitterAccessToken && <Badge variant="outline">Twitter</Badge>}
                              {client.linkedinAccessToken && <Badge variant="outline">LinkedIn</Badge>}
                              {client.tiktokAccessToken && <Badge variant="outline">TikTok</Badge>}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex space-x-2">
                              <Link href={generateClientUrl(client)}>
                                <Button
                                  variant="ghost"
                                  size="sm" 
                                  className="flex items-center space-x-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  <span>Open</span>
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.origin + generateClientUrl(client));
                                  toast({
                                    title: "Copied!",
                                    description: "Dashboard URL copied to clipboard",
                                  });
                                }}
                                className="flex items-center space-x-1"
                              >
                                <Clipboard className="h-3 w-3" />
                                <span>Copy URL</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Link href={generateClientUrl(client)} className="lg:hidden">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center space-x-1"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyClientUrl(client)}
                                className="flex items-center space-x-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Copy URL</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditClient(client)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Overall system performance and client metrics will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Configure automated report generation and delivery schedules.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Configure global system settings and API configurations.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}