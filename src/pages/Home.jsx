import { useTranslation } from 'react-i18next';
import PageContence from '../components/PageContence';
import ProductCard from '../components/ProductCard'; // Assure-toi d'importer le bon composant
import { dummyProducts } from '../data/dummyProducts'; // Importe les données factices
import Caroussel from '../components/Caroussel';
import Stories from '../components/Stories';

export default function Home() {
  const { t } = useTranslation();

  return (
    <PageContence>
      <h1 className="text-3xl font-bold mb-6">{t('modul_title.home')}</h1>

      {/* ✨ Section Stories */}
      <div className="mb-10">
        <Stories />
      </div>

      {/* ✨ Emplacement du carrousel avec un espacement en bas */}
      <div className="mb-10">
        <Caroussel />
      </div>

      {/* Titre de la section Produits */}
      <h2 className="text-2xl font-bold mt-10 mb-6">{t('home.product_title')}</h2>
      
      {/* Grille de cartes de produits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {dummyProducts.map((product) => (
          <ProductCard
            key={product.id}
            onClick={() => console.log(`Carte du produit ${product.label} cliquée`)}
            label={product.label}
            category={product.category}
            description={product.description}
            isPaying={product.isPaying}
            price={product.price}
            quantity={product.quantity}
            photo={product.photo}
            productType={product.productType}
            creator={product.creator}
          />
        ))}
      </div>
    </PageContence>
  );
}