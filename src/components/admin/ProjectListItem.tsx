import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

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
  const { isAuthenticated } = useAuth();
  const canEditOrDelete = isAuthenticated;

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      design: "Design",
      fotografie: "Fotografie",
      illustration: "Illustration",
      ui_ux: "UI/UX",
      architektur: "Architektur",
      produktdesign: "Produktdesign",
      ai_ki: "AI/KI",
    };
    return labels[category] || category;
  };

  const handleDelete = async () => {
    toast({
      title: 'Nicht verfügbar',
      description: 'Projekt-Löschung ist mit Git CMS nicht verfügbar',
      variant: 'destructive',
    });
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
