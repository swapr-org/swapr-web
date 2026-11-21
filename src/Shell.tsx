import { NavLink, Outlet } from 'react-router';
import { useConfig } from './config';

export default function Shell() {
  const { environment } = useConfig();

  return (
    <div className="shell">
      <header className="header">
        <span className="brand">swapr</span>
        {environment !== 'prod' && (
          <span className="badge" role="status" aria-label="Environment">
            {environment}
          </span>
        )}
        <nav className="nav">
          <NavLink to="/">Home</NavLink>
        </nav>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
