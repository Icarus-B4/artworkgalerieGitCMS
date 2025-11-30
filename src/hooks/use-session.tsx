import { useAuth } from "@/contexts/AuthContext";

// Adapter hook to maintain compatibility with existing code
export const useSession = () => {
  const { isAuthenticated, loading } = useAuth();
  
  return { 
    session: isAuthenticated ? { user: { id: 'admin' } } : null, 
    loading 
  };
};
