import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InstallationWizard from '../components/POS/InstallationWizard';

const POSRoutes = () => {
  return (
    <Routes>
      <Route path="/install" element={<InstallationWizard />} />
      <Route path="/" element={<InstallationWizard />} />
    </Routes>
  );
};

export default POSRoutes;