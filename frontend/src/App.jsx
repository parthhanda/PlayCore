import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import Squads from './pages/Squads';
import SquadProfile from './pages/SquadProfile';
import Dashboard from './pages/Dashboard';
import Footer from './components/Footer';
import { SocketProvider } from './context/SocketContext';
import GlobalChat from './components/Chat/GlobalChat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-background font-sans text-white">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/u/:username"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/directory" element={<Directory />} />
              <Route path="/squads" element={<Squads />} />
              <Route path="/squad/:id" element={<SquadProfile />} />

              {/* Catch all - redirect to home (which will redirect to login if not auth) */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <GlobalChat />
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
