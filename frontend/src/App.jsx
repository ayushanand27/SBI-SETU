import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Saarthi from './pages/Saarthi';
import SwiftDesk from './pages/SwiftDesk';
import BranchOS from './pages/BranchOS';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/saarthi" element={<Saarthi />} />
      <Route path="/swiftdesk" element={<SwiftDesk />} />
      <Route path="/branchos" element={<BranchOS />} />
    </Routes>
  );
}

export default App;
