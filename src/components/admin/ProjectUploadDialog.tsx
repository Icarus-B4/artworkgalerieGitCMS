import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, Upload, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useSession } from "@/hooks/use-session";

interface ProjectUploadDialogProps {
  onProjectCreated: () => void;
}

export const ProjectUploadDialog = ({ onProjectCreated }: ProjectUploadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();
  const { session } = useSession();

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const categories = [
    { value: "design", label: "Design" },
    { value: "fotografie", label: "Fotografie" },
    { value: "illustration", label: "Illustration" },
    { value: "ui_ux", label: "UI/UX" },
    { value: "architektur", label: "Architektur" },
    { value: "produktdesign", label: "Produktdesign" },
    { value: "video", label: "Video" },
    { value: "ai_ki", label: "AI/KI" },
  ];

  const validateFile = (file: File, isCover: boolean = false): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Datei ist zu groß. Maximum: ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`;
    }

    if (isCover) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return "Nur Bilddateien (JPEG, PNG, GIF, WebP) sind als Cover erlaubt";
      }
    } else {
      const isVideo = file.type.startsWith("video");
      const isImage = file.type.startsWith("image");

      if (isVideo && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return "Nur MP4, WebM, OGG, MOV und AVI Videos sind erlaubt";
      }

      if (isImage && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return "Nur JPEG, PNG, GIF und WebP Bilder sind erlaubt";
      }

      if (!isVideo && !isImage) {
        return "Nur Bild- und Videodateien sind erlaubt";
      }
    }

    return null;
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !category || !coverFile) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    // Validate cover file
    const coverValidation = validateFile(coverFile, true);
    if (coverValidation) {
      toast({
        title: "Fehler",
        description: coverValidation,
        variant: "destructive",
      });
      return;
    }

    // Validate media files
    for (const file of mediaFiles) {
      const validation = validateFile(file);
      if (validation) {
        toast({
          title: "Fehler",
          description: validation,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const timestamp = Date.now();
      const projectId = `project-${timestamp}`;
      const userId = session?.user?.uid || "anonymous";

      // 1. Upload Cover Image
      const coverExt = coverFile.name.split('.').pop();
      const coverPath = `projects/${projectId}/cover.${coverExt}`;
      const coverUrl = await uploadFile(coverFile, coverPath);

      setUploadProgress(Math.round((1 / (mediaFiles.length + 1)) * 100));

      // 2. Upload Media Files
      const mediaUrls = [];
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        const ext = file.name.split('.').pop();
        const path = `projects/${projectId}/media-${i}.${ext}`;
        const url = await uploadFile(file, path);

        mediaUrls.push({
          url: url,
          type: file.type.startsWith('video') ? 'video' : 'image'
        });

        setUploadProgress(Math.round(((i + 2) / (mediaFiles.length + 1)) * 100));
      }

      // 3. Save to Firestore
      await setDoc(doc(db, "projects", projectId), {
        id: projectId,
        title,
        description,
        category,
        cover_image_url: coverUrl,
        created_at: new Date().toISOString(),
        user_id: userId,
        likes: 0,
        views: 0,
        media: mediaUrls,
        updated_at: serverTimestamp()
      });

      toast({
        title: "Erfolg",
        description: "Projekt wurde erfolgreich erstellt.",
      });

      setOpen(false);
      resetForm();
      onProjectCreated();
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Fehler",
        description: `Projekt konnte nicht erstellt werden: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setCoverFile(null);
    setMediaFiles([]);
    setUploadProgress(0);
  };

  const removeMediaFile = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Neues Projekt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Neues Projekt erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Projekttitel eingeben"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Kategorie *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Projektbeschreibung eingeben"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="cover">Cover-Bild *</Label>
            <div className="mt-2">
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                required
              />
              {coverFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  {coverFile.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="media">Weitere Medien (Bilder/Videos)</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Max. 50MB pro Datei. Erlaubte Formate: MP4, WebM, OGG, MOV, AVI, JPEG, PNG, GIF, WebP
            </p>
            <div className="mt-2">
              <Input
                id="media"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const validFiles: File[] = [];
                  const errors: string[] = [];

                  files.forEach(file => {
                    const validation = validateFile(file);
                    if (validation) {
                      errors.push(`${file.name}: ${validation}`);
                    } else {
                      validFiles.push(file);
                    }
                  });

                  if (errors.length > 0) {
                    toast({
                      title: "Datei-Validierung",
                      description: errors.join(", "),
                      variant: "destructive",
                    });
                  }

                  setMediaFiles([...mediaFiles, ...validFiles]);
                }}
              />
              {mediaFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {mediaFiles.map((file, index) => {
                    const isVideo = file.type.startsWith("video");
                    const fileSize = Math.round(file.size / (1024 * 1024));
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({fileSize}MB, {isVideo ? "Video" : "Bild"})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMediaFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {loading && uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Upload-Fortschritt: {uploadProgress}%
                </span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Wird hochgeladen...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Projekt erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
