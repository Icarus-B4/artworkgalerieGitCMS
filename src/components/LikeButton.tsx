import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, onSnapshot, setDoc, getDoc } from "firebase/firestore";

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

  // Real-time listener for likes
  useEffect(() => {
    if (projectId.startsWith("demo-")) return;

    const projectRef = doc(db, "projects", projectId);
    const unsubscribe = onSnapshot(projectRef, (doc) => {
      if (doc.exists()) {
        setLikes(doc.data().likes || 0);
      }
    });

    // Check local storage for liked status
    const likedProjects = JSON.parse(localStorage.getItem("liked_projects") || "[]");
    if (likedProjects.includes(projectId)) {
      setIsLiked(true);
    }

    return () => unsubscribe();
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

    setIsLoading(true);
    const newIsLiked = !isLiked;

    try {
      const projectRef = doc(db, "projects", projectId);
      const projectDoc = await getDoc(projectRef);

      if (!projectDoc.exists()) {
        // Create document if it doesn't exist
        await setDoc(projectRef, {
          likes: initialLikes + (newIsLiked ? 1 : 0),
          id: projectId
        });
      } else {
        // Update existing document
        await updateDoc(projectRef, {
          likes: increment(newIsLiked ? 1 : -1)
        });
      }

      // Update local storage
      const likedProjects = JSON.parse(localStorage.getItem("liked_projects") || "[]");
      if (newIsLiked) {
        localStorage.setItem("liked_projects", JSON.stringify([...likedProjects, projectId]));
      } else {
        localStorage.setItem("liked_projects", JSON.stringify(likedProjects.filter((id: string) => id !== projectId)));
      }

      setIsLiked(newIsLiked);
    } catch (error) {
      console.error("Error updating likes:", error);
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

