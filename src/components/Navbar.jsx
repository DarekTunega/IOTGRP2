import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfile from './UserProfile';

function Navbar() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed start-0 top-0 bottom-0 z-50 flex h-full w-80 flex-col overflow-auto bg-slate-50 shadow-md transition-transform duration-500 ease-out lg:w-64 lg:translate-x-0">
      <div className="flex h-20 w-full flex-none items-center justify-between px-8 border-b">
        <h2 className="text-xl text-indigo-900 font-bold">CO2 Monitor</h2>
      </div>
      <div className="flex flex-col flex-1">
        <ul className="w-full space-y-1.5 px-8 py-4">
          <li>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-900 transition w-full"
            >
              <span>Home</span>
            </Link>
          </li>

          {/* Only show these links if user is logged in */}
          {isLoggedIn && (
            <>
              <li>
                <Link
                  to="/buildings"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-900 transition w-full"
                >
                  <span>Buildings</span>
                </Link>
              </li>
            </>
          )}
        </ul>
        <div className="mt-auto">
          <ul className="w-full space-y-1.5 px-8 py-4 border-t">
            {!isLoggedIn && (
              <>
                <li>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-900 w-full"
                  >
                    <span>Login</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-indigo-100 hover:text-indigo-900 w-full"
                  >
                    <span>Register</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* User Profile at the bottom */}
      {isLoggedIn && (
        <div className="border-t p-4">
          <UserProfile />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
