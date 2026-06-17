import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Saarthi from './pages/Saarthi';
import SwiftDesk from './pages/SwiftDesk';
import BranchOS from './pages/BranchOS';
import StaffLogin from './pages/StaffLogin';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/saarthi" element={<Saarthi />} />
        <Route path="/swiftdesk" element={<SwiftDesk />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route
          path="/branchos"
          element={
            <ProtectedRoute>
              <BranchOS />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
