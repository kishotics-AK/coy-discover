
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export interface Profile {
  id: number;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  college: string | null;
  interests: string[];
}

export async function getFeed(): Promise<Profile[]> {
  const response = await api.get("/feed");
  return response.data.profiles;
}

export async function getMatches(): Promise<Profile[]> {
  const response = await api.get("/matches");
  return response.data.matches;
}

export async function submitSwipe(
  targetUserId: number,
  action: "LIKE" | "PASS"
) {
  const response = await api.post("/swipe", {
    targetUserId,
    action,
  });

  return response.data as {
    success: boolean;
    isMatch: boolean;
    matchedProfile?: Profile;
  };
}
