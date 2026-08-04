REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;