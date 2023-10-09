
export default function Root() {
  return (
      <div className="w-screen mx-auto text-center">
        <nav>
          <ul>
            <li>
              <a href={`/sign-in`}>Sign In</a>
            </li>
            <li>
              <a href={`/game`}>Play as a Guest</a>
            </li>
            <li>
              <a href={`/leaderboard`}>Leaderboard</a>
            </li>
          </ul>
        </nav>
      </div>
  );
}