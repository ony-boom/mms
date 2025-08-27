import { useApiClient } from "@/hooks/use-api-client.ts";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog.tsx";
import { ComponentProps } from "react";
import { Button } from "@/components/ui/button.tsx";

export function LogoutDialog(props: LogoutProps) {
  const { useLogout } = useApiClient();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: logoutMutation } = useLogout();

  const handleLogout = () => {
    queryClient.removeQueries();
    logoutMutation(undefined, {
      onSuccess: () => {
        navigate("/login", {
          replace: true,
        });
      },
    });
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to logout?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will log you out of your account
            and remove your session.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={handleLogout}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type LogoutProps = ComponentProps<typeof Dialog>;
