import { GlobeIcon, Loader } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { login } from "@/api/clients/downloader";
import { useLoginStore } from "@/stores/login";
import { cn } from "@/lib/utils.ts";

function isValidArl(str: string) {
  return str.length !== 0;
}

export const DownloaderButtonState = () => {
  const [arl, setArl] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setARL } = useLoginStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check login status on mount
  useEffect(() => {
    const storedArl = localStorage.getItem("arl");
    if (storedArl) {
      setArl(storedArl);
      checkLoginStatus(storedArl);
    }
  }, []);

  const checkLoginStatus = async (arlValue: string) => {
    if (isValidArl(arlValue)) {
      setIsLoading(true);
      try {
        const result = await login(arlValue);
        setIsLoggedIn(result.status === 1);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleArlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setArl(value);
  };

  const handleLogin = async () => {
    if (isValidArl(arl)) {
      setIsLoading(true);
      try {
        const result = await login(arl);

        if (result.status === 1) {
          setIsLoggedIn(true);
          setARL(arl, true);
          console.log("Login successful");
          setOpen(false);
        } else {
          setIsLoggedIn(false);
          console.log("Login failed");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <Button disabled variant="ghost" size="icon">
        <Loader className="animate-spin" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="hover:cursor-pointer" asChild>
        <Button
          size="icon"
          variant="ghost"
          className={cn("relative", {
            "text-green-600 dark:text-green-300": isLoggedIn,
          })}
        >
          <GlobeIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Login</h4>
            <p className="text-muted-foreground text-sm">
              Please enter arl from deezer cookie here.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 gap-4">
              <Label htmlFor="width">ARL</Label>
              <Input
                id="width"
                className="col-span-2 h-8"
                placeholder="..."
                value={arl}
                onChange={handleArlChange}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              size="default"
              onClick={handleLogin}
              disabled={!isValidArl(arl)}
            >
              Submit
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
