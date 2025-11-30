import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/hooks/use-session";

interface LikeButtonProps {
  projectId: string;
  initialLikes: number;
  size?: "default" | "sm" | "lg";
}

export const LikeButton = ({ projectId, initialLikes, size = "default" }: LikeButtonProps) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useSession();

  useEffect(() => {
    const checkIfLiked = async () => {
      if (!session) return;

      const { data } = await supabase
        .from("project_likes")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", session.user.id)
        .maybeSingle();

      setIsLiked(!!data);
    };
    checkIfLiked();
  }, [projectId, session?.user?.id]);

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um Projekte zu liken",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("project_likes")
          .delete()
          .eq("project_id", projectId)
          .eq("user_id", session.user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikes(likes - 1);
      } else {
        // Like
        const { error } = await supabase
          .from("project_likes")
          .insert({ project_id: projectId, user_id: session.user.id });

        if (error) throw error;
        setIsLiked(true);
        setLikes(likes + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Fehler",
        description: "Like konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size={size}
      onClick={handleLike}
      disabled={loading}
      className="gap-2"
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likes}</span>
    </Button>
  );
};
