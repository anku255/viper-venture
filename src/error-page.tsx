import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const routeError = error as { statusText: string; message: string };

  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{routeError.statusText || routeError.message}</i>
      </p>
    </div>
  );
}
