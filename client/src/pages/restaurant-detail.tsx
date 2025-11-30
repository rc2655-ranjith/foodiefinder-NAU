import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, MapPin, Phone, Clock, DollarSign } from "lucide-react";
import { CustomerHeader } from "@/components/customer-header";
import { PaymentDialog } from "@/components/payment-dialog";
import type { Restaurant, MenuItem } from "@shared/schema";

export default function RestaurantDetail() {
  const [, params] = useRoute("/restaurant/:id");
  const [, setLocation] = useLocation();
  const restaurantId = params?.id;
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const { data: restaurant, isLoading: restaurantLoading } = useQuery<Restaurant>({
    queryKey: ["/api/restaurants", restaurantId],
    enabled: !!restaurantId,
  });

  const { data: menuItems, isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/restaurants", restaurantId, "menu"],
    enabled: !!restaurantId,
  });

  const menuCategories = menuItems?.reduce((acc, item) => {
    if (!acc.includes(item.category)) {
      acc.push(item.category);
    }
    return acc;
  }, [] as string[]) || [];

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CustomerHeader />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full mb-8 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-lg text-muted-foreground mb-4">Restaurant not found</p>
          <Button onClick={() => setLocation("/restaurants")} data-testid="button-back-restaurants">
            Back to Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CustomerHeader />
      <div className="relative h-96 bg-muted">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
        <div className="absolute top-4 left-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setLocation("/restaurants")}
            className="backdrop-blur-md bg-white/20 hover:bg-white/30"
            data-testid="button-back"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-8">
          <div className="max-w-7xl mx-auto">
            <Badge className="bg-accent text-accent-foreground mb-4">
              {restaurant.cuisine}
            </Badge>
            <h1 className="font-heading text-4xl md:text-5xl font-semibold text-white" data-testid="text-restaurant-name">
              {restaurant.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="font-heading">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-foreground">{restaurant.description}</p>
              </CardContent>
            </Card>

            {restaurant.imageGallery && restaurant.imageGallery.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="font-heading">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {restaurant.imageGallery.map((imageUrl, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={imageUrl}
                          alt={`${restaurant.name} gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Menu</CardTitle>
              </CardHeader>
              <CardContent>
                {menuLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : menuItems && menuItems.length > 0 ? (
                  <div className="space-y-6">
                    {menuCategories.map((category) => (
                      <div key={category}>
                        <h3 className="font-heading text-xl font-semibold mb-4">{category}</h3>
                        <div className="space-y-4">
                          {menuItems
                            .filter((item) => item.category === category)
                            .map((item) => (
                              <div key={item.id} className="flex justify-between gap-4" data-testid={`menu-item-${item.id}`}>
                                <div className="flex-1">
                                  <h4 className="font-ui font-medium">{item.name}</h4>
                                  {item.description && (
                                    <p className="font-body text-sm text-muted-foreground mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="font-ui font-semibold text-primary">
                                  ${parseFloat(item.price).toFixed(2)}
                                </div>
                              </div>
                            ))}
                        </div>
                        {category !== menuCategories[menuCategories.length - 1] && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-body text-muted-foreground">No menu items available</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="font-heading">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-ui text-sm font-medium">Address</p>
                    <p className="font-body text-sm text-muted-foreground">
                      {restaurant.address}
                      <br />
                      {restaurant.city}
                      {restaurant.state && `, ${restaurant.state}`}
                      {restaurant.zipCode && ` ${restaurant.zipCode}`}
                    </p>
                  </div>
                </div>

                {restaurant.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-ui text-sm font-medium">Phone</p>
                      <p className="font-body text-sm text-muted-foreground">{restaurant.phone}</p>
                    </div>
                  </div>
                )}

                {restaurant.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-ui text-sm font-medium">Hours</p>
                      <p className="font-body text-sm text-muted-foreground whitespace-pre-line">
                        {restaurant.hours}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-ui text-sm font-medium">Average Price</p>
                    <p className="font-body text-sm text-primary font-semibold">
                      {restaurant.averagePrice 
                        ? `$${parseFloat(restaurant.averagePrice).toFixed(0)}` 
                        : restaurant.priceRange}
                    </p>
                  </div>
                </div>

                <Separator />

                <Button 
                  className="w-full font-ui font-medium uppercase tracking-wide"
                  onClick={() => setPaymentDialogOpen(true)}
                  data-testid="button-reserve-table"
                >
                  Reserve Table
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        restaurantName={restaurant.name}
        amount={restaurant.averagePrice || "50.00"}
      />
    </div>
  );
}
