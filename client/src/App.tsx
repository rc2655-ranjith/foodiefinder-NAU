import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Restaurants from "@/pages/restaurants";
import RestaurantDetail from "@/pages/restaurant-detail";
import Login from "@/pages/login";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminRestaurants from "@/pages/admin-restaurants";
import AdminMenus from "@/pages/admin-menus";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/restaurants" component={Restaurants} />
      <Route path="/restaurant/:id" component={RestaurantDetail} />
      <Route path="/login" component={Login} />
      
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/restaurants" component={AdminRestaurants} />
      <Route path="/admin/menus" component={AdminMenus} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
