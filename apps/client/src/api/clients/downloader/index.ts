import { postToServer } from "@/lib/api-utils";

export async function login(arl: string) {
  arl = arl.trim();
  const result = await postToServer("loginArl", { arl });

  return result;
}
