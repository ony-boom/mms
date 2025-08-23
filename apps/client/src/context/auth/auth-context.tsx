import { User } from "@/api/types.ts";
import { createContext } from "react";

export type TAuthContext = {
  user?: User;
  loading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
};

export const AuthContext = createContext<TAuthContext>({
  setUser: () => {},
  loading: false,
  isAuthenticated: false,
});
