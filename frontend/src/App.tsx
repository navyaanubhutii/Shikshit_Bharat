import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { BlindEntryPage } from '@/pages/BlindEntryPage';
import { DeafEntryPage } from '@/pages/DeafEntryPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/blind" element={<BlindEntryPage />} />
        <Route path="/deaf" element={<DeafEntryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
