import React from 'react';
import Navbar from './components/Navbar';

function Menu() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Menu Page</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p>This is the menu content.</p>
        </div>
      </div>
    </div>
  );
}

export default Menu;
