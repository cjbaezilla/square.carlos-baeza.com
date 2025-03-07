import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome to My React App
        </h1>
        <p className="text-gray-600 text-center mb-6">
          This app is built with React and Tailwind CSS for a shared hosting environment.
        </p>
        <div className="flex justify-center">
          <a
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Learn React
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
