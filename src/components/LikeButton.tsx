import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { fetchFileFromGitHub, uploadFileToGitHub } from "@/lib/github";

interface LikeButtonProps {
  projectId: string;
  initialLikes: number;
  size?: "default" | "sm" | "lg";
}

export const LikeButton = ({ projectId, initialLikes, size = "default" }: LikeButtonProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check local storage for liked status on mount
  useEffect(() => {
    const likedProjects = JSON.parse(localStorage.getItem("liked_projects") || "[]");
    if (likedProjects.includes(projectId)) {
      setIsLiked(true);
    }
  }, [projectId]);

  const handleLike = async () => {
    if (isLoading) return;
    if (projectId.startsWith("demo-")) {
      toast({
        title: "Demo-Modus",
        description: "Likes sind für Demo-Projekte deaktiviert.",
      });
      return;
    }

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikes = newIsLiked ? likes + 1 : likes - 1;

    setLikes(newLikes);
    setIsLiked(newIsLiked);
    setIsLoading(true);

    try {
      // 1. Update local storage
      const likedProjects = JSON.parse(localStorage.getItem("liked_projects") || "[]");
      if (newIsLiked) {
        localStorage.setItem("liked_projects", JSON.stringify([...likedProjects, projectId]));
      } else {
        localStorage.setItem("liked_projects", JSON.stringify(likedProjects.filter((id: string) => id !== projectId)));
      }

      // 2. Fetch current projects data
      const file = await fetchFileFromGitHub('src/data/projects.json');
      if (!file) throw new Error("Could not load projects data");

      const projects = JSON.parse(file.content);
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);

      if (projectIndex === -1) throw new Error("Project not found");

      // 3. Update likes in data
      // Ensure we don't go below 0 and handle potential sync conflicts gracefully
      // We trust the optimistic update logic but verify against current data
      let currentServerLikes = projects[projectIndex].likes || 0;
      if (newIsLiked) {
        projects[projectIndex].likes = currentServerLikes + 1;
      } else {
        projects[projectIndex].likes = Math.max(0, currentServerLikes - 1);
      }

      // 4. Save to GitHub
      await uploadFileToGitHub(
        'src/data/projects.json',
        JSON.stringify(projects, null, 2),
        `Update likes for project ${projectId}`
      );

    } catch (error) {
      console.error("Error updating likes:", error);
      // Revert optimistic update on error
      setLikes(likes);
      setIsLiked(isLiked);
      toast({
        title: "Fehler",
        description: "Like konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size={size}
      onClick={handleLike}
      disabled={isLoading}
      className="gap-2 transition-all duration-300"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={`w-4 h-4 ${isLiked ? "fill-current scale-110" : "scale-100"}`} />
      )}
      <span>{likes}</span>
    </Button>
  );
};

