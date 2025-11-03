// src/pages/ProfilePage.jsx
import { useFavorites } from '../hooks/useFavorites';
import { useState } from 'react';
import { Settings, Heart, ArrowLeft } from 'lucide-react';
import userService from '../services/userService';

// Komponen Pembantu untuk Menampilkan Resep Favorit
function FavoriteRecipes({ onRecipeClick }) {
  const { favorites, loading, error, refetch } = useFavorites();
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Memuat resep favorit...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error memuat favorit: {error}</p>
        <button onClick={refetch} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg">Coba Lagi</button>
      </div>
    );
  }

  const recipeData = favorites.map(fav => fav.recipe).filter(r => r);

  if (!recipeData || recipeData.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 text-lg font-medium">Belum ada resep favorit.</p>
        <p className="text-gray-500 text-sm mt-1">
          Tambahkan resep favorit dari halaman detail resep.
        </p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        Resep Favorit ({recipeData.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {recipeData.map((recipe) => (
          <div 
            key={recipe.id} 
            onClick={() => onRecipeClick && onRecipeClick(recipe.id, recipe.category)}
            className="group relative bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl shadow-blue-500/5 hover:shadow-blue-500/15 transition-all duration-500 cursor-pointer hover:scale-[1.02]"
          >
             <div className="relative h-32 md:h-56 overflow-hidden">
                <img 
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                <div className="absolute top-3 right-3 z-10">
                  <div className="p-2 bg-red-500 text-white rounded-full">
                     <Heart className="w-4 h-4 fill-current" />
                  </div>
                </div>
              </div>
              <div className="relative z-10 p-4 md:p-8">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <span className={`text-xs font-semibold ${recipe.category === 'makanan' ? 'text-blue-700 bg-blue-100/90' : 'text-green-700 bg-green-100/90'} px-2 md:px-3 py-1 md:py-1.5 rounded-full capitalize`}>
                    {recipe.category}
                  </span>
                  {recipe.average_rating > 0 && (
                    <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-full">
                      <Heart className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                      <span className="text-xs md:text-sm font-semibold text-slate-700">{recipe.average_rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 mb-3 md:mb-4 text-base md:text-xl group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                  {recipe.name}
                </h3>
              </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ProfilePage({ onRecipeClick }) {
  const userProfile = userService.getUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  // Get initial values from local storage/default profile
  const [username, setUsername] = useState(userProfile.username);
  const [bio, setBio] = useState(userProfile.bio);
  
  const handleSaveProfile = () => {
    userService.updateUsername(username);
    userService.updateBio(bio);
    setIsEditing(false);
    alert('Profil berhasil diperbarui!');
  };
  
  // Re-fetch profile on component mount/unmount to ensure latest values on save
  const reloadedProfile = userService.getUserProfile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-8">
          Halaman Profil
        </h1>
        
        {/* Profile Card */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 p-6 md:p-8 mb-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                {reloadedProfile.username.charAt(0)}
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-xl font-bold text-slate-800 border-b border-slate-300 focus:outline-none focus:border-blue-500 bg-transparent"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-slate-800">{reloadedProfile.username}</h2>
                )}
                <p className="text-sm text-slate-500">ID Pengguna: {reloadedProfile.userId.substring(0, 10)}...</p>
              </div>
            </div>
            
            <button
              onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <Settings className="w-4 h-4" />
              <span>{isEditing ? 'Simpan' : 'Edit Profil'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">Bio</h3>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Tulis bio singkat tentang dirimu..."
              />
            ) : (
              <p className="text-slate-600 italic leading-relaxed">
                {reloadedProfile.bio || 'Belum ada bio. Klik "Edit Profil" untuk menambahkan.'}
              </p>
            )}
          </div>
        </div>

        {/* Favorite Recipes Section */}
        <FavoriteRecipes onRecipeClick={onRecipeClick} />
      </div>
    </div>
  );
}