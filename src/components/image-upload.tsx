import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

/** Admin-only image picker: uploads to the media bucket and returns a stable URL. */
export function ImageUpload({
  value,
  onChange,
  folder,
  label = "Image",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Images need to be under 8 MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${folder}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;
      const { data, error: signError } = await supabase.storage
        .from("media")
        .createSignedUrl(path, TEN_YEARS);
      if (signError || !data) throw signError ?? new Error("Could not link the image");
      onChange(data.signedUrl);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="grid gap-3">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-4">
        <div className="h-20 w-32 shrink-0 overflow-hidden rounded-2xl border border-border bg-background">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[image:var(--gradient-ember)] opacity-40" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-border px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] disabled:opacity-50"
          >
            {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full border border-destructive/50 px-5 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-destructive"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}