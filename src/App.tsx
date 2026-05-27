import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { CameraScanPage } from './pages/CameraScanPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { ProfilePantryPage } from './pages/ProfilePantryPage';
import { RecipesResultsPage } from './pages/RecipesResultsPage';
import { AllRecipesPage } from './pages/AllRecipesPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AddRecipePage } from './pages/AddRecipePage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { BottomNav } from './components/layout/BottomNav';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
            <LoginPage />
          </motion.div>
        } />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <HomePage />
            </motion.div>
          } />
          <Route path="/camera" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <CameraScanPage />
            </motion.div>
          } />
          <Route path="/recipes-search" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <RecipesResultsPage />
            </motion.div>
          } />
          <Route path="/recipe/:id" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <RecipeDetailPage />
            </motion.div>
          } />
          <Route path="/favorites" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <FavoritesPage />
            </motion.div>
          } />
          <Route path="/all-recipes" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <AllRecipesPage />
            </motion.div>
          } />
          <Route path="/add-recipe" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <AddRecipePage />
            </motion.div>
          } />
          <Route path="/profile" element={
            <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
              <ProfilePantryPage />
            </motion.div>
          } />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const location = useLocation();
  const showNav = location.pathname !== '/login';

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <AnimatedRoutes />
      </div>
      {showNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
