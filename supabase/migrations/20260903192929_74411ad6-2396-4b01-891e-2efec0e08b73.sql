CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  )
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

-- events
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events FOR SELECT TO authenticated USING (public.is_admin());

-- live_streams
DROP POLICY IF EXISTS "Admins can delete streams" ON public.live_streams;
CREATE POLICY "Admins can delete streams" ON public.live_streams FOR DELETE TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert streams" ON public.live_streams;
CREATE POLICY "Admins can insert streams" ON public.live_streams FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update streams" ON public.live_streams;
CREATE POLICY "Admins can update streams" ON public.live_streams FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can view all streams" ON public.live_streams;
CREATE POLICY "Admins can view all streams" ON public.live_streams FOR SELECT TO authenticated USING (public.is_admin());

-- live_stream_sources
DROP POLICY IF EXISTS "Admins manage stream sources" ON public.live_stream_sources;
CREATE POLICY "Admins manage stream sources" ON public.live_stream_sources FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.is_admin());

-- lock down the elevated-privilege helper
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, PUBLIC;