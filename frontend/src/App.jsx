import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CableProvider } from './contexts/CableContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import ManagerDashboard from './pages/ManagerDashboard';
import MatchDetails from './pages/MatchDetails';
import MyTickets from './pages/MyTickets';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CableProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/manager" element={<ManagerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/matches/:id" element={<MatchDetails />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/profile" element={<Profile />} />
            {/* Add other routes here */}
          </Routes>
        </Router>
      </CableProvider>
    </AuthProvider>
  );
}

export default App;
