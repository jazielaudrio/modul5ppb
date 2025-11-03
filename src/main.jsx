// src/main.jsx
import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import SplashScreen from './pages/SplashScreen';
import HomePage from './pages/HomePage';
import MakananPage from './pages/MakananPage';
import MinumanPage from './pages/MinumanPage';
import ProfilePage from './pages/ProfilePage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeDetail from './components/recipe/RecipeDetail';
import DesktopNavbar from './components/navbar/DesktopNavbar';
import MobileNavbar from './components/navbar/MobileNavbar';
import './index.css'
import PWABadge from './PWABadge';

function getInitialStateFromUrl() {
  // Hanya jalankan di browser
  if (typeof window === 'undefined') {
    return {
      showSplash: true,
      currentPage: 'home',
      mode: 'list',
      selectedRecipeId: null,
      selectedCategory: 'makanan',
      editingRecipeId: null,
    };
  }
  
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  const id = params.get('id');
  const category = params.get('category');
  
  if (page === 'detail' && id) {
    // Set initial state to show splash but transition directly to detail after splash
    return {
      showSplash: true, 
      currentPage: category || 'home',
      mode: 'detail',
      selectedRecipeId: id,
      selectedCategory: category || 'makanan',
      editingRecipeId: null,
    };
  }
  
  // Default state
  return {
    showSplash: true,
    currentPage: 'home',
    mode: 'list',
    selectedRecipeId: null,
    selectedCategory: 'makanan',
    editingRecipeId: null,
  };
}


function AppRoot() {
  const initialState = getInitialStateFromUrl(); // <-- Gunakan state awal dari URL
  
  const [showSplash, setShowSplash] = useState(initialState.showSplash);
  const [currentPage, setCurrentPage] = useState(initialState.currentPage);
  const [mode, setMode] = useState(initialState.mode); // 'list', 'detail', 'create', 'edit'
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialState.selectedRecipeId);
  const [selectedCategory, setSelectedCategory] = useState(initialState.selectedCategory);
  const [editingRecipeId, setEditingRecipeId] = useState(initialState.editingRecipeId);

  // Effect to sync URL with state changes for deep linking
  useEffect(() => {
    const params = new URLSearchParams();

    if (mode === 'detail' && selectedRecipeId) {
      params.set('page', 'detail');
      params.set('id', selectedRecipeId);
      // Pastikan kategori valid untuk URL
      const categoryParam = ['makanan', 'minuman'].includes(selectedCategory) ? selectedCategory : 'makanan';
      params.set('category', categoryParam);
    } 

    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');

    // Gunakan replaceState untuk memperbarui URL tanpa menambah riwayat browser
    if (window.location.href !== window.location.origin + newUrl) {
      window.history.replaceState(null, '', newUrl);
    }
  }, [mode, selectedRecipeId, selectedCategory]); // <-- Dependency array berisi state yang relevan

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateRecipe = () => {
    setMode('create');
  };

  const handleRecipeClick = (recipeId, category) => {
    setSelectedRecipeId(recipeId);
    setSelectedCategory(category || currentPage);
    setMode('detail');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('mode', 'detail');
      url.searchParams.set('recipeId', recipeId);
      if (category) url.searchParams.set('category', category);
      window.history.pushState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  };

  const handleEditRecipe = (recipeId) => {
    console.log('🔧 Edit button clicked! Recipe ID:', recipeId);
    setEditingRecipeId(recipeId);
    setMode('edit');
    console.log('✅ Mode changed to: edit');
  };

  const handleBack = () => {
    setMode('list');
    setSelectedRecipeId(null);
    setEditingRecipeId(null);
  };

  const handleCreateSuccess = (newRecipe) => {
    alert('Resep berhasil dibuat!');
    setMode('list');
    // Optionally navigate to the new recipe's category
    if (newRecipe && newRecipe.category) {
      setCurrentPage(newRecipe.category);
    }
  };

  const handleEditSuccess = (updatedRecipe) => {
    alert('Resep berhasil diperbarui!');
    setMode('list');
  };

  const renderCurrentPage = () => {
    // Show Create Recipe Page
    if (mode === 'create') {
      return (
        <CreateRecipePage
          onBack={handleBack}
          onSuccess={handleCreateSuccess}
        />
      );
    }

    // Show Edit Recipe Page
    if (mode === 'edit') {
      return (
        <EditRecipePage
          recipeId={editingRecipeId}
          onBack={handleBack}
          onSuccess={handleEditSuccess}
        />
      );
    }

    // Show Recipe Detail
    if (mode === 'detail') {
      return (
        <RecipeDetail
          recipeId={selectedRecipeId}
          category={selectedCategory}
          onBack={handleBack}
          onEdit={handleEditRecipe}
        />
      );
    }

    // Show List Pages
    switch (currentPage) {
      case 'home':
        return <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />;
      case 'makanan':
        return <MakananPage onRecipeClick={handleRecipeClick} />;
      case 'minuman':
        return <MinumanPage onRecipeClick={handleRecipeClick} />;
      case 'profile':
        return <ProfilePage onRecipeClick={handleRecipeClick} />;
      default:
        return <HomePage onRecipeClick={handleRecipeClick} onNavigate={handleNavigation} />;
    }
  };

  // Read deep link params on first render
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      const recipeIdParam = params.get('recipeId');
      const categoryParam = params.get('category');

      if (modeParam === 'detail' && recipeIdParam) {
        setSelectedRecipeId(recipeIdParam);
        setSelectedCategory(categoryParam || 'makanan');
        setMode('detail');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Only show navbar in list mode */}
      {mode === 'list' && (
        <>
          <DesktopNavbar 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
          <MobileNavbar 
            currentPage={currentPage} 
            onNavigate={handleNavigation}
            onCreateRecipe={handleCreateRecipe}
          />
        </>
      )}
      
      {/* Main Content */}
      <main className="min-h-screen">
        {renderCurrentPage()}
      </main>

      <PWABadge />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoot />
  </StrictMode>,
)