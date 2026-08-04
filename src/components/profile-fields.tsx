import { COUNTRIES, dialFor } from "@/lib/countries";

export type ProfileDraft = {
  full_name: string;
  country: string;
  country_code: string;
  phone: string;
  attendee_type: "member" | "guest";
  cell_group: string;
};

export const emptyProfileDraft = (): ProfileDraft => ({
  full_name: "",
  country: "",
  country_code: "",
  phone: "",
  attendee_type: "guest",
  cell_group: "",
});

export const fieldClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm normal-case tracking-normal text-foreground outline-none focus:border-[color:var(--sage)]";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
      {label}
      {children}
    </label>
  );
}

/** Name, country + dial code, phone, member/guest and cell group. */
export function ProfileFields({
  draft,
  onChange,
}: {
  draft: ProfileDraft;
  onChange: (next: ProfileDraft) => void;
}) {
  return (
    <>
      <Field label="Full name">
        <input
          required
          value={draft.full_name}
          maxLength={120}
          onChange={(e) => onChange({ ...draft, full_name: e.target.value })}
          className={fieldClass}
        />
      </Field>

      <Field label="Country">
        <select
          required
          value={draft.country}
          onChange={(e) =>
            onChange({
              ...draft,
              country: e.target.value,
              country_code: dialFor(e.target.value),
            })
          }
          className={fieldClass}
        >
          <option value="">Select your country</option>
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.name}>
              {c.name} ({c.dial})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Phone number">
        <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3">
          <select
            required
            value={draft.country_code}
            onChange={(e) => onChange({ ...draft, country_code: e.target.value })}
            className={fieldClass}
          >
            <option value="">Code</option>
            {COUNTRIES.map((c) => (
              <option key={`${c.iso}-dial`} value={c.dial}>
                {c.iso} {c.dial}
              </option>
            ))}
          </select>
          <input
            required
            type="tel"
            inputMode="tel"
            placeholder="712 345 678"
            maxLength={24}
            value={draft.phone}
            onChange={(e) =>
              onChange({ ...draft, phone: e.target.value.replace(/[^\d\s-]/g, "") })
            }
            className={fieldClass}
          />
        </div>
      </Field>

      <Field label="Are you a member or a guest?">
        <div className="grid grid-cols-2 gap-3">
          {(["member", "guest"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ ...draft, attendee_type: type })}
              aria-pressed={draft.attendee_type === type}
              className={`rounded-2xl border px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                draft.attendee_type === type
                  ? "border-transparent bg-[color:var(--sage)] text-[color:var(--ink)]"
                  : "border-border text-muted-foreground hover:border-[color:var(--sage)]"
              }`}
            >
              {type === "member" ? "Church member" : "Guest"}
            </button>
          ))}
        </div>
      </Field>

      {draft.attendee_type === "member" && (
        <Field label="Your cell / cell group">
          <input
            required
            maxLength={120}
            placeholder="e.g. Grace Cell, Zone 3"
            value={draft.cell_group}
            onChange={(e) => onChange({ ...draft, cell_group: e.target.value })}
            className={fieldClass}
          />
        </Field>
      )}
    </>
  );
}