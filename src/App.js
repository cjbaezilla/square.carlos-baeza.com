import React from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12">
      <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
        <div className="absolute top-4 right-4">
          <SignedIn>
            {/* Mount UserButton component only if user is signed in */}
            <UserButton />
          </SignedIn>
          <SignedOut>
            {/* Mount sign in button only if user is signed out */}
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome to My React App
        </h1>
        
        <SignedIn>
          <p className="text-gray-600 text-center mb-6">
            You are signed in! This content is only visible to authenticated users.
          </p>
        </SignedIn>
        
        <SignedOut>
          <p className="text-gray-600 text-center mb-6">
            This app is built with React, Tailwind CSS, and Clerk authentication.
          </p>
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}

export default App;
