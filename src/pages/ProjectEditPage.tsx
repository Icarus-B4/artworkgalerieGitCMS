import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { fetchFileFromGitHub, uploadFileToGitHub } from '@/lib/github';

const categories = [
  { value: "design", label: "Design" },
  { value: "fotografie", label: "Fotografie" },
  { value: "illustration", label: "Illustration" },
  { value: "ui_ux", label: "UI/UX" },
  { value: "architektur", label: "Architektur" },
  { value: "produktdesign", label: "Produktdesign" },
  { value: "video", label: "Video" },
  { value: "ai_ki", label: "AI/KI" },
];

const ProjectEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    if (!sessionLoading && !session) {
      navigate('/admin');
    }
  }, [session, sessionLoading, navigate]);

  useEffect(() => {
    const loadProject = async () => {
      if (!id) return;

      try {
        const file = await fetchFileFromGitHub('src/data/projects.json');
        if (file) {
          const projects = JSON.parse(file.content);
          const project = projects.find((p: any) => p.id === id);

          if (project) {
            setProjectData(project);
            setTitle(project.title);
            setDescription(project.description || "");
            setCategory(project.category);
          } else {
            toast({
              title: "Fehler",
              description: "Projekt nicht gefunden",
              variant: "destructive",
            });
            navigate("/admin/dashboard");
          }
        }
      } catch (error) {
        console.error("Error loading project:", error);
        toast({
          title: "Fehler",
          description: "Projekt konnte nicht geladen werden",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id, navigate, toast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const file = await fetchFileFromGitHub('src/data/projects.json');
      if (!file) throw new Error("Could not load projects data");

      const projects = JSON.parse(file.content);
      const projectIndex = projects.findIndex((p: any) => p.id === id);

      if (projectIndex === -1) throw new Error("Project not found");

      // Update project data
      projects[projectIndex] = {
        ...projects[projectIndex],
        title,
        description,
        category,
        // Keep existing fields
        updated_at: new Date().toISOString()
      };

      await uploadFileToGitHub(
        'src/data/projects.json',
        JSON.stringify(projects, null, 2),
        `Update project: ${title}`
      );

      toast({
        title: "Gespeichert",
        description: "Projektänderungen wurden erfolgreich gespeichert.",
      });

      navigate(`/project/${id}`);
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast({
        title: "Fehler",
        description: `Speichern fehlgeschlagen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Projekt bearbeiten</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Speichere...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Änderungen speichern
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEditPage;
