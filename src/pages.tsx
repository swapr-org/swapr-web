export function HomePage() {
  return (
    <>
      <h1>Home</h1>
      <p>Browse nearby items and trade your own for them.</p>
    </>
  );
}

export function ConfigError() {
  return (
    <div className="config-error">
      <h1>Configuration error</h1>
      <p>The app could not load its configuration. Try reloading the page.</p>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>There is nothing at this address.</p>
    </>
  );
}
