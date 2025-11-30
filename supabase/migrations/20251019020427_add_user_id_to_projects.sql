-- Fügen Sie eine user_id-Spalte zur projects-Tabelle hinzu, um den Ersteller des Projekts zu speichern
ALTER TABLE public.projects ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Optional: Setzen Sie den user_id für bestehende Projekte auf einen Standardwert oder null
-- Dies ist wichtig, wenn Sie bereits Projekte in der Datenbank haben
-- Beispiel: UPDATE public.projects SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
-- Oder: UPDATE public.projects SET user_id = null WHERE user_id IS NULL;
