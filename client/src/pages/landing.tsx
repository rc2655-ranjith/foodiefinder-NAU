import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, Utensils, Star, LogIn, LogOut, User, ChevronsUpDown, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@shared/schema";
import heroImage from "@assets/generated_images/restaurant_hero_food_photography.png";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedCuisine) params.append("cuisine", selectedCuisine);
    setLocation(`/restaurants?${params.toString()}`);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/user/logout");
      await queryClient.invalidateQueries({ queryKey: ["/api/user/check"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h2 className="font-heading text-2xl font-semibold text-white">FoodieFinder</h2>
          <div className="flex gap-2">
            {!isLoading && !isAuthenticated && (
              <Button
                onClick={() => setLocation("/login")}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                data-testid="button-login"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            )}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  <span className="font-ui" data-testid="text-user-name">
                    {user.firstName || user.email}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <div 
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})` 
        }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center pt-16">
          <h1 className="font-heading text-5xl md:text-6xl font-semibold text-white mb-6">
            Discover Your Next Favorite Restaurant
          </h1>
          <p className="font-body text-xl text-white/90 mb-8">
            Explore amazing dining experiences near you
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white"
                      data-testid="button-search-hero"
                    >
                      {selectedRestaurantId
                        ? restaurants?.find((r) => r.id === selectedRestaurantId)?.name
                        : searchQuery
                        ? `Search: "${searchQuery}"`
                        : "Search restaurants..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search restaurants..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        data-testid="input-search-hero"
                      />
                      <CommandList>
                        <CommandEmpty>No restaurants found.</CommandEmpty>
                        <CommandGroup heading="All Restaurants">
                          {restaurants?.map((restaurant) => (
                            <CommandItem
                              key={restaurant.id}
                              value={restaurant.id}
                              onSelect={(currentValue) => {
                                setSelectedRestaurantId(currentValue === selectedRestaurantId ? "" : currentValue);
                                setSearchQuery(restaurant.name);
                                setOpenCombobox(false);
                                setLocation(`/restaurant/${restaurant.id}`);
                              }}
                              data-testid={`item-restaurant-${restaurant.id}`}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRestaurantId === restaurant.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col flex-1">
                                <span className="font-medium">{restaurant.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {restaurant.cuisine} • {restaurant.city} • {restaurant.averagePrice ? `$${parseFloat(restaurant.averagePrice).toFixed(0)}` : restaurant.priceRange}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                <SelectTrigger className="w-full md:w-[200px] bg-white/20 border-white/30 text-white" data-testid="select-cuisine-hero">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="italian">Italian</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="mexican">Mexican</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="american">American</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="indian">Indian</SelectItem>
                  <SelectItem value="thai">Thai</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-ui font-medium uppercase tracking-wide"
                data-testid="button-search-hero"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-center mb-12">
            Why Choose FoodieFinder?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">Diverse Cuisines</h3>
              <p className="font-body text-muted-foreground">
                Explore restaurants offering cuisines from around the world
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">Find Nearby</h3>
              <p className="font-body text-muted-foreground">
                Discover great dining options in your neighborhood
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-3">Quality Picks</h3>
              <p className="font-body text-muted-foreground">
                Browse curated selections of top-rated restaurants
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button
              onClick={() => setLocation("/restaurants")}
              size="lg"
              className="font-ui font-medium uppercase tracking-wide"
              data-testid="button-browse-all"
            >
              Browse All Restaurants
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-card py-8 px-4 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <p className="font-body text-sm text-muted-foreground">
            © 2024 FoodieFinder. All rights reserved.
          </p>
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/admin/login")}
              className="font-ui text-sm"
              data-testid="link-admin-login"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
