import React from 'react';
import Card from './Card';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
          {user?.email?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-medium">{user?.email || 'User Email'}</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </button>
    </div>
  );
}

export default UserProfile;
