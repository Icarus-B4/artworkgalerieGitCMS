import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, Trash2, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";

interface ProjectListItemProps {
  project: {
    id: string;
    title: string;
    category: string;
    cover_image_url: string;
    likes: number;
    views: number;
    user_id?: string | null;
  };
  onProjectDeleted: () => void;
}

export const ProjectListItem = ({ project, onProjectDeleted }: ProjectListItemProps) => {
  const { toast } = useToast();
  const { session } = useSession();
  const isOwner = session?.user?.id === project.user_id;
  const isAdmin = false; // Implementiere hier die Admin-Rollenprüfung, falls benötigt
  const canEditOrDelete = isOwner || isAdmin;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      design: "Design",
      fotografie: "Fotografie",
      illustration: "Illustration",
      ui_ux: "UI/UX",
      architektur: "Architektur",
      produktdesign: "Produktdesign",
      ai_ki:"AI/KI",
    };
    return labels[category] || category;
  };

  const handleDelete = async () => {
    if (!confirm("Möchten Sie dieses Projekt wirklich löschen?")) return;

    try {
      // Fetch project media entries
      const { data: mediaItems, error: mediaFetchError } = await supabase
        .from('project_media')
        .select('id, media_url')
        .eq('project_id', project.id);

      if (mediaFetchError) {
        console.error('Error fetching project media:', mediaFetchError);
        throw mediaFetchError;
      }

      // Attempt to delete each media object from R2 (best-effort)
      if (mediaItems && mediaItems.length > 0) {
        await Promise.all(mediaItems.map(async (m: any) => {
          try {
            await fetch('/api/delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: m.media_url }),
            });
          } catch (err) {
            console.error('Error deleting media from R2:', err);
          }
        }));

        // Remove media rows from DB
        const { error: delMediaError } = await supabase
          .from('project_media')
          .delete()
          .eq('project_id', project.id);

        if (delMediaError) {
          console.error('Error deleting media rows:', delMediaError);
          throw delMediaError;
        }
      }

      // Finally delete the project row
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Projekt wurde gelöscht',
      });

      onProjectDeleted();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Fehler',
        description: 'Projekt konnte nicht gelöscht werden',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img
          src={project.cover_image_url}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
            <p className="text-sm text-muted-foreground">
              {getCategoryLabel(project.category)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{project.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{project.views}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(`/project/${project.id}`, "_blank")}
            >
              <Eye className="w-4 h-4 mr-1" />
              Ansehen
            </Button>
            {canEditOrDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
