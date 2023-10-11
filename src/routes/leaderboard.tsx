import {
  useSupabaseClient,
  useUser,
} from "@supabase/auth-helpers-react";
import { PostgrestError } from "@supabase/supabase-js";
import { Database } from "../types/database.types";
import { useEffect, useState } from "react";

type LeaderboardRow = Database["public"]["Views"]["leaderboard"]["Row"];

const useLeaderboard = () => {
  const client = useSupabaseClient<Database>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [data, setData] = useState<Array<LeaderboardRow>>([]);

  useEffect(() => {
    client
      .from("leaderboard")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error);
        if (data) setData(data);
        setIsLoading(false);
      });
  }, [client]);

  return {
    data,
    isLoading,
    error,
  };
};

export function Leaderboard() {
  const { data, isLoading, error } = useLeaderboard();

  return (
    <div className="flex flex-col items-center w-screen h-screen pt-32 font-game">
      <h1 className="mb-4 text-6xl font-bold text-green-300">Leaderboard</h1>
      <div className="px-4 py-8 border-4 border-amber-900 bg-amber-600 w-600">
        {isLoading && (
          <div className="py-4 text-2xl text-center text-black bg-orange-300 border border-orange-800">
            Loading...
          </div>
        )}
        {error && (
          <div className="py-4 text-2xl text-center text-black bg-orange-300 border border-orange-800">
            Error occurred while loading the leaderboard.
          </div>
        )}

        <LeaderboardRows data={data} />
      </div>
    </div>
  );
}

function LeaderboardRows({ data }: { data: Array<LeaderboardRow> }) {
  const user = useUser();

  return data.map((row) => (
    <div
      key={row.user_id}
      className={`text-black  border border-orange-800  ${
        row.user_id === user?.id ? "bg-orange-200" : "bg-orange-300"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 text-lg font-bold text-center">
        <div className="mr-2">
          <img
            className="w-8 h-8 rounded-lg"
            src="https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
            alt=""
          />
        </div>
        <div className="mr-2">{row.email}</div>
        <div className="w-12 pt-2 pb-1 bg-orange-500">{row.highest_score}</div>
      </div>
    </div>
  ));
}
