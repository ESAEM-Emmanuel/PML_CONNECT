// Sidebar.jsx
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMemo } from 'react';
import {
    LayoutDashboard,
    Building,
    Users,
    Globe,
    Banknote ,
    MapPin,
    Truck,
    Briefcase,
    Package,
    FileText,
    Receipt,
    ShoppingBag,
    PackageCheck,
    FileSignature,
    Warehouse,
    Home,
    CreditCard,
    ListChecks,
    ClipboardList
} from 'lucide-react';

const iconMap = {
    LayoutDashboard,
    Building,
    Users,
    Globe,
    MapPin,
    Truck,
    Banknote ,
    Briefcase,
    Package,
    FileText,
    Receipt,
    ShoppingBag,
    PackageCheck,
    FileSignature,
    Warehouse,
    Home,
    CreditCard,
    ListChecks,
    ClipboardList,
};

export default function Sidebar() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isAdmin = user && (user.isAdmin);
    const isAdminOrStaff = user && (user.isAdmin || user.isStaff);
    const isCompanyAdmin = user && (user?.rank === "ADMIN" && user?.isApproved);

    const navItems = useMemo(() => [
        {
            title: t('sidebar.dashboard'),
            href: '/dashboard',
            icon: 'LayoutDashboard',
            condition: isAdminOrStaff
        },
        {
            title: t('sidebar.countries'),
            href: '/countries',
            icon: 'Globe',
            condition: isAdminOrStaff
        },
        {
            title: t('sidebar.cities'),
            href: '/cities',
            icon: 'MapPin',
            condition: isAdminOrStaff
        },
        {
            title: t('sidebar.companies'),
            href: '/companies',
            icon: 'Building',
            condition: isAdminOrStaff
        },
        {
            title: t('sidebar.users'),
            href: '/users',
            icon: 'Users',
            condition: isAdminOrStaff || isCompanyAdmin
        },
        {
            title: t('sidebar.product_types'),
            href: '/product-types',
            icon: 'ClipboardList',
            condition: isAdminOrStaff || isCompanyAdmin
        },
        {
            title: t('sidebar.platform_accounts'),
            href: '/platform-accounts',
            icon: 'Banknote',
            condition: isAdminOrStaff || isCompanyAdmin
        },
        // Ajoutez d'autres éléments ici selon vos besoins
    ], [t, isAdminOrStaff, isCompanyAdmin]);

    const availableNavItems = useMemo(() => {
        return navItems.filter(item => item.condition);
    }, [navItems]);

    return (
        <nav className="w-full lg:w-64 p-4 lg:p-6 bg-base-100 shadow-md">
            <ul className="menu space-y-2">
            <li className="menu-title text-base font-semibold">
              {t('sidebar.menu')}
            </li>
                {availableNavItems.map((item, index) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                        <li key={index}>
                            <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-primary text-primary-content' 
                                            : 'hover:bg-base-200'
                                    }`
                                }
                                // className={({ isActive }) =>
                                //   `flex items-center gap-2 ${isActive ? 'active' : ''}`
                                // }
                                onClick={() => {
                                    // Fermer le menu mobile si nécessaire
                                    if (window.innerWidth < 1024) {
                                        document.dispatchEvent(new CustomEvent('closeMobileSidebar'));
                                    }
                                }}
                            >
                                {IconComponent && <IconComponent size={20} />}
                                <span>{item.title}</span>
                            </NavLink>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}