import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import PageAccueil from './pages/PageAccueil';
import PageUtilisateurs from './pages/PageUtilisateurs';
import PageTemplates from './pages/PageTemplates';
import PageEditeurTemplate from './pages/PageEditeurTemplate';
import PageImpression from './pages/PageImpression';
import PageHistorique from './pages/PageHistorique';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function App() {
  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PageAccueil />
                </motion.div>
              }
            />
            <Route
              path="/utilisateurs"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PageUtilisateurs />
                </motion.div>
              }
            />
            <Route
              path="/templates"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PageTemplates />
                </motion.div>
              }
            />
            <Route
              path="/editeur/:id?"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PageEditeurTemplate />
                </motion.div>
              }
            />
            <Route
              path="/impression"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PageImpression />
                </motion.div>
              }
            />
            <Route
              path="/historique"
              element={
                <motion.div
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <PageHistorique />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </Box>
    </Layout>
  );
}

export default App;
