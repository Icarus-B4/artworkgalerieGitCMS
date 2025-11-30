import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { fetchFileFromGitHub, uploadFileToGitHub } from "@/lib/github";
import { Loader2 } from "lucide-react";

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
}

interface CommentsSectionProps {
  projectId: string;
}

export const CommentsSection = ({ projectId }: CommentsSectionProps) => {
  const { session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments from GitHub
  useEffect(() => {
    const loadComments = async () => {
      if (projectId.startsWith('demo-')) return; // No comments for demo projects

      setLoading(true);
      try {
        const file = await fetchFileFromGitHub('src/data/projects.json');
        if (file) {
          const projects = JSON.parse(file.content);
          const project = projects.find((p: any) => p.id === projectId);
          if (project && project.comments) {
            setComments(project.comments);
          }
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [projectId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Bitte melden Sie sich an, um zu kommentieren.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      // 1. Fetch latest projects data
      const file = await fetchFileFromGitHub('src/data/projects.json');
      if (!file) throw new Error("Could not load projects data");

      const projects = JSON.parse(file.content);
      const projectIndex = projects.findIndex((p: any) => p.id === projectId);

      if (projectIndex === -1) throw new Error("Project not found");

      // 2. Create new comment
      // Cast user to any to avoid TS errors with the mock session adapter
      const user = session.user as any;
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin",
        user_avatar: user.user_metadata?.avatar_url,
        content: newComment,
        created_at: new Date().toISOString(),
      };

      // 3. Update project comments
      if (!projects[projectIndex].comments) {
        projects[projectIndex].comments = [];
      }
      projects[projectIndex].comments.unshift(comment);

      // 4. Save to GitHub
      await uploadFileToGitHub(
        'src/data/projects.json',
        JSON.stringify(projects, null, 2),
        `Add comment to project ${projectId}`
      );

      // 5. Update local state
      setComments([comment, ...comments]);
      setNewComment("");
      toast({
        title: "Kommentar gesendet",
        description: "Ihr Kommentar wurde erfolgreich hinzugefügt.",
      });
    } catch (error: any) {
      console.error("Error posting comment:", error);
      toast({
        title: "Fehler",
        description: "Kommentar konnte nicht gesendet werden.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (projectId.startsWith('demo-')) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Kommentare</h3>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Kommentare sind für Demo-Projekte deaktiviert.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Kommentare ({comments.length})</h3>

      {session ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Schreiben Sie einen Kommentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting || !newComment.trim()}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kommentar hinzufügen
          </Button>
        </form>
      ) : (
        <Card>
          <CardContent className="pt-6 bg-muted/50">
            <p className="text-center text-muted-foreground">
              Bitte melden Sie sich an, um zu kommentieren.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarImage src={comment.user_avatar} />
                    <AvatarFallback>{comment.user_name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{comment.user_name}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground text-center py-8">
            Noch keine Kommentare. Seien Sie der Erste!
          </p>
        )}
      </div>
    </div>
  );
};
