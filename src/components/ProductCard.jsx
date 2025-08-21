// src/components/ProductCard.jsx

import React from 'react';
import defaultLogo from '../assets/web-app-manifest-192x192.png'; 
import { DollarSign, ShoppingBag, Heart, MessageCircle } from 'lucide-react'; 

function ProductCard({ 
    onClick, 
    onLike, // ✨ Nouvelle prop pour gérer le clic sur "liker"
    onComment, // ✨ Nouvelle prop pour gérer le clic sur "commenter"
    photo, 
    label, 
    category, 
    description, 
    isPaying, 
    price, 
    quantity, 
    productType,
    creator,
    ...data 
}) {
    // Utilise la première photo du tableau, ou le logo par défaut si le tableau est vide ou non défini
    const imageUrl = (photo && photo.length > 0) ? photo[0] : defaultLogo;
    
    // Le nom de la catégorie se trouve dans productType.label
    const productTypeName = productType?.label || 'N/A';
    
    // Le nom du créateur se trouve dans creator.username
    const creatorName = creator?.username || 'N/A';
    
    return (
        <div 
            className='max-h-[360px] h-[360px] w-[250px] hover:cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-lg flex flex-col items-center space-y-2 pb-2'
            style={{ 
                backgroundColor: 'var(--neutral-50)',
                border: '1px solid var(--neutral-200)',
                boxShadow: '0 4px 15px rgba(16, 98, 112, 0.1)'
            }}
        >
            {/* Card header: Image du produit */}
            <div className='h-2/5 w-full flex items-center justify-center relative p-5'>
                <div 
                    className="h-full w-full rounded-t-lg" 
                    style={{ 
                        background: `url(${imageUrl})`, 
                        backgroundSize: "cover", 
                        filter: `blur(1.5rem)` 
                    }}
                >
                </div>
                <img 
                    className="object-cover rounded-lg h-full absolute"
                    src={imageUrl} 
                    alt={label || 'Produit'} 
                    onClick={onClick} 
                />
            </div>

            {/* Card body: Détails du produit */}
            <div className='m-3 space-y-2 mt-2 border-t-[1px] flex-1 flex flex-col justify-between'>
                <div className='space-y-2'>
                    <p 
                        className='text-lg font-bold cursor-pointer hover:text-primary-color transition-colors duration-200' 
                        onClick={onClick}
                        style={{ color: 'var(--neutral-900)' }}
                    >
                        {label}
                    </p>
                    <p style={{ color: 'var(--secondary-color)' }}> 
                        Type de Produit : {productTypeName}
                    </p>
                    <p style={{ color: 'var(--neutral-600)' }}>
                        {description && description.length > 30 ? description?.slice(0, 30) + "..." : description}
                    </p>
                    <p 
                        className='font-semibold text-xs'
                        style={{ color: isPaying ? 'var(--secondary-color)' : 'var(--accent-color)' }}
                    > 
                        Statut : {isPaying === true ? "Payant" : "Non-Payant"}
                    </p>
                    <p 
                        className='font-medium'
                        style={{ color: 'var(--neutral-700)' }}
                    >
                        Créé par : {creatorName}
                    </p>
                </div>
                
                {/* Pied de carte: Prix, quantité et interactions */}
                <div className='flex flex-row items-center justify-between text-sm space-x-4' style={{ color: 'var(--primary-color)' }}>
                    <div className='flex items-center space-x-1'>
                        <DollarSign size={20} className="h-5 w-5" style={{ color: 'var(--secondary-color)' }} /> 
                        <span>{price || 'N/A'}</span>
                    </div>
                    <div className='flex items-center space-x-1'>
                        <ShoppingBag size={20} className="h-5 w-5" style={{ color: 'var(--secondary-color)' }} />
                        <span>{quantity}</span>
                    </div>
                    {/* ✨ Conteneur des interactions */}
                    <div className='flex items-center space-x-2'>
                        <Heart 
                            size={20} 
                            className="cursor-pointer hover:text-red-500 transition-colors" 
                            onClick={e => {
                                e.stopPropagation(); // Évite que le clic sur l'icône ne déclenche onClick de la carte
                                onLike();
                            }}
                            style={{ color: 'var(--secondary-color)' }}
                        />
                        <MessageCircle 
                            size={20} 
                            className="cursor-pointer hover:text-blue-500 transition-colors" 
                            onClick={e => {
                                e.stopPropagation();
                                onComment();
                            }}
                            style={{ color: 'var(--secondary-color)' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;