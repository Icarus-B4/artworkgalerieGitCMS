import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/hooks/use-session";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { Loader2 } from "lucide-react";

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: any;
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

  // Load comments from Firestore
  useEffect(() => {
    if (projectId.startsWith('demo-')) return;

    setLoading(true);
    const commentsRef = collection(db, "projects", projectId, "comments");
    const q = query(commentsRef, orderBy("created_at", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(loadedComments);
      setLoading(false);
    }, (error) => {
      console.error("Error loading comments:", error);
      setLoading(false);
    });

    return () => unsubscribe();
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
      // Cast user to any to avoid TS errors with the mock session adapter
      const user = session.user as any;

      const commentsRef = collection(db, "projects", projectId, "comments");
      await addDoc(commentsRef, {
        user_id: user.id,
        user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Admin",
        user_avatar: user.user_metadata?.avatar_url || null,
        content: newComment,
        created_at: serverTimestamp(),
      });

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
