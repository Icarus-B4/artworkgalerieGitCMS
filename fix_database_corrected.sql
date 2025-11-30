-- Erstelle project_media Tabelle falls sie nicht existiert
CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

-- Lösche bestehende Policies falls sie existieren
DROP POLICY IF EXISTS "Anyone can view project media" ON public.project_media;
DROP POLICY IF EXISTS "Admins can insert project media" ON public.project_media;
DROP POLICY IF EXISTS "Admins can update project media" ON public.project_media;
DROP POLICY IF EXISTS "Admins can delete project media" ON public.project_media;

-- RLS Policies für project_media
CREATE POLICY "Anyone can view project media"
  ON public.project_media
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert project media"
  ON public.project_media
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update project media"
  ON public.project_media
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete project media"
  ON public.project_media
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
