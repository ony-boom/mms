import { postToServer } from "./utils";

export async function login(arl: string) {
  arl = arl.trim();
  return await postToServer("loginArl", { arl });
}
