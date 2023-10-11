import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../types/database.types";

export async function getUserHighScore({
  client,
  userId,
}: {
  client: SupabaseClient<Database>;
  userId: string;
}) {
  const { data } = await client
    .from("scores")
    .select("score")
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(1);

  return data?.[0]?.score ?? 0;
}

export async function saveScoreInDB({
  client,
  userId,
  score,
}: {
  client: SupabaseClient<Database>;
  userId: string;
  score: number;
}) {
  const { error } = await client
    .from("scores")
    .insert({ user_id: userId, score });
  if (error) {
    console.log("Error updating highest score", error);
  }
}

export function playDieSound() {
  const audio = new Audio("/die.mp3");
  audio.play();
}

export function playHighSound() {
  const audio = new Audio("/high.mp3");
  audio.play();
}

export function playLowSound() {
  const audio = new Audio("/low.mp3");
  audio.play();
}