import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SettingsDialog } from "@/components/settings/settings-dilog.tsx";
import { LogoutDialog } from "./logout-dialog.tsx";
import { ProfileDialog } from "./profile-dialog.tsx";

export function UserMenu() {
  const [openSettings, setOpenSettings] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  const handleOpenSettingsChange = (open: boolean) => {
    setOpenSettings(open);
  };

  const handleOpenProfileChange = (open: boolean) => {
    setOpenProfile(open);
  };

  const handleOpenLogoutChange = (open: boolean) => {
    setOpenLogout(open);
  };

  const handleSettingsButtonClick = () => {
    handleOpenSettingsChange(true);
  };

  const handleProfileButtonClick = () => {
    handleOpenProfileChange(true);
  };

  const handleLogoutButtonClick = () => {
    setOpenLogout(true);
  };

  return (
    <>
      <SettingsDialog
        modal
        onOpenChange={handleOpenSettingsChange}
        open={openSettings}
      />

      <LogoutDialog open={openLogout} onOpenChange={handleOpenLogoutChange} />

      <ProfileDialog
        open={openProfile}
        onOpenChange={handleOpenProfileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <User />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleProfileButtonClick}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsButtonClick}>
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleLogoutButtonClick}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
