-- Create a secure function to increment project views
-- This function can be called by anyone (including anonymous users)
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.projects
  SET views = views + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to everyone (including anonymous users)
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_project_views(UUID) TO authenticated;
