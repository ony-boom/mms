import { LoginForm } from "@/components/login-form";
import { FormEventHandler } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useApiClient } from "@/hooks/use-api-client";
import { Navigate, useNavigate } from "react-router";
import { Loader } from "lucide-react";

export function Login() {
  const { setUser } = useAuth();
  const { useLogin, usePing } = useApiClient();
  const navigate = useNavigate();

  const { isPending: loadingAuthData, data } = usePing();
  const { mutate, isPending, error } = useLogin();

  const handleLogin: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = data.get("username") as string;
    const password = data.get("password") as string;

    mutate(
      {
        username,
        password,
      },
      {
        onSuccess: (data) => {
          setUser(data);
          navigate("/");
        },
      },
    );
  };

  if (data?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="grid h-dvh place-items-center px-4">
      {loadingAuthData ? (
        <Loader className="animate-spin" />
      ) : (
        <LoginForm
          pending={isPending}
          error={error?.message}
          className="w-full max-w-md"
          onSubmit={handleLogin}
        />
      )}
    </div>
  );
}
