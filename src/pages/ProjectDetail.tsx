import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Download, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { LikeButton } from "@/components/LikeButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentsSection } from "@/components/CommentsSection";
import { getMediaType } from "@/lib/mediaUtils";
import { useSession } from "@/hooks/use-session";
import { useState, useEffect } from "react"; // Import useState and useEffect
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // Import Dialog components
import { useToast } from "@/hooks/use-toast";
import { deleteFileFromGitHub, fetchFileFromGitHub, uploadFileToGitHub } from "@/lib/github";

// Demo images
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.png";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";
import project7 from "@/assets/project-7.webp";
import project8 from "@/assets/project-8.png";
import projectsData from "@/data/projects.json";

const demoProjectsData: { [key: string]: any } = {
  "demo-1": {
    id: "demo-1",
    title: "Abstract Geometrie",
    description: "Eine moderne abstrakte Komposition mit geometrischen Formen und lebendigen Farbverläufen.",
    category: "design",
    cover_image_url: project1,
    likes: 234,
    views: 1523,
    downloadable: true,
  },
  "demo-2": {
    id: "demo-2",
    title: "Deep Core Developer",
    description: "VideoIntro for Deep Core Developer made with Blender 3D",
    category: "design",
    cover_image_url: project2,
    likes: 567,
    views: 3421,
    downloadable: true,
  },
  "demo-3": {
    id: "demo-3",
    title: "Surreale Kunst",
    description: "Kreative digitale Illustration mit surrealen Elementen und kräftigen Farben.",
    category: "illustration",
    cover_image_url: project3,
    likes: 432,
    views: 2134,
    downloadable: true,
  },
  "demo-4": {
    id: "demo-4",
    title: "Retouche",
    description: "Foto Retouchieren",
    category: "fotografie",
    cover_image_url: project4,
    likes: 891,
    views: 4532,
    downloadable: true,
  },
  "demo-5": {
    id: "demo-5",
    title: "Moderne Architektur",
    description: "Zeitgenössische Architekturfotografie moderner Gebäude mit Glas und Stahl.",
    category: "architektur",
    cover_image_url: project5,
    likes: 345,
    views: 2876,
    downloadable: true,
  },
  "demo-6": {
    id: "demo-6",
    title: "Produktfotografie",
    description: "Produktdesign-Fotografie moderner Elektronik mit eleganter Beleuchtung.",
    category: "produktdesign",
    cover_image_url: project6,
    likes: 678,
    views: 3987,
    downloadable: true,
  },
  "demo-7": {
    id: "demo-7",
    title: "Geometrie Blender",
    description: "Blender 3d Engine Rendering by Deepcore",
    category: "design",
    cover_image_url: project7,
    likes: 856,
    views: 4897,
    downloadable: true,
  },
  "demo-8": {
    id: "demo-8",
    title: "Musik Album Cover",
    description: "Erstellung des Musik Cover für Spotify Album. Elctro Tribe - Vaporize 2019",
    category: "design",
    cover_image_url: project8,
    likes: 943,
    views: 3846,
    downloadable: true,
  },
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { toast } = useToast();
  const [openMedia, setOpenMedia] = useState<
    { url: string; type: string } | null
  >(null); // State for the currently open media in the dialog
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!project || !id) return;

    setIsDeleting(true);
    try {
      // 1. Fetch current projects.json
      const projectsFile = await fetchFileFromGitHub('src/data/projects.json');
      if (!projectsFile) throw new Error("Could not fetch projects data");

      const projects = JSON.parse(projectsFile.content);
      const updatedProjects = projects.filter((p: any) => p.id !== id);

      // 2. Update projects.json
      await uploadFileToGitHub(
        'src/data/projects.json',
        JSON.stringify(updatedProjects, null, 2),
        `Delete project: ${project.title}`
      );

      // 3. Delete media files (optional, but good for cleanup)
      try {
        // Delete cover image
        if (project.cover_image_url && project.cover_image_url.includes('githubusercontent')) {
          const coverPath = project.cover_image_url.split('/main/')[1];
          if (coverPath) await deleteFileFromGitHub(coverPath, `Delete cover for ${project.title}`);
        }

        // Delete additional media
        if (project.media && Array.isArray(project.media)) {
          for (const media of project.media) {
            const mediaUrl = media.url || media.media_url;
            if (mediaUrl && mediaUrl.includes('githubusercontent')) {
              const mediaPath = mediaUrl.split('/main/')[1];
              if (mediaPath) await deleteFileFromGitHub(mediaPath, `Delete media for ${project.title}`);
            }
          }
        }
      } catch (error) {
        console.warn("Error cleaning up media files:", error);
      }

      toast({
        title: "Projekt gelöscht",
        description: "Das Projekt wurde erfolgreich entfernt.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error deleting project:", error);
      toast({
        title: "Fehler",
        description: `Löschen fehlgeschlagen: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      // First check if it's a real project from projects.json
      const realProject = projectsData.find((p) => p.id === id);
      if (realProject) {
        return realProject;
      }

      // Then check demo projects
      if (id?.startsWith("demo-")) {
        return demoProjectsData[id];
      }

      // Project not found
      return null;
    },
  });

  // Function to increment view count - disabled for Git CMS
  const incrementViewCount = async (projectId: string) => {
    // View counting not available with Git CMS
    return;
  };

  // Increment view count when component mounts and project is loaded
  useEffect(() => {
    if (project && id && !id.startsWith("demo-")) {
      incrementViewCount(id);
    }
  }, [project, id]);

  const { data: creatorProfile } = useQuery({
    queryKey: ["creatorProfile", project?.user_id],
    queryFn: async () => null,
    enabled: false,
  });

  // Use media from project object if available (for uploaded projects)
  const projectMedia = project?.media || [];

  const mediaType = project ? getMediaType(project.cover_image_url) : 'image';
  const isOwner = session?.user?.id === project?.user_id;

  const handleDownload = () => {
    if (project?.downloadable && project?.cover_image_url) {
      window.open(project.cover_image_url, "_blank");
    }
  };

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Projekt nicht gefunden</h1>
          <Link to="/">
            <Button>Zurück zur Galerie</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projekt löschen?</DialogTitle>
            <DialogDescription>
              Möchten Sie dieses Projekt wirklich unwiderruflich löschen?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Löscht..." : "Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Galerie
          </Button>
        </Link>

        {/* Project Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
              {project.category.replace("_", "/")}
            </span>
            <LikeButton projectId={id!} initialLikes={project.likes} />
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/edit-project/${project.id}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </Button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={
                    creatorProfile?.avatar_url ||
                    `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                      project.user_id || creatorProfile?.display_name || "guest"
                    )}`
                  }
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                  }}
                />
                <AvatarFallback>
                  {creatorProfile?.display_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <span>
                Erstellt von: {creatorProfile?.display_name || "Unbekannt"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Erstellt am: {new Date(project.created_at).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{project.views} Aufrufe</span>
            </div>

          </div>
        </div>

        {/* Main Media */}
        <div className="mb-8 animate-scale-in">
          {mediaType === 'video' ? (
            <video
              src={project.cover_image_url}
              className="w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              controls
              playsInline
            />
          ) : (
            <img
              src={project.cover_image_url}
              alt={project.title}
              className="w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
          )}
        </div>

        {/* Additional Media */}
        {projectMedia.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Weitere Medien</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectMedia.map((media, index) => {
                // Support both old structure (media_url/media_type) and new structure (url/type)
                const mediaUrl = media.url || media.media_url;
                const mediaType = media.type || media.media_type;

                return (
                  <div
                    key={media.id || index}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {mediaType === "video" ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                        controls
                        playsInline
                      />
                    ) : (
                      <div
                        className="cursor-zoom-in" // Apply cursor only to images
                        onClick={() =>
                          setOpenMedia({
                            url: mediaUrl,
                            type: mediaType,
                          })
                        }
                      >
                        <img
                          src={mediaUrl}
                          alt={`${project.title} - Medien ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Media Enlargement Dialog */}
        <Dialog open={!!openMedia} onOpenChange={() => setOpenMedia(null)}>
          <DialogContent className="max-w-7xl p-0"> {/* Reverted hideCloseButton as it caused an error */}
            {openMedia?.type === "video" ? (
              // This case should ideally not be reached if onClick is only on images
              <video
                src={openMedia.url}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                controls
                playsInline
                autoPlay
              />
            ) : (
              <img
                src={openMedia?.url}
                alt="Vergrößertes Medium"
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Description & Actions */}
        <div className="max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Beschreibung</h2>
            <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {project.description || "Keine Beschreibung verfügbar."}
            </p>
          </div>

          {project.downloadable && (
            <Button onClick={handleDownload} size="lg" className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Herunterladen
            </Button>
          )}
        </div>

        {/* Comments Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <CommentsSection projectId={id!} />
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
