import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Heart, Eye, Download, ArrowLeft, Edit } from "lucide-react";
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
} from "@/components/ui/dialog"; // Import Dialog components

// Demo images
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.png";
import project5 from "@/assets/project-5.jpg";
import project6 from "@/assets/project-6.jpg";
import project7 from "@/assets/project-7.webp";
import project8 from "@/assets/project-8.png";

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
    title: "Landschaft",
    description: "Atemberaubende Landschaftsfotografie zur goldenen Stunde. Biel/Bienne - Ligerz",
    category: "fotografie",
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
  const [openMedia, setOpenMedia] = useState<
    { url: string; type: string } | null
  >(null); // State for the currently open media in the dialog

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      // Only support demo projects with Git CMS
      if (id?.startsWith("demo-")) {
        return demoProjectsData[id];
      }
      // Non-demo projects not supported in Git CMS
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

  const { data: projectMedia = [] } = useQuery({
    queryKey: ["project-media", id],
    queryFn: async () => [],
    enabled: false,
  });

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
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/edit-project/${project.id}`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Projekt bearbeiten
              </Button>
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
              {projectMedia.map((media, index) => (
                <div
                  key={media.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {media.media_type === "video" ? (
                    <video
                      src={media.media_url}
                      className="w-full h-48 object-cover rounded-lg shadow-lg"
                      controls
                      playsInline
                    />
                  ) : (
                    <div
                      className="cursor-zoom-in" // Apply cursor only to images
                      onClick={() =>
                        setOpenMedia({
                          url: media.media_url,
                          type: media.media_type,
                        })
                      }
                    >
                      <img
                        src={media.media_url}
                        alt={`${project.title} - Medien ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
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
