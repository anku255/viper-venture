import { useSessionContext } from "@supabase/auth-helpers-react";

export default function Root() {
  const { isLoading, session } = useSessionContext();

  if (isLoading) return null;

  return (
    <div className="relative flex items-center justify-center h-screen text-2xl text-center font-game">
      <div className="space-y-6">
        <h1 className="text-6xl font-bold text-green-300">Snake Game</h1>
        <div className="flex flex-col items-center">
          <Button href={`/game`}>Play</Button>
          {!session && <Button href={`/sign-in`}>Sign In</Button>}
          <Button href={`/leaderboard`}>Leaderboard</Button>
        </div>
      </div>
    </div>
  );
}

const Button = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => (
  <a
    className="box-border w-64 py-2 mb-4 text-white bg-green-600 rounded-lg -skew-x-20 hover:bg-green-700 hover:text-white hover:outline-2 hover:outline-indigo-50"
    href={href}
  >
    {children}
  </a>
);
