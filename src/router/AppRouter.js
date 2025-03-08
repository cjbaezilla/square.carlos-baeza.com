import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import HomePage from '../pages/HomePage';
import BadgesPage from '../pages/BadgesPage';
import RewardsPage from '../pages/RewardsPage';
import MascotsPage from '../pages/MascotsPage';
import ItemsPage from '../pages/ItemsPage';

// Protected route component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

const AppRouter = ({ userMascots, activeMascot, userItems }) => {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage 
              userMascots={userMascots} 
              activeMascot={activeMascot} 
              userItems={userItems} 
            />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/badges" 
        element={
          <ProtectedRoute>
            <BadgesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/rewards" 
        element={
          <ProtectedRoute>
            <RewardsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/mascots" 
        element={
          <ProtectedRoute>
            <MascotsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/items" 
        element={
          <ProtectedRoute>
            <ItemsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter; 