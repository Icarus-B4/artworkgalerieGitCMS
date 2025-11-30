import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";


interface LikeButtonProps {
  projectId: string;
  initialLikes: number;
  size?: "default" | "sm" | "lg";
}

export const LikeButton = ({ projectId, initialLikes, size = "default" }: LikeButtonProps) => {
  const [likes] = useState(initialLikes);
  const [isLiked] = useState(false);

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size={size}
      disabled={true}
      className="gap-2"
      title="Likes sind mit dem Git CMS nicht verfügbar"
    >
      <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      <span>{likes}</span>
    </Button>
  );
};

