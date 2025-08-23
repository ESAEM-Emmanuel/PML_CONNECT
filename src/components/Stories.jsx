// src/components/Stories.jsx
import React from 'react';

const Stories = () => {
  // Tableau de données factices avec des images de profil en ligne
  const dummyStories = [
    { id: 1, username: 'user1', image: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 2, username: 'user2', image: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 3, username: 'user3', image: 'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 4, username: 'user4', image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 5, username: 'user5', image: 'https://images.pexels.com/photos/2065195/pexels-photo-2065195.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 6, username: 'user6', image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 7, username: 'user7', image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
    { id: 8, username: 'user8', image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' },
  ];

  return (
    <div className="w-full flex space-x-4 overflow-x-auto p-4 bg-primary-color border-b border-neutral-200">
      {dummyStories.map((story) => (
        <div key={story.id} className="flex-shrink-0 flex flex-col items-center cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-primary-color overflow-hidden">
            <img 
              src={story.image} 
              alt={`Story de ${story.username}`} 
              className="w-full h-full object-cover" 
            />
          </div>
          <span className="text-xs mt-1 text-gray-700">{story.username}</span>
        </div>
      ))}
    </div>
  );
};

export default Stories;