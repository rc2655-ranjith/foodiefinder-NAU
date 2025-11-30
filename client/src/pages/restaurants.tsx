import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, MapPin, DollarSign, ChevronLeft, Check, ChevronsUpDown } from "lucide-react";
import { CustomerHeader } from "@/components/customer-header";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@shared/schema";

export default function Restaurants() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get("cuisine") || "");
  const [selectedPriceRange, setSelectedPriceRange] = useState(searchParams.get("price") || "");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");

  const { data: restaurants, isLoading } = useQuery<Restaurant[]>({
    queryKey: ["/api/restaurants"],
  });

  const filteredRestaurants = restaurants?.filter((restaurant) => {
    const matchesSearch = !searchQuery || 
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = !selectedCuisine || restaurant.cuisine.toLowerCase() === selectedCuisine.toLowerCase();
    
    let matchesPrice = true;
    if (selectedPriceRange) {
      if (restaurant.averagePrice === null || restaurant.averagePrice === undefined || restaurant.averagePrice === "") {
        matchesPrice = false;
      } else {
        const avgPrice = parseFloat(restaurant.averagePrice);
        if (isNaN(avgPrice)) {
          matchesPrice = false;
        } else if (selectedPriceRange === "$") {
          matchesPrice = avgPrice < 15;
        } else if (selectedPriceRange === "$$") {
          matchesPrice = avgPrice >= 15 && avgPrice < 30;
        } else if (selectedPriceRange === "$$$") {
          matchesPrice = avgPrice >= 30 && avgPrice < 60;
        } else if (selectedPriceRange === "$$$$") {
          matchesPrice = avgPrice >= 60;
        }
      }
    }
    
    return matchesSearch && matchesCuisine && matchesPrice;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCuisine("");
    setSelectedPriceRange("");
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-heading text-2xl md:text-3xl font-semibold">
              Discover Restaurants
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between"
                    data-testid="button-search-restaurants"
                  >
                    {selectedRestaurantId
                      ? restaurants?.find((r) => r.id === selectedRestaurantId)?.name
                      : searchQuery
                      ? `Search: "${searchQuery}"`
                      : "Search restaurants..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search restaurants..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      data-testid="input-search-restaurants"
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
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-cuisine-filter">
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
            <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-price-filter">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="$">$ - Budget</SelectItem>
                <SelectItem value="$$">$$ - Moderate</SelectItem>
                <SelectItem value="$$$">$$$ - Upscale</SelectItem>
                <SelectItem value="$$$$">$$$$ - Fine Dining</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || selectedCuisine || selectedPriceRange) && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                data-testid="button-clear-filters"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 rounded-t-lg" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="font-body text-sm text-muted-foreground" data-testid="text-results-count">
                {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <Card 
                  key={restaurant.id} 
                  className="hover-elevate cursor-pointer overflow-hidden"
                  onClick={() => setLocation(`/restaurant/${restaurant.id}`)}
                  data-testid={`card-restaurant-${restaurant.id}`}
                >
                  <div className="relative h-48 bg-muted">
                    {restaurant.imageUrl ? (
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No image
                      </div>
                    )}
                    <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                      {restaurant.cuisine}
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-semibold mb-2" data-testid={`text-name-${restaurant.id}`}>
                      {restaurant.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-2">
                      {restaurant.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.city}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {restaurant.averagePrice 
                            ? `$${parseFloat(restaurant.averagePrice).toFixed(0)}` 
                            : restaurant.priceRange}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="font-body text-lg text-muted-foreground mb-4">
              No restaurants found matching your criteria
            </p>
            <Button onClick={handleClearFilters} data-testid="button-clear-filters-empty">
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
