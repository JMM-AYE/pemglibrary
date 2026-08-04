export type Profile = {
  id: string;
  full_name: string;
  email: string;
  country: string;
  country_code: string;
  phone: string;
  attendee_type: "member" | "guest";
  cell_group: string;
};

export function isProfileComplete(profile: Profile | null | undefined) {
  if (!profile) return false;
  return Boolean(profile.full_name && profile.country && profile.phone);
}