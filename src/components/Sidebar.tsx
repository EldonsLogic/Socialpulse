import { User, BarChart3, FileText, Users, Settings, TrendingUp, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface Client {
  id: number;
  name: string;
}

interface SidebarProps {
  clients: Client[];
  selectedClientId: number;
  onClientSelect: (clientId: number) => void;
}

export default function Sidebar({ clients, selectedClientId, onClientSelect }: SidebarProps) {
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const navigationItems = [
    { icon: TrendingUp, label: "Dashboard", active: true, href: `/dashboard/${selectedClientId}` },
    { icon: BarChart3, label: "Analytics", active: false, href: "#" },
    { icon: FileText, label: "Reports", active: false, href: "#" },
    { icon: Users, label: "Admin Panel", active: false, href: "/admin" },
    { icon: Settings, label: "Settings", active: false, href: "#" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">SocialPulse</h1>
            <p className="text-xs text-slate-500">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Client Selector */}
      <div className="p-4 border-b border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Active Client
        </label>
        <Select
          value={selectedClientId.toString()}
          onValueChange={(value) => onClientSelect(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue>{selectedClient?.name || "Select client"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.label}>
              {item.href === "#" ? (
                <Button
                  variant={item.active ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    item.active
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                  disabled
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant={item.active ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      item.active
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              Sarah Johnson
            </p>
            <p className="text-xs text-slate-500 truncate">Agency Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
