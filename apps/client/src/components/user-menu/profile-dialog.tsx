import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx";
import { ComponentProps, FormEventHandler, useState } from "react";
import { useAuth } from "@/hooks/use-auth.ts";
import { UpdateProfileForm } from "../update-profile-form";
import { useApiClient } from "@/hooks/use-api-client.ts";
import { useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY } from "@/api/constant.ts";
import { toast } from "sonner";

export function ProfileDialog(props: ProfileDialogProps) {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const { useUpdateProfile } = useApiClient();
  const [formError, setFormError] = useState<string>();

  const { mutate: updateProfile, isPending: isUpdatingProfile } =
    useUpdateProfile();

  if (!user) return null;

  const handleProfileUpdate: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    setFormError(undefined);
    const formData = new FormData(event.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const passwordConfirmation = formData.get(
      "password-confirmation",
    ) as string;

    if (password !== passwordConfirmation) {
      setFormError("Passwords do not match");
      return;
    }

    if (!confirm("Are you sure you want to update your profile?")) {
      return;
    }

    updateProfile(
      {
        id: user.id,
        username,
        password,
      },
      {
        onSuccess: async (data) => {
          setUser(data);
          await queryClient.invalidateQueries({ queryKey: [CACHE_KEY.PING] });
          toast.success("Profile updated successfully");
        },
      },
    );
  };

  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>Change your profile settings.</DialogDescription>
        </DialogHeader>

        <UpdateProfileForm
          className="mt-4"
          error={formError}
          pending={isUpdatingProfile}
          onSubmit={handleProfileUpdate}
          defaultValues={{ username: user.name }}
        />
      </DialogContent>
    </Dialog>
  );
}

export type ProfileDialogProps = ComponentProps<typeof Dialog>;
