import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { Restaurant, InsertRestaurant } from "@shared/schema";
import { insertRestaurantSchema } from "@shared/schema";
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

export default function AdminRestaurants() {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [deleteRestaurant, setDeleteRestaurant] = useState<Restaurant | null>(null);

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const form = useForm<InsertRestaurant>({
    resolver: zodResolver(insertRestaurantSchema),
    defaultValues: {
      name: "",
      description: "",
      cuisine: "",
      priceRange: "$",
      averagePrice: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      hours: "",
      imageUrl: "",
      imageGallery: [],
      latitude: "0",
      longitude: "0",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertRestaurant) => {
      return await apiRequest("POST", "/api/restaurants", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant created successfully",
      });
      setShowDialog(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create restaurant",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertRestaurant }) => {
      return await apiRequest("PUT", `/api/restaurants/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant updated successfully",
      });
      setShowDialog(false);
      setEditingRestaurant(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/restaurants/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/restaurants"] });
      toast({
        title: "Success",
        description: "Restaurant deleted successfully",
      });
      setDeleteRestaurant(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete restaurant",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (restaurant?: Restaurant) => {
    if (restaurant) {
      setEditingRestaurant(restaurant);
      form.reset({
        name: restaurant.name,
        description: restaurant.description,
        cuisine: restaurant.cuisine,
        priceRange: restaurant.priceRange,
        averagePrice: restaurant.averagePrice || "",
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state || "",
        zipCode: restaurant.zipCode || "",
        phone: restaurant.phone || "",
        hours: restaurant.hours || "",
        imageUrl: restaurant.imageUrl || "",
        imageGallery: restaurant.imageGallery || [],
        latitude: restaurant.latitude || "0",
        longitude: restaurant.longitude || "0",
      });
    } else {
      setEditingRestaurant(null);
      form.reset();
    }
    setShowDialog(true);
  };

  const onSubmit = (data: InsertRestaurant) => {
    if (editingRestaurant) {
      updateMutation.mutate({ id: editingRestaurant.id, data });
    } else {
      createMutation.mutate(data);
    }
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
            <h1 className="font-heading text-xl font-semibold">Restaurants</h1>
            <div className="w-10"></div>
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-3xl font-semibold">Manage Restaurants</h2>
                <Button onClick={() => handleOpenDialog()} data-testid="button-add-restaurant">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Restaurant
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading...</div>
                  ) : restaurants && restaurants.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Cuisine</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Price Range</TableHead>
                          <TableHead>Avg Price</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {restaurants.map((restaurant) => (
                          <TableRow key={restaurant.id} data-testid={`row-restaurant-${restaurant.id}`}>
                            <TableCell className="font-medium">{restaurant.name}</TableCell>
                            <TableCell>{restaurant.cuisine}</TableCell>
                            <TableCell>{restaurant.city}</TableCell>
                            <TableCell>
                              {restaurant.averagePrice 
                                ? `$${parseFloat(restaurant.averagePrice).toFixed(0)}` 
                                : restaurant.priceRange}
                            </TableCell>
                            <TableCell>{restaurant.averagePrice ? `$${parseFloat(restaurant.averagePrice).toFixed(2)}` : '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenDialog(restaurant)}
                                  data-testid={`button-edit-${restaurant.id}`}
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteRestaurant(restaurant)}
                                  data-testid={`button-delete-${restaurant.id}`}
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
                      No restaurants yet. Click "Add Restaurant" to create one.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingRestaurant ? "Edit Restaurant" : "Add Restaurant"}
            </DialogTitle>
            <DialogDescription className="font-body">
              {editingRestaurant ? "Update restaurant information" : "Create a new restaurant"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cuisine</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-cuisine" />
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

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="priceRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-price-range">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="$">$ - Budget</SelectItem>
                          <SelectItem value="$$">$$ - Moderate</SelectItem>
                          <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                          <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averagePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          step="0.01"
                          placeholder="25.00"
                          data-testid="input-average-price" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-zipcode" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} placeholder="Mon-Fri: 9am-10pm" data-testid="textarea-hours" />
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
                    <FormLabel>Restaurant Image</FormLabel>
                    <div className="space-y-2">
                      {field.value && (
                        <div className="relative w-full h-40 rounded-md overflow-hidden bg-muted">
                          <img
                            src={field.value}
                            alt="Restaurant preview"
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
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-restaurant">
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRestaurant} onOpenChange={() => setDeleteRestaurant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteRestaurant?.name}"? This action cannot be undone and will also delete all associated menu items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRestaurant && deleteMutation.mutate(deleteRestaurant.id)}
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
