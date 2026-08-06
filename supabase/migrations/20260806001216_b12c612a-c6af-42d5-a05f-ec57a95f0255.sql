ALTER TABLE public.live_stream_sources
  ADD COLUMN IF NOT EXISTS private_token text,
  ADD COLUMN IF NOT EXISTS mux_stream_id text,
  ADD COLUMN IF NOT EXISTS mux_playback_id text,
  ADD COLUMN IF NOT EXISTS mux_stream_key text;

UPDATE public.live_stream_sources
  SET private_token = encode(gen_random_bytes(12), 'hex')
  WHERE private_token IS NULL;

CREATE TABLE IF NOT EXISTS public.notified_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  ref_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, ref_id)
);

GRANT ALL ON public.notified_content TO service_role;

ALTER TABLE public.notified_content ENABLE ROW LEVEL SECURITY;