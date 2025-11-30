import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, User } from "lucide-react";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roles) {
      navigate("/admin/dashboard");
      toast({
        title: "Zugriff verweigert",
        description: "Sie haben keine Berechtigung für diese Seite",
        variant: "destructive",
      });
      return;
    }

    setLoading(false);
  };

  const { data: users = [], refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id);

          return {
            ...profile,
            roles: roles?.map((r) => r.role) || ["user"],
          };
        })
      );

      return usersWithRoles;
    },
    enabled: !loading,
  });

  const handleToggleRole = async (userId: string, role: "admin" | "moderator") => {
    try {
      const user = users.find((u) => u.id === userId);
      const hasRole = user?.roles.includes(role);

      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;
      } else {
        // Add role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });

        if (error) throw error;
      }

      refetch();
      toast({
        title: "Erfolg",
        description: `Rolle wurde ${hasRole ? "entfernt" : "hinzugefügt"}`,
      });
    } catch (error) {
      console.error("Error toggling role:", error);
      toast({
        title: "Fehler",
        description: "Rolle konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/admin/dashboard")} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Alle Benutzer ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage
                            src={
                              user.avatar_url ||
                              `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                                user.id || user.display_name || "guest"
                              )}`
                            }
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                          <AvatarFallback>
                            {user.display_name?.[0]?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">
                            {user.display_name || "Kein Name"}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {user.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={role === "admin" ? "default" : "secondary"}
                              >
                                {role === "admin" && <Shield className="w-3 h-3 mr-1" />}
                                {role === "moderator" && <User className="w-3 h-3 mr-1" />}
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={user.roles.includes("admin") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleRole(user.id, "admin")}
                        >
                          Admin
                        </Button>
                        <Button
                          variant={user.roles.includes("moderator") ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleRole(user.id, "moderator")}
                        >
                          Moderator
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;