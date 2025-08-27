import { Route, Routes } from "react-router";
import Layout from "@/layout.tsx";
import { Index } from "@/pages";
import { Login } from "@/pages/Auth/login-page.tsx";
import { ProtectedPages } from "@/pages/protected.tsx";

export function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedPages />}>
          <Route index element={<Index />} />
        </Route>

        <Route path="/login" element={<Login />} />
      </Route>
    </Routes>
  );
}
