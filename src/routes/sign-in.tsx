export function SignIn() {
  return (
    <div>
      <h1>Sign In</h1>
      <form method="post">
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}