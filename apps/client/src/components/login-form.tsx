import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentProps, FormEventHandler } from "react";
import { Loader } from "lucide-react";

export function LoginForm({
  onSubmit,
  pending,
  error,
  className,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your username below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && <p className="text-destructive">{error}</p>}
          <form onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="username"
                  name="username"
                  placeholder="Jhon Doe"
                  required
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  autoComplete="off"
                  name="password"
                  type="password"
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  disabled={pending === true}
                  type="submit"
                  className="w-full"
                >
                  {pending ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <span>Login</span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export type LoginFormProps = Omit<ComponentProps<"div">, "onSubmit"> & {
  pending?: boolean;
  error?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
};
