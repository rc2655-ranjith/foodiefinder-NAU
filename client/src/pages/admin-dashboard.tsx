import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, UtensilsCrossed, Menu as MenuIcon, LogOut } from "lucide-react";
import type { Restaurant, MenuItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/admin/logout", {});
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      url: "/admin/dashboard",
    },
    {
      title: "Restaurants",
      icon: UtensilsCrossed,
      url: "/admin/restaurants",
    },
    {
      title: "Menu Items",
      icon: MenuIcon,
      url: "/admin/menus",
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-heading text-lg">Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => setLocation(item.url)}
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const stats = [
    {
      title: "Total Restaurants",
      value: restaurants?.length || 0,
      icon: UtensilsCrossed,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Menu Items",
      value: menuItems?.length || 0,
      icon: MenuIcon,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
  ];

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="font-heading text-xl font-semibold">Dashboard</h1>
            <div className="w-10"></div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <h2 className="font-heading text-3xl font-semibold mb-8">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-ui text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="font-heading text-3xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Recent Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  {restaurants && restaurants.length > 0 ? (
                    <div className="space-y-4">
                      {restaurants.slice(0, 5).map((restaurant) => (
                        <div
                          key={restaurant.id}
                          className="flex items-center justify-between p-4 rounded-lg hover-elevate"
                        >
                          <div>
                            <h3 className="font-ui font-medium">{restaurant.name}</h3>
                            <p className="font-body text-sm text-muted-foreground">
                              {restaurant.cuisine} • {restaurant.city}
                            </p>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {restaurant.priceRange}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="font-body text-muted-foreground">No restaurants yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
