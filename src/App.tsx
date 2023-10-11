import { RouterProvider, createBrowserRouter } from "react-router-dom";
import {
  SessionContextProvider,
  useSessionContext,
  useSupabaseClient,
} from "@supabase/auth-helpers-react";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import { Game } from "./routes/game";
import { Leaderboard } from "./routes/leaderboard";
import { SignInPage } from "./routes/sign-in";
import { supabase } from "./auth/supabase";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "sign-in",
    element: <SignInPage />,
  },
  {
    path: "game",
    element: <Game />,
  },
  {
    path: "leaderboard",
    element: <Leaderboard />,
  },
]);

export function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <div className="relative w-screen min-h-screen bg-gradient-to-r from-green-900 to-black">
        <NavBar />
        <RouterProvider router={router} />
      </div>
    </SessionContextProvider>
  );
}

function NavBar() {
  const client = useSupabaseClient();
  const { session } = useSessionContext();

  return (
    <nav className="absolute z-10 flex right-4 top-4 font-game">
      <a className="mr-4 text-xl text-white hover:text-amber-400" href="/game">
        Game
      </a>
      <a
        className="mr-4 text-xl text-white hover:text-amber-400"
        href="/leaderboard"
      >
        Leaderboard
      </a>
      {session ? (
        <>
          <div className="mr-4 text-xl">{session.user.email}</div>
          <div
            className="cursor-pointer hover:text-amber-400"
            title="Logout"
            onClick={() => client.auth.signOut()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
          </div>
        </>
      ) : (
        <a
          className="mr-4 text-xl text-white hover:text-amber-400"
          href="/sign-in"
        >
          Sign In
        </a>
      )}
    </nav>
  );
}
