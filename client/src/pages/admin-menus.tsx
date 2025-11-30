import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
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
import { LayoutDashboard, UtensilsCrossed, Menu as MenuIcon, LogOut, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MenuItem, InsertMenuItem, Restaurant } from "@shared/schema";
import { insertMenuItemSchema } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";

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

export default function AdminMenus() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [deleteMenuItem, setDeleteMenuItem] = useState<MenuItem | null>(null);
  const [filterRestaurant, setFilterRestaurant] = useState<string>("all");

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const form = useForm<InsertMenuItem>({
    resolver: zodResolver(insertMenuItemSchema),
    defaultValues: {
      restaurantId: "",
      name: "",
      description: "",
      price: "0",
      category: "",
      imageUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMenuItem) => {
      return await apiRequest("POST", "/api/menu-items", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Success",
        description: "Menu item created successfully",
      });
      setShowDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertMenuItem }) => {
      return await apiRequest("PUT", `/api/menu-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Success",
        description: "Menu item updated successfully",
      });
      setShowDialog(false);
      setEditingMenuItem(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/menu-items/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      });
      setDeleteMenuItem(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (menuItem?: MenuItem) => {
    if (menuItem) {
      setEditingMenuItem(menuItem);
      form.reset({
        restaurantId: menuItem.restaurantId,
        name: menuItem.name,
        description: menuItem.description || "",
        price: menuItem.price,
        category: menuItem.category,
        imageUrl: menuItem.imageUrl || "",
      });
    } else {
      setEditingMenuItem(null);
      form.reset();
    }
    setShowDialog(true);
  };

  const onSubmit = (data: InsertMenuItem) => {
    if (editingMenuItem) {
      updateMutation.mutate({ id: editingMenuItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filteredMenuItems = menuItems?.filter((item) => {
    if (!filterRestaurant || filterRestaurant === "all") return true;
    return item.restaurantId === filterRestaurant;
  });

  const getRestaurantName = (restaurantId: string) => {
    return restaurants?.find((r) => r.id === restaurantId)?.name || "Unknown";
  };

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
            <h1 className="font-heading text-xl font-semibold">Menu Items</h1>
            <div className="w-10"></div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-3xl font-semibold">Manage Menu Items</h2>
                <Button onClick={() => handleOpenDialog()} data-testid="button-add-menu-item">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </div>

              <div className="mb-6">
                <Select value={filterRestaurant || "all"} onValueChange={setFilterRestaurant}>
                  <SelectTrigger className="w-full md:w-[300px]" data-testid="select-filter-restaurant">
                    <SelectValue placeholder="Filter by restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Restaurants</SelectItem>
                    {restaurants?.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                  ) : filteredMenuItems && filteredMenuItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMenuItems.map((item) => (
                          <TableRow key={item.id} data-testid={`row-menu-item-${item.id}`}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell>{getRestaurantName(item.restaurantId)}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(item)}
                                  data-testid={`button-edit-${item.id}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteMenuItem(item)}
                                  data-testid={`button-delete-${item.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      {filterRestaurant
                        ? "No menu items found for this restaurant"
                        : "No menu items yet. Click 'Add Menu Item' to create one."}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingMenuItem ? "Edit Menu Item" : "Add Menu Item"}
            </DialogTitle>
            <DialogDescription className="font-body">
              {editingMenuItem ? "Update menu item information" : "Create a new menu item"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="restaurantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-restaurant">
                          <SelectValue placeholder="Select a restaurant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {restaurants?.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Appetizers, Main Course" data-testid="input-category" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} data-testid="textarea-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" min="0" data-testid="input-price" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Menu Item Image (Optional)</FormLabel>
                    <div className="space-y-2">
                      {field.value && (
                        <div className="relative w-full h-40 rounded-md overflow-hidden bg-muted">
                          <img
                            src={field.value}
                            alt="Menu item preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <ObjectUploader
                          maxFileSize={10485760}
                          onUploadComplete={(objectPath) => {
                            field.onChange(objectPath);
                          }}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Image
                        </ObjectUploader>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => field.onChange("")}
                            data-testid="button-remove-image"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-menu-item">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteMenuItem} onOpenChange={() => setDeleteMenuItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteMenuItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMenuItem && deleteMutation.mutate(deleteMenuItem.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
