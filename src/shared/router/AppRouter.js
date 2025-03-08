import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, ProtectedRoute } from '../../features/auth';
import { BadgesPage } from '../../features/badges';
import { RewardsPage } from '../../features/rewards';
import { MascotsPage } from '../../features/mascots';
import { ItemsPage } from '../../features/items';

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