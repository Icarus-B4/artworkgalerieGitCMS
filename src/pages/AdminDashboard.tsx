import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, LogOut, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProjectUploadDialog } from "@/components/admin/ProjectUploadDialog";
import { ProjectListItem } from "@/components/admin/ProjectListItem";
import { useAuth } from "@/contexts/AuthContext";
import { fetchFileFromGitHub } from "@/lib/github";
import projectsData from "@/data/projects.json";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: projects = [], refetch } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      try {
        // Try to fetch from GitHub to get latest state
        const file = await fetchFileFromGitHub('src/data/projects.json');
        if (file) {
          return JSON.parse(file.content);
        }
      } catch (e) {
        console.error("Failed to fetch from GitHub, falling back to local", e);
      }
      return projectsData;
    },
    enabled: isAuthenticated,
  });

  const stats = {
    totalProjects: projects.length,
    totalLikes: projects.reduce((sum: number, p: any) => sum + (p.likes || 0), 0),
    totalViews: projects.reduce((sum: number, p: any) => sum + (p.views || 0), 0),
  };

  const handleSignOut = () => {
    logout();
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet",
    });
    navigate("/admin");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => navigate("/")} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Button>
              <Button onClick={handleSignOut} variant="ghost">
                <LogOut className="w-4 h-4 mr-2" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Projekte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalProjects}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle>Aufrufe</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle>Likes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalLikes}</p>
              <p className="text-sm text-muted-foreground">Gesamt</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <Card className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Projekte verwalten</span>
              <ProjectUploadDialog onProjectCreated={refetch} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">Noch keine Projekte vorhanden</p>
                <p className="text-sm">
                  Klicken Sie auf "Neues Projekt", um Ihr erstes Projekt hochzuladen
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project: any) => (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onProjectDeleted={refetch}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

