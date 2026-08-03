CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'Gathering',
  starts_at timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  cta text NOT NULL DEFAULT 'Find out more',
  href text NOT NULL DEFAULT '',
  image_url text,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are viewable by everyone"
ON public.events FOR SELECT TO anon, authenticated
USING (published = true);

CREATE POLICY "Admins can view all events"
ON public.events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.events (slug, title, kind, starts_at, location, summary, cta, href) VALUES
('healing-streams-live-healing-services', 'Healing Streams Live Healing Services', 'Global broadcast', '2026-08-14T18:00:00Z', 'Streaming worldwide', 'Three days of healing ministration broadcast to every continent. Register your viewing centre and invite the sick and afflicted around you.', 'Register a centre', 'https://www.healingstreams.tv/'),
('rhapsody-partners-monthly-prayer', 'Rhapsody Partners'' Monthly Prayer', 'Prayer meeting', '2026-08-21T17:00:00Z', 'Online · PEMG Prayer Room', 'An hour of focused intercession for the distribution of the daily devotional into every home, school and prison.', 'Join the prayer', 'https://rhapsodyofrealities.org/'),
('higher-life-conference', 'The Higher Life Conference', 'Conference', '2026-09-04T09:00:00Z', 'Abuja Zone 1 Auditorium', 'Two days of teaching with Pastor Enoch on living from above — sessions on the Word, prayer and the ministry of the Spirit.', 'Reserve a seat', 'mailto:info@pemglibrary.org?subject=Higher%20Life%20Conference'),
('midweek-word-clinic', 'Midweek Word Clinic', 'Weekly · Wednesdays', '2026-08-05T18:30:00Z', 'Live on the PEMG channel', 'A live teaching and Q&A session that unpacks the message of the week and the current devotional theme.', 'Set a reminder', 'https://www.youtube.com/channel/UCrQeaCXWuaUa3pgAjvdUqnw');