import { AuthContext } from "./auth-context.tsx";
import { ReactNode, useEffect, useState } from "react";
import { User } from "@/api/types.ts";
import { useApiClient } from "@/hooks/use-api-client.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>();
  const { usePing } = useApiClient();
  const { data, isPending } = usePing();

  useEffect(() => {
    if (data?.isAuthenticated && data.user) {
      setUser(data.user);
    } else if (data && !data.isAuthenticated) {
      setUser(undefined);
    }
  }, [data]);


  const contextValue = {
    user,
    setUser,
    loading: isPending,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
