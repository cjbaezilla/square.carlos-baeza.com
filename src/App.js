import React from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react';
import './App.css';

function App() {
  const { user, isLoaded, isSignedIn } = useUser();

  // Helper function to format JSON data
  const formatUserData = (data) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-12">
      <div className="max-w-3xl w-full px-6 py-8 bg-white shadow-md rounded-lg">
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
          <div className="text-gray-700 mb-6">
            <h2 className="text-2xl font-semibold mb-4">User Information</h2>
            
            {!isLoaded ? (
              <p>Loading user information...</p>
            ) : isSignedIn && user ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-4">
                  {user.imageUrl && (
                    <img 
                      src={user.imageUrl} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-medium">{user.fullName || 'No name provided'}</h3>
                    <p className="text-gray-500">{user.primaryEmailAddress?.emailAddress || 'No email provided'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <ul className="space-y-2">
                      <li><span className="font-semibold">User ID:</span> {user.id}</li>
                      <li><span className="font-semibold">Username:</span> {user.username || 'Not set'}</li>
                      <li><span className="font-semibold">First Name:</span> {user.firstName || 'Not provided'}</li>
                      <li><span className="font-semibold">Last Name:</span> {user.lastName || 'Not provided'}</li>
                      <li><span className="font-semibold">Created:</span> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</li>
                      <li><span className="font-semibold">Updated:</span> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <ul className="space-y-2">
                      <li>
                        <span className="font-semibold">Primary Email:</span> {user.primaryEmailAddress?.emailAddress || 'None'}
                        {user.primaryEmailAddress?.verification?.status && 
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${user.primaryEmailAddress.verification.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {user.primaryEmailAddress.verification.status}
                          </span>
                        }
                      </li>
                      <li>
                        <span className="font-semibold">Email Addresses:</span>
                        <ul className="pl-4">
                          {user.emailAddresses && user.emailAddresses.length > 0 ? (
                            user.emailAddresses.map(email => (
                              <li key={email.id}>
                                {email.emailAddress}
                                {email.verification?.status && 
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${email.verification.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {email.verification.status}
                                  </span>
                                }
                              </li>
                            ))
                          ) : (
                            <li>No email addresses found</li>
                          )}
                        </ul>
                      </li>
                      <li>
                        <span className="font-semibold">Phone Numbers:</span>
                        <ul className="pl-4">
                          {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
                            user.phoneNumbers.map(phone => (
                              <li key={phone.id}>
                                {phone.phoneNumber}
                                {phone.verification?.status && 
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${phone.verification.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {phone.verification.status}
                                  </span>
                                }
                              </li>
                            ))
                          ) : (
                            <li>None</li>
                          )}
                        </ul>
                      </li>
                    </ul>
                  </div>
                </div>
                
                {/* External Accounts/OAuth */}
                {user.externalAccounts && user.externalAccounts.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">External Accounts</h4>
                    <ul className="space-y-2">
                      {user.externalAccounts.map(account => (
                        <li key={account.id}>
                          <span className="font-semibold">{account.provider}:</span> {account.username || account.emailAddress || 'N/A'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Display all raw user data for complete information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Complete User Data (JSON)</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto" style={{ maxHeight: '300px' }}>
                    <pre>{formatUserData(user)}</pre>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-500">Error loading user data. Please try signing in again.</p>
            )}
          </div>
        </SignedIn>
        
        <SignedOut>
          <p className="text-gray-600 text-center mb-6">
            Sign in to see all your account information from Clerk.
          </p>
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}

export default App;
