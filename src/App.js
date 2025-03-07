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
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center py-12 transition-colors duration-200">
      <div className="max-w-3xl w-full px-6 py-8 bg-gray-800 shadow-md rounded-lg transition-colors duration-200">
        <div className="absolute top-4 right-4 flex items-center space-x-4">
          <SignedIn>
            {/* Mount UserButton component only if user is signed in */}
            <UserButton />
          </SignedIn>
          <SignedOut>
            {/* Mount sign in button only if user is signed out */}
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-300">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-100 mb-8 transition-colors duration-200">
          Welcome to My React App
        </h1>
        
        <SignedIn>
          <div className="text-gray-300 mb-6 transition-colors duration-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">User Information</h2>
            
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
                    <h3 className="text-xl font-medium text-gray-100">{user.fullName || 'No name provided'}</h3>
                    <p className="text-gray-400">{user.primaryEmailAddress?.emailAddress || 'No email provided'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                    <h4 className="font-medium mb-2 text-gray-100">Basic Information</h4>
                    <ul className="space-y-2">
                      <li><span className="font-semibold text-gray-300">User ID:</span> <span className="text-gray-400">{user.id}</span></li>
                      <li><span className="font-semibold text-gray-300">Username:</span> <span className="text-gray-400">{user.username || 'Not set'}</span></li>
                      <li><span className="font-semibold text-gray-300">First Name:</span> <span className="text-gray-400">{user.firstName || 'Not provided'}</span></li>
                      <li><span className="font-semibold text-gray-300">Last Name:</span> <span className="text-gray-400">{user.lastName || 'Not provided'}</span></li>
                      <li><span className="font-semibold text-gray-300">Created:</span> <span className="text-gray-400">{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</span></li>
                      <li><span className="font-semibold text-gray-300">Updated:</span> <span className="text-gray-400">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'N/A'}</span></li>
                    </ul>
                  </div>

                  <div className="bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                    <h4 className="font-medium mb-2 text-gray-100">Contact Information</h4>
                    <ul className="space-y-2">
                      <li>
                        <span className="font-semibold text-gray-300">Primary Email:</span> <span className="text-gray-400">{user.primaryEmailAddress?.emailAddress || 'None'}</span>
                        {user.primaryEmailAddress?.verification?.status && 
                          <span className={`ml-2 px-2 py-1 text-xs rounded ${user.primaryEmailAddress.verification.status === 'verified' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                            {user.primaryEmailAddress.verification.status}
                          </span>
                        }
                      </li>
                      <li>
                        <span className="font-semibold text-gray-300">Email Addresses:</span>
                        <ul className="pl-4 text-gray-400">
                          {user.emailAddresses && user.emailAddresses.length > 0 ? (
                            user.emailAddresses.map(email => (
                              <li key={email.id}>
                                {email.emailAddress}
                                {email.verification?.status && 
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${email.verification.status === 'verified' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
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
                        <span className="font-semibold text-gray-300">Phone Numbers:</span>
                        <ul className="pl-4 text-gray-400">
                          {user.phoneNumbers && user.phoneNumbers.length > 0 ? (
                            user.phoneNumbers.map(phone => (
                              <li key={phone.id}>
                                {phone.phoneNumber}
                                {phone.verification?.status && 
                                  <span className={`ml-2 px-2 py-1 text-xs rounded ${phone.verification.status === 'verified' ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
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
                  <div className="bg-gray-700 p-4 rounded-lg transition-colors duration-200">
                    <h4 className="font-medium mb-2 text-gray-100">External Accounts</h4>
                    <ul className="space-y-2">
                      {user.externalAccounts.map(account => (
                        <li key={account.id}>
                          <span className="font-semibold text-gray-300">{account.provider}:</span> {account.username || account.emailAddress || 'N/A'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p>No user information available</p>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-gray-700 rounded-lg transition-colors duration-200">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Raw User Data</h2>
            <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm text-gray-300">
              {formatUserData(user)}
            </pre>
          </div>
        </SignedIn>
        
        <SignedOut>
          <div className="text-center p-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">Hello there!</h2>
            <p className="mb-6 text-gray-300">Please sign in to view your profile information.</p>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-300">
                Sign in with Clerk
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>
      
      <footer className="mt-8 text-center text-gray-400">
        <p>© {new Date().getFullYear()} My App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
