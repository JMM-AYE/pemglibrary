-- 1. Lock down internal SECURITY DEFINER / trigger functions from direct API calls
REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. live_stream_sources: sensitive credentials, backend/admin only
REVOKE ALL ON public.live_stream_sources FROM anon, authenticated;
GRANT ALL ON public.live_stream_sources TO service_role;
ALTER TABLE public.live_stream_sources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage stream sources" ON public.live_stream_sources;
CREATE POLICY "Admins manage stream sources"
  ON public.live_stream_sources FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. notified_content: internal ledger, service role only
REVOKE ALL ON public.notified_content FROM anon, authenticated;
GRANT ALL ON public.notified_content TO service_role;
ALTER TABLE public.notified_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No client access to notified content" ON public.notified_content;
CREATE POLICY "No client access to notified content"
  ON public.notified_content FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- 4. user_roles: only admins may assign/modify/remove roles
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;