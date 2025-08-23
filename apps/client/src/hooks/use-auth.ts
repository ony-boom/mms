import { useContext } from "react";
import { AuthContext } from "@/context/auth/auth-context.tsx";

export const useAuth = () => {
  return useContext(AuthContext);
};
