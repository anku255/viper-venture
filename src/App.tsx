import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Root from "./routes/root";
import ErrorPage from "./error-page";
import { Game } from './routes/game';
import { Leaderboard } from './routes/leaderboard';
import { SignIn } from './routes/sign-in';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />
  },
  {
    path: "sign-in",
    element: <SignIn />,
  },
  {
    path: "game",
    element: <Game />,
  },
  {
    path: "leaderboard",
    element: <Leaderboard />
  }
]);


export function App() {
  return <RouterProvider router={router} />
}