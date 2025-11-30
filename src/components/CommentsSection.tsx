import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2 } from "lucide-react";

interface CommentsSectionProps {
  projectId: string;
}

export const CommentsSection = ({ projectId }: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: comments = [], refetch } = useQuery({
    queryKey: ["comments", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_comments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            profiles: profile,
          };
        })
      );

      return commentsWithProfiles;
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um zu kommentieren",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("project_comments")
        .insert({
          project_id: projectId,
          user_id: session.user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      refetch();
      toast({
        title: "Erfolg",
        description: "Kommentar wurde hinzugefügt",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht hinzugefügt werden",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("project_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      refetch();
      toast({
        title: "Erfolg",
        description: "Kommentar wurde gelöscht",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const canDeleteComment = async (commentUserId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .maybeSingle();

    return session.user.id === commentUserId || !!roles;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Kommentare ({comments.length})</h3>

      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea
          placeholder="Schreiben Sie einen Kommentar..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
        />
        <Button type="submit" disabled={submitting || !newComment.trim()}>
          {submitting ? "Wird gesendet..." : "Kommentar hinzufügen"}
        </Button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage
                    src={
                      comment.profiles?.avatar_url ||
                      `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(
                        comment.user_id || comment.profiles?.display_name || "guest"
                      )}`
                    }
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  <AvatarFallback>
                    {comment.profiles?.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {comment.profiles?.display_name || "Anonymer Nutzer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const canDelete = await canDeleteComment(comment.user_id);
                        if (canDelete) {
                          handleDeleteComment(comment.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-foreground">{comment.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
