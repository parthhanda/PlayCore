import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Players from './pages/Players';
import Squads from './pages/Squads';
import SquadProfile from './pages/SquadProfile';
import Tournaments from './pages/Tournaments';
import CreateTournament from './pages/CreateTournament';
import TournamentDetail from './pages/TournamentDetail';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import GlobalChat from './components/Chat/GlobalChat';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="flex flex-col min-h-screen bg-background font-sans text-white">
            <Navbar />

            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/tournaments" element={<Tournaments />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/u/:username" element={<Profile />} />
                  <Route path="/players" element={<Players />} />
                  <Route path="/squads" element={<Squads />} />
                  <Route path="/squads/:id" element={<SquadProfile />} />
                  <Route path="/tournaments/create" element={<CreateTournament />} />
                  <Route path="/tournaments/:id" element={<TournamentDetail />} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <GlobalChat />
            <Footer />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
