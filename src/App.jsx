// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import CountriesPage from './pages/CountriesPage.jsx';
import CitiesPage from './pages/CitiesPage.jsx';
import CompaniesPage from './pages/CompaniesPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProductTypesPage from './pages/ProductTypesPage.jsx';
import PlatformAccountsPage from './pages/PlatformAccountsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductList from './pages/products/ProductList.jsx';
import ProductForm from './pages/products/ProductForm.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { Menu, X } from 'lucide-react';

// Import de React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
    console.log(user);
    const isSUPER_ADMIN = user && user.isAdmin;
    const isAdminOrStaff = user && (user.isAdmin || user.isStaff);
    const isAdminOrStaffOrCompanyAdmin = user && (user.isAdmin || user.isStaff || (user?.rank === "ADMIN" && user?.isApproved));

  /* ----------------------------------------------------------
     Largeur de la sidebar (tailwind : w-64 = 16rem = 256px)
     On s’en sert pour décaler le contenu principal.
  ---------------------------------------------------------- */
  const sidebarWidth = '16rem'; // = w-64

  return (
    <div className="min-h-screen bg-base-200">
      {/* ---------- NAVBAR ---------- */}
      <Navbar>
        {/* On place le bouton menu mobile dans la navbar */}
        {isAdminOrStaffOrCompanyAdmin && (
          <button
            className="lg:hidden p-2 rounded-md hover:bg-base-300"
            onClick={() => setIsMobileSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        )}
      </Navbar>

      {/* ---------- LAYOUT PRINCIPAL ---------- */}
      <div className="relative flex min-h-[calc(100vh-64px)]">
        {/* ---------- SIDEBAR ---------- */}
        {isAdminOrStaffOrCompanyAdmin && (
          <>
            {/* Desktop */}
            <aside
              className={`hidden lg:block fixed top-[64px] left-0 h-[calc(100vh-64px)]
                          bg-base-100 border-r border-base-300
                          transition-[width] duration-300 ease-in-out z-20
                          ${isDesktopSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
            >
              <Sidebar />
            </aside>

            {/* Mobile */}
            <aside
              className={`lg:hidden fixed inset-y-0 left-0 z-30
                          w-64 bg-base-100 border-r border-base-300
                          transform transition-transform duration-300 ease-in-out
                          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
              <div className="pt-20">
                <Sidebar />
              </div>
            </aside>

            {/* Overlay mobile */}
            {isMobileSidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/40 z-20"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* ---------- BOUTON TOGGLE DESKTOP ---------- */}
        {isAdminOrStaffOrCompanyAdmin && (
          <button
            className={`hidden lg:block fixed top-[calc(64px+1rem)] z-30
                        bg-base-100 border border-base-300 rounded-r-md p-2
                        ${isDesktopSidebarOpen ? 'left-51' : 'left-0'}`}
            onClick={() => setIsDesktopSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            {isDesktopSidebarOpen ? <X /> : <Menu />}
          </button>
        )}

        {/* ---------- CONTENU PRINCIPAL ---------- */}
        <main
          className={`flex-1 transition-[margin-left] duration-300 ease-in-out
                      ${isAdminOrStaffOrCompanyAdmin && isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
                      flex justify-center`}
        >
          <div className="w-full max-w-7xl p-4">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/countries" element={<CountriesPage />} />
                  <Route path="/cities" element={<CitiesPage />} />
                  <Route path="/companies" element={<CompaniesPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/product-types" element={<ProductTypesPage />} />
                  <Route path="/platform-accounts" element={<PlatformAccountsPage />} />

                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/:id" element={<ProductForm />} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}                                              