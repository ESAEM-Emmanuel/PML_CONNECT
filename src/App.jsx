// import { Routes, Route, Navigate } from 'react-router-dom'
// import Home from './pages/Home.jsx'
// import Login from './pages/auth/Login.jsx'
// import Signup from './pages/auth/Signup.jsx'
// import ForgotPassword from './pages/auth/ForgotPassword.jsx'
// import CountryList from './pages/countries/CountryList.jsx'
// import CountryForm from './pages/countries/CountryForm.jsx'
// import CityList from './pages/cities/CityList.jsx'
// import CityForm from './pages/cities/CityForm.jsx'
// import ProductList from './pages/products/ProductList.jsx'
// import ProductForm from './pages/products/ProductForm.jsx'
// import ProtectedRoute from './routes/ProtectedRoute.jsx'
// import Navbar from './components/Navbar.jsx'
// import Sidebar from './components/Sidebar.jsx' // Import du nouveau composant Sidebar
// import { useAuth } from './context/AuthContext.jsx'

// export default function App() {
//   const { user } = useAuth()
  
//   // Condition pour afficher la barre latérale
//   console.log(user);
//   const isAdminOrStaff = user && (user.isAdmin || user.isStaff)

//   return (
//     <div className="min-h-screen bg-base-200">
//       <Navbar />
      
//       {/* Conteneur principal qui gère la mise en page de la barre latérale et du contenu */}
//       {/* 'flex-col' pour les petits écrans et 'lg:flex-row' pour les grands écrans */}
//       <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
        
//         {/* Appel du composant Sidebar ici, rendu conditionnellement */}
//         {isAdminOrStaff && <Sidebar />}

//         {/* Conteneur du contenu principal - prend l'espace restant */}
//         <div className="container mx-auto p-4 flex-1">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/forgot-password" element={<ForgotPassword />} />

//             <Route element={<ProtectedRoute />}>
//               <Route path="/countries" element={<CountryList />} />
//               <Route path="/countries/new" element={<CountryForm />} />
//               <Route path="/countries/:id" element={<CountryForm />} />

//               <Route path="/cities" element={<CityList />} />
//               <Route path="/cities/new" element={<CityForm />} />
//               <Route path="/cities/:id" element={<CityForm />} />

//               <Route path="/products" element={<ProductList />} />
//               <Route path="/products/new" element={<ProductForm />} />
//               <Route path="/products/:id" element={<ProductForm />} />
//             </Route>

//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </div>
//       </div>
//     </div>
//   )
// }
// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import CountryList from './pages/countries/CountryList.jsx';
import CountryForm from './pages/countries/CountryForm.jsx';
import CityList from './pages/cities/CityList.jsx';
import CityForm from './pages/cities/CityForm.jsx';
import ProductList from './pages/products/ProductList.jsx';
import ProductForm from './pages/products/ProductForm.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { Menu, X } from 'lucide-react';

export default function App() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  const isAdminOrStaff = user && (user.isAdmin || user.isStaff);

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
        {isAdminOrStaff && (
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
        {isAdminOrStaff && (
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
        {isAdminOrStaff && (
          <button
            className={`hidden lg:block fixed top-[calc(64px+1rem)] z-30
                        bg-base-100 border border-base-300 rounded-r-md p-2
                        ${isDesktopSidebarOpen ? 'left-64' : 'left-0'}`}
            onClick={() => setIsDesktopSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            {isDesktopSidebarOpen ? <X /> : <Menu />}
          </button>
        )}

        {/* ---------- CONTENU PRINCIPAL ---------- */}
        <main
          className={`flex-1 transition-[margin-left] duration-300 ease-in-out
                      ${isAdminOrStaff && isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
                      flex justify-center`}
        >
          <div className="w-full max-w-7xl p-4">
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route element={<ProtectedRoute />}>
                  <Route path="/countries" element={<CountryList />} />
                  <Route path="/countries/new" element={<CountryForm />} />
                  <Route path="/countries/:id" element={<CountryForm />} />

                  <Route path="/cities" element={<CityList />} />
                  <Route path="/cities/new" element={<CityForm />} />
                  <Route path="/cities/:id" element={<CityForm />} />

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