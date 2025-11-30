import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/use-session';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Plus, Upload, X } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type ProjectCategoryType = Database["public"]["Enums"]["project_category"];
type ProjectsUpdate = {
  title?: string;
  description?: string | null;
  category?: ProjectCategoryType | null;
  cover_image_url?: string | null;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Wiederverwendung der Validierungslogik aus ProjectUploadDialog.tsx
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

const ProjectEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading: sessionLoading } = useSession();
  const { toast } = useToast();

  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectCategory, setProjectCategory] = useState<ProjectCategoryType | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [existingMedia, setExistingMedia] = useState<any[]>([]); // TODO: Typisierung verbessern
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "design", label: "Design" },
    { value: "fotografie", label: "Fotografie" },
    { value: "illustration", label: "Illustration" },
    { value: "ui_ux", label: "UI/UX" },
    { value: "architektur", label: "Architektur" },
    { value: "produktdesign", label: "Produktdesign" },
    { value: "video", label: "Video" },
    { value: "ai_ki", label:"AI/KI"},
  ];

  useEffect(() => {
    if (!sessionLoading && !session) {
      toast({
        title: "Nicht authentifiziert",
        description: "Bitte melden Sie sich an, um Projekte zu bearbeiten.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (id && session?.user?.id) {
      const fetchProject = async () => {
        const { data: projectData, error: projectError } = await (supabase as any)
          .from('projects')
          .select('*')
          .eq('id', id)
          .eq('user_id', session.user.id) // Sicherstellen, dass nur eigene Projekte bearbeitet werden können
          .single();

        if (projectError || !projectData) {
          console.error('Fehler beim Laden des Projekts:', projectError?.message);
          toast({
            title: "Fehler",
            description: "Projekt konnte nicht geladen werden oder Sie sind nicht berechtigt, es zu bearbeiten.",
            variant: "destructive",
          });
          navigate('/admin'); // Oder eine andere geeignete Seite
          return;
        }

        setProjectTitle(projectData.title || '');
        setProjectDescription(projectData.description || '');
        setProjectCategory(projectData.category || null);
        setCoverImageUrl(projectData.cover_image_url || '');

        const { data: mediaData, error: mediaError } = await supabase
          .from('project_media')
          .select('*')
          .eq('project_id', id)
          .order('order_index', { ascending: true });

        if (mediaError) {
          console.error('Fehler beim Laden der Projektmedien:', mediaError.message);
          toast({
            title: "Fehler",
            description: "Projektmedien konnten nicht geladen werden.",
            variant: "destructive",
          });
        }

        setExistingMedia(mediaData || []);
        setLoading(false);
      };
      fetchProject();
    } else if (!sessionLoading) {
      setLoading(false);
    }
  }, [id, session, sessionLoading, navigate, toast]);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCoverFile(e.target.files?.[0] || null);
  };

  const handleNewMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setNewMediaFiles([...newMediaFiles, ...validFiles]);
  };

  const removeExistingMedia = async (mediaId: string, mediaUrl: string) => {
    setIsSubmitting(true);
    try {
      // Request server to delete the object from R2 by URL
      const deleteRes = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: mediaUrl }),
      });

      const deleteData = await deleteRes.json().catch(() => ({}));
      if (!deleteRes.ok) {
        throw new Error(deleteData?.error || `Delete failed with status ${deleteRes.status}`);
      }

      const { error: dbError } = await supabase
        .from('project_media')
        .delete()
        .eq('id', mediaId);

      if (dbError) throw dbError;

      setExistingMedia(existingMedia.filter(media => media.id !== mediaId));
      toast({
        title: 'Erfolg',
        description: 'Medium erfolgreich entfernt.',
      });
    } catch (error) {
      console.error('Fehler beim Entfernen des Mediums:', error);
      toast({
        title: 'Fehler',
        description: `Medium konnte nicht entfernt werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: ProjectsUpdate = {
        title: projectTitle,
        description: projectDescription,
        category: projectCategory as ProjectCategoryType,
        cover_image_url: coverImageUrl,
      };

      const { error: projectError } = await (supabase as any)
        .from('projects')
        .update(payload)
        .eq('id', id)
        .eq('user_id', session?.user?.id);

      if (projectError) throw projectError;

      // Cover-Bild-Update (falls vorhanden)
      if (coverFile) {
        // Upload cover to server endpoint which stores it in R2
        const coverResp = await fetch('/api/upload', {
          method: 'POST',
          body: coverFile,
          headers: {
            'x-filename': coverFile.name,
            'Content-Type': coverFile.type || 'application/octet-stream',
          },
        });

        if (!coverResp.ok) {
          const txt = await coverResp.text();
          throw new Error(`Cover-Upload fehlgeschlagen: ${coverResp.status} ${txt}`);
        }

        const { url: newCoverUrl } = await coverResp.json();

        const { error: updateCoverError } = await supabase
          .from('projects')
          .update({ cover_image_url: newCoverUrl })
          .eq('id', id);

        if (updateCoverError) throw new Error(`Fehler beim Aktualisieren des Cover-Bilds: ${updateCoverError.message}`);

        setCoverImageUrl(newCoverUrl);
      }

      // Neue Medien hochladen
      if (newMediaFiles.length > 0) {
        const totalFiles = newMediaFiles.length;
        for (let i = 0; i < newMediaFiles.length; i++) {
          const file = newMediaFiles[i];

          // Upload file to server endpoint which stores it in R2
          const resp = await fetch('/api/upload', {
            method: 'POST',
            body: file,
            headers: {
              'x-filename': file.name,
              'Content-Type': file.type || 'application/octet-stream',
            },
          });

          if (!resp.ok) {
            const txt = await resp.text();
            throw new Error(`Upload von ${file.name} fehlgeschlagen: ${resp.status} ${txt}`);
          }

          const { url: publicUrl } = await resp.json();

          const mediaType = file.type.startsWith('video') ? 'video' : 'image';

          const { data: inserted, error: insertError } = await supabase
            .from('project_media')
            .insert({
              project_id: id,
              media_type: mediaType,
              media_url: publicUrl,
              order_index: existingMedia.length + i,
            })
            .select()
            .single();

          if (insertError) throw new Error(`Speicherung von ${file.name} fehlgeschlagen: ${insertError.message}`);

          // Sofort in UI anzeigen (ohne reload)
          setExistingMedia(prev => [...prev, inserted]);

          setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
        }
      }

      toast({
        title: "Erfolg",
        description: "Projekt erfolgreich gespeichert.",
      });
      navigate('/admin');
    } catch (error) {
      console.error('Fehler beim Speichern des Projekts:', error);
      toast({
        title: "Fehler",
        description: `Projekt konnte nicht gespeichert werden: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <div>Lädt...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Projekt bearbeiten</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700">
            Projekttitel
          </Label>
          <Input
            id="projectTitle"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
            Projektbeschreibung
          </Label>
          <Textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="projectCategory" className="block text-sm font-medium text-gray-700">
            Kategorie
          </Label>
          <Select onValueChange={(value: string) => setProjectCategory(value as ProjectCategoryType)} value={projectCategory ?? undefined}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Kategorie auswählen" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
            Projektcover
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              id="coverImage"
              accept="image/*"
              onChange={handleCoverFileChange}
              className="flex-1"
            />
            {coverFile && (
              <Button type="button" variant="outline" onClick={() => setCoverFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {coverImageUrl && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>Aktuelles Cover:</span>
              <a href={coverImageUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                {coverImageUrl.substring(coverImageUrl.lastIndexOf('/') + 1)}
              </a>
            </div>
          )}
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-500">
            Projektmedien
          </Label>
          <div className="mt-2 grid gap-4">
            {existingMedia.map((media) => (
              <div key={media.id} className="flex items-center justify-between p-4 rounded-md">
                <div className="flex items-center">
                  <img src={media.media_url} alt={media.media_url} className="h-10 w-20 object-cover rounded-md mr-2" />
                  <span className='text-red-500'>{media.media_url.substring(media.media_url.lastIndexOf('/') + 1)}</span>
                </div>
                <Button
                
                  size="sm"
                  onClick={() => removeExistingMedia(media.id, media.media_url)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                multiple
                onChange={handleNewMediaFilesChange}
                accept="image/*,video/*"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={() => setNewMediaFiles([])}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Speichern...
            </>
          ) : (
            "Projekt speichern"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ProjectEditPage;
