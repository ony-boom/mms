import { Loader } from "lucide-react";

// TODO: Use skeleton loader
export function Loading() {
  return (
    <div className="flex w-full justify-center py-8">
      <Loader className="animate-spin" />
    </div>
  );
}
