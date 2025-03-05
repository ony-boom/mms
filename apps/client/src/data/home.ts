import { fetchData } from "@/lib/api-utils";

let homeData = {};

let cached = false;

export async function getHomeData() {
  if (cached) {
    return homeData;
  } else {
    const data = await fetchData("getHome");

    homeData = data;
    cached = true;

    return data;
  }
}
