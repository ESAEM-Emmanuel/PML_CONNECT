import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, ShoppingBasket, MapPin, UserRound, AppWindow  } from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();

  return (
    <div className="w-full lg:w-64 p-4 lg:p-6 bg-base-100 shadow-md">
      <ul className="menu space-y-2">
        <li className="menu-title text-base font-semibold">
          {t('sidebar.menu')}
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-2 ${isActive ? 'active' : ''}`
            }
          >
            <AppWindow className="w-4 h-4" />
            {t('sidebar.dashboard')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/countries"
            className={({ isActive }) =>
              `flex items-center gap-2 ${isActive ? 'active' : ''}`
            }
          >
            <Globe className="w-4 h-4" />
            {t('sidebar.countries')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/cities"
            className={({ isActive }) =>
              `flex items-center gap-2 ${isActive ? 'active' : ''}`
            }
          >
            <MapPin className="w-4 h-4" />
            {t('sidebar.cities')}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `flex items-center gap-2 ${isActive ? 'active' : ''}`
            }
          >
            <ShoppingBasket className="w-4 h-4" />
            {t('sidebar.products')}
          </NavLink>
        </li>
      </ul>
    </div>
  );
}