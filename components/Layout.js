// components/Layout.js
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, role, signOut } = useAuth();

  return (
    <div className="app-root">
      <header className="navbar">
        <div className="navbar-left">
          <span className="logo">Evolene Official Replica</span>
        </div>
        <div className="navbar-right">
          <Link href="/"><span>Shop</span></Link>
          {role === 'admin' && (
            <Link href="/admin">
              <span>Admin Dashboard</span>
            </Link>
          )}
          {!user && (
            <>
              <Link href="/login"><span>Login</span></Link>
              <Link href="/signup"><span>Sign Up</span></Link>
            </>
          )}
          {user && (
            <button onClick={signOut} className="btn-link">
              Logout
            </button>
          )}
        </div>
      </header>
      <main className="main-container">{children}</main>
      <footer className="footer">
        <small>© {new Date().getFullYear()} Evolene Official Replica</small>
      </footer>
    </div>
  );
}
