import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

interface AuthResponse {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export function useAuth() {
  const { data, isLoading } = useQuery<AuthResponse>({
    queryKey: ["/api/user/check"],
    retry: false,
  });

  return {
    user: data?.user,
    isLoading,
    isAuthenticated: data?.authenticated ?? false,
  };
}
