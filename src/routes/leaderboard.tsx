export function Leaderboard() {
  return (
    <div>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Your Name</td>
            <td>100</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Your Friend</td>
            <td>50</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}