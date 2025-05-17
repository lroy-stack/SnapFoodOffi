import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Map from './pages/Map';
import DishDetail from './pages/DishDetail';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ConnectionStatus from './components/dishes/ConnectionStatus';
import ConnectionManager from './components/common/ConnectionManager';
import LanguageProvider from './context/LanguageContext';
import AuthProvider from './context/AuthContext';
import GamificationProvider from './contexts/GamificationContext';
import ScrollToTop from './components/utils/ScrollToTop';
// La conexión ahora se maneja a través de ConnectionService que se inicializa automáticamente

function App() {
  // No necesitamos comprobar la conexión manualmente ya que
  // ConnectionService se inicializa automáticamente al importarlo
  
  return (
    <LanguageProvider>
      <AuthProvider>
        <GamificationProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-gray-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiNlZWVlZWUiIHN0cm9rZS13aWR0aD0iMSI+PHBhdGggZD0iTTAgMHYxaDFWMHptOSA5djFoMVY5eiIvPjwvZz48L3N2Zz4=')] pb-16">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/discover" element={<Discover />} />
                  <Route path="/map" element={<Map />} />
                  <Route path="/dish/:dishId" element={<DishDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
              </main>
              <Navigation />
              <ConnectionStatus /> {/* Notificación en la parte inferior */}
              <ConnectionManager /> {/* Notificación en la parte superior para problemas críticos */}
              <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50/90 to-transparent pointer-events-none"></div>
            </div>
          </Router>
        </GamificationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
