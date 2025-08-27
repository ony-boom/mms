import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentProps, FormEventHandler } from "react";
import { Loader } from "lucide-react";

export function UpdateProfileForm({
  onSubmit,
  pending,
  error,
  className,
  defaultValues,
  ...props
}: UpdateProfileFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
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
              autoComplete="off"
              defaultValue={defaultValues?.username}
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">New password</Label>
            </div>
            <Input
              id="password"
              autoComplete="off"
              name="password"
              type="password"
            />
          </div>

          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Confirm password</Label>
            </div>
            <Input
              id="password"
              autoComplete="off"
              name="password-confirmation"
              type="password"
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
                <span>Update</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export type UpdateProfileFormProps = Omit<ComponentProps<"div">, "onSubmit"> & {
  pending?: boolean;
  error?: string;
  defaultValues?: {
    username: string;
  };
  onSubmit?: FormEventHandler<HTMLFormElement>;
};
