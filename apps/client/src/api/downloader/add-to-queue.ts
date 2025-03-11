import { useMutation } from "@tanstack/react-query";
import { postToServer } from "./utils";

export const useAddToQueue = (url: string) => {
  const { mutate, isError, error, isPending } = useMutation({
    mutationFn: async () => {
      return await postToServer("addToQueue", { url });
    },
    onError: (error) => {
      console.error("Error adding to queue:", error);
    },
    
  });

  const addToQueue = () => {
    if (!url) return;
    mutate();
  };

  return { addToQueue, isPending, isError, error };
};
