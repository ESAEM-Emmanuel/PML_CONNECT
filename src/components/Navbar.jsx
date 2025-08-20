import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import ThemeSwitcher from './ThemeSwitcher.jsx'
import { LogIn, LogOut, Home, Globe, ShoppingBasket, Menu, User, UserRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useThemeContext } from '../context/ThemeContext.jsx'
import LogoDesktop from "../assets/favicon.svg"
import LogoMobile from "../assets/favicon.ico"
import { useState } from 'react'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { theme } = useThemeContext()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  }

  const handleNavLinkClick = () => {
    setIsOpen(false);
  }

  return (
    <>
      <div className="navbar bg-base-100 shadow transition-colors duration-300">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl text-primary">
            <img 
              src={LogoMobile} 
              alt="Logo mobile" 
              className="h-8 w-8 block sm:hidden brightness-125 transition-all duration-200" 
            />
            <img 
              src={LogoDesktop} 
              alt="Logo desktop" 
              className="h-8 w-8 hidden sm:block brightness-125 transition-all duration-200" 
            />
          </Link>
        </div>

        <div className="hidden lg:flex flex-none gap-2 items-center">
          <ul className="menu menu-horizontal px-1">
            <li>
              <NavLink to="/" className="gap-2">
                <Home className="w-4 h-4" />
                {t('nav.home')}
              </NavLink>
            </li>
            {user && (
              <>
                <li>
                  <NavLink to="/countries" className="gap-2">
                    <Globe className="w-4 h-4" />
                    {t('nav.countries')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/products" className="gap-2">
                    <ShoppingBasket className="w-4 h-4" />
                    {t('nav.products')}
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          

          {!user ? (
            <Link to="/login" className="btn btn-primary btn-sm gap-2 flex items-center">
              <LogIn className="w-4 h-4" />
              {t('nav.login')}
            </Link>
          ) : (
            <>
              {/* Ajout du nom de l'utilisateur ici */}
              <span className="font-bold text-sm text-base-content hidden md:block">
                {user.firstName} {user.lastName}
              </span>
              
              <div className="dropdown lg:dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    {user.photo ? (
                      <img src={user.photo} alt="User Avatar" />
                    ) : (
                      <User className="w-full h-full p-2" />
                    )}
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link to="/profile">
                      <UserRound className="w-4 h-4" />
                      {t('nav.profile')}
                    </Link>
                  </li>
                  <li>
                    <a onClick={logout}>
                      <LogOut className="w-4 h-4" />
                      {t('nav.logout')}
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="flex lg:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="btn btn-ghost btn-square"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-base-200 z-50 p-4 transition-transform transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold">{t('app_name')}</span>
            <button onClick={() => setIsOpen(false)} className="btn btn-sm">
              ✕
            </button>
          </div>
          <ul className="menu space-y-2">
            <li>
              <NavLink to="/" onClick={handleNavLinkClick}>
                <Home className="w-4 h-4" /> {t('nav.home')}
              </NavLink>
            </li>
            {user && (
              <>
                <li>
                  <NavLink to="/countries" onClick={handleNavLinkClick}>
                    <Globe className="w-4 h-4" /> {t('nav.countries')}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/products" onClick={handleNavLinkClick}>
                    <ShoppingBasket className="w-4 h-4" /> {t('nav.products')}
                  </NavLink>
                </li>
                <div className="divider my-0"></div>
                <li className="menu-title !px-4 flex items-left">
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt="Avatar"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-4 h-4" />
                  )}
                  {user.firstName} {user.lastName}
                </li>
                {/* <li className="menu-title !px-4 flex items-center gap-2">
                  {user.firstName} {user.lastName}
                </li> */}
                <li>
                  <NavLink to="/profile" onClick={handleNavLinkClick}>
                    <UserRound className="w-4 h-4" /> {t('nav.profile')}
                  </NavLink>
                </li>
                <li>
                  <a onClick={logout}>
                    <LogOut className="w-4 h-4" /> {t('nav.logout')}
                  </a>
                </li>
              </>
            )}
            {!user && (
              <li>
                <NavLink to="/login" onClick={handleNavLinkClick}>
                  <LogIn className="w-4 h-4" /> {t('nav.login')}
                </NavLink>
              </li>
            )}
          </ul>
          <div className="mt-4 flex gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </>
  )
}