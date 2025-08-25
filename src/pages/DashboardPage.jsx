// src/pages/DashboardPage.jsx
import { useTranslation } from 'react-i18next';
import { Users, Globe, MapPin } from 'lucide-react';
import PageContence from '../components/PageContence';
import ChartCard from '../components/ChartCard'; // Import du nouveau composant

export default function DashboardPage() {
  const { t } = useTranslation();

  // Données de démonstration pour le design
  const stats = [
    { id: 1, name: t('dashboard.total_countries'), value: '42', icon: Globe },
    { id: 2, name: t('dashboard.active_countries'), value: '38', icon: Globe },
    { id: 3, name: t('dashboard.total_cities'), value: '250', icon: MapPin },
    { id: 4, name: t('dashboard.total_users'), value: '15', icon: Users },
  ];

  // Données pour le graphique à barres (Exemple : pays créés par mois)
  const barData = {
    labels: ['Janv', 'Fév', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: t('dashboard.countries_created'),
        data: [10, 15, 8, 12, 18, 20],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Données pour le graphique linéaire (Exemple : villes créées par trimestre)
  const lineData = {
    labels: ['T1', 'T2', 'T3', 'T4'],
    datasets: [
      {
        label: t('dashboard.cities_created'),
        data: [50, 65, 80, 95],
        fill: false,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
      },
    ],
  };

  return (
    <PageContence>
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('modul_title.dashboard')}</h1>

        {/* Section 1: Statistiques principales (KPIs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.id} className="card card-compact bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h2 className="card-title text-xl">{stat.value}</h2>
                  <stat.icon size={24} className="text-primary" />
                </div>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Remplacement du placeholder par un vrai graphique à barres */}
          <ChartCard
            title={t('dashboard.countries_by_month')}
            data={barData}
            type="bar"
          />

          {/* Ajout d'un deuxième graphique pour la démo */}
          <ChartCard
            title={t('dashboard.cities_by_quarter')}
            data={lineData}
            type="line"
          />
        </div>

        {/* Section 3: Tableaux récents */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">{t('dashboard.recent_countries')}</h2>
            <div className="overflow-x-auto mt-4">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>{t('crud.name')}</th>
                    <th>{t('crud.code')}</th>
                    <th>{t('crud.created_at')}</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Données de démonstration, à remplacer par votre API */}
                  <tr>
                    <td>France</td>
                    <td>FR</td>
                    <td>25/08/2025</td>
                  </tr>
                  <tr>
                    <td>Allemagne</td>
                    <td>DE</td>
                    <td>24/08/2025</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageContence>
  );
}