import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function CustomerHeader() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/user/logout");
      await queryClient.invalidateQueries({ queryKey: ["/api/user/check"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <button 
          onClick={() => setLocation("/")}
          className="font-heading text-2xl font-semibold text-foreground hover-elevate active-elevate-2 px-3 py-1 rounded-md"
          data-testid="link-home"
        >
          FoodieFinder
        </button>
        <div className="flex items-center gap-3">
          {!isLoading && !isAuthenticated && (
            <Button
              onClick={() => setLocation("/login")}
              variant="outline"
              data-testid="button-login"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
          )}
          {isAuthenticated && user && (
            <>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="font-ui font-medium" data-testid="text-user-name">
                  {user.firstName || user.email}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
