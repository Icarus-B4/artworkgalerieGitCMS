import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface CommentsSectionProps {
  projectId: string;
}

export const CommentsSection = ({ projectId }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Kommentare</h3>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Kommentare sind mit dem Git-basierten CMS nicht verfügbar.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmitComment} className="space-y-4 opacity-50 pointer-events-none">
        <Textarea
          placeholder="Kommentare sind deaktiviert..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
          disabled
        />
        <Button type="submit" disabled>
          Kommentar hinzufügen
        </Button>
      </form>
    </div>
  );
};
