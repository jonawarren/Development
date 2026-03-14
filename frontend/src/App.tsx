import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Survey } from './pages/Survey';
import { WaitingRoom } from './pages/WaitingRoom';
import { Results } from './pages/Results';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/survey/:token" element={<Survey />} />
          <Route path="/waiting/:sessionId" element={<WaitingRoom />} />
          <Route path="/results/:sessionId" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
