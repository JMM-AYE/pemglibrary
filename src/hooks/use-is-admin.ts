import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getIsAdmin } from "@/lib/events.functions";
import { useSession } from "./use-session";

/** True only when the signed-in account actually holds the admin role. */
export function useIsAdmin() {
  const { status } = useSession();
  const isAdminFn = useServerFn(getIsAdmin);
  const query = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => isAdminFn({}),
    enabled: status === "in",
    staleTime: 1000 * 60 * 5,
  });
  return { isAdmin: status === "in" && query.data === true, loading: query.isLoading };
}