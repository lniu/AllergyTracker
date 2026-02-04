import { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AllergenDetail } from './components/AllergenDetail';
import { Dashboard } from './pages/Dashboard';
import { AddTrialPage } from './pages/AddTrialPage';
import { AddReactionPage } from './pages/AddReactionPage';
import { ExportPage } from './pages/ExportPage';
import { CalendarPage } from './pages/CalendarPage';
import { BabyActivityPage } from './pages/BabyActivityPage';
import { seedAllergens } from './lib/instant';

function App() {
  const seeded = useRef(false);

  // Seed allergens on first load
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedAllergens().catch(console.error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="baby" element={<BabyActivityPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="allergen/:id" element={<AllergenDetail />} />
          <Route path="add-trial" element={<AddTrialPage />} />
          <Route path="add-reaction" element={<AddReactionPage />} />
          <Route path="export" element={<ExportPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
