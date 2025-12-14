import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  People as PeopleIcon,
  Layers as LayersIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Nfc as NfcIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  CreditCard as CardIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { santeApi, impressionApi, utilisateursApi, templatesApi, nfcApi } from '../services/api';

const MotionCard = motion(Card);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const StatCard = ({ titre, valeur, sousTitre, icon, gradient, onClick }) => (
  <MotionCard
    variants={itemVariants}
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: gradient,
      },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
            {titre}
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ my: 1 }}>
            {valeur}
          </Typography>
          {sousTitre && (
            <Typography variant="body2" color="text.secondary">
              {sousTitre}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 8px 20px ${alpha('#6366f1', 0.3)}`,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
        </Box>
      </Box>
    </CardContent>
  </MotionCard>
);

const QuickActionCard = ({ titre, description, icon, gradient, onClick }) => (
  <MotionCard
    variants={itemVariants}
    whileHover={{ y: -3, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      height: '100%',
      '&:hover .action-arrow': {
        transform: 'translateX(4px)',
      },
    }}
  >
    <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2,
          background: gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { color: 'white', fontSize: 24 } })}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {titre}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <ArrowForwardIcon
        className="action-arrow"
        sx={{ color: 'text.secondary', transition: 'transform 0.2s' }}
      />
    </CardContent>
  </MotionCard>
);

function PageAccueil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    utilisateurs: 0,
    templates: 0,
    impressions: { total: 0, terminees: 0, erreurs: 0, impressions_aujourdhui: 0 },
    nfc: { disponible: false, connecte: false },
    serveur: { status: 'inconnu' },
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [santeRes, statsRes, utilisateursRes, templatesRes, nfcRes] = await Promise.all([
        santeApi.verifier().catch(() => ({ status: 'erreur' })),
        impressionApi.getStatistiques().catch(() => ({ donnees: {} })),
        utilisateursApi.getAll().catch(() => ({ total: 0 })),
        templatesApi.getAll().catch(() => ({ total: 0 })),
        nfcApi.getStatus().catch(() => ({ donnees: { disponible: false } })),
      ]);

      setStats({
        serveur: santeRes,
        impressions: statsRes.donnees || {},
        utilisateurs: utilisateursRes.total || 0,
        templates: templatesRes.total || 0,
        nfc: nfcRes.donnees || {},
      });
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">Chargement du tableau de bord...</Typography>
      </Box>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h3"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Bienvenue
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Système d'impression de cartes professionnelles avec encodage NFC
          </Typography>
        </Box>
        <Tooltip title="Actualiser">
          <IconButton
            onClick={() => chargerDonnees(true)}
            disabled={refreshing}
            sx={{
              bgcolor: alpha('#6366f1', 0.1),
              '&:hover': { bgcolor: alpha('#6366f1', 0.2) },
            }}
          >
            <RefreshIcon sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Status Alert */}
      <motion.div variants={itemVariants}>
        <Alert
          severity={stats.serveur.status === 'ok' ? 'success' : 'warning'}
          icon={stats.serveur.status === 'ok' ? <CheckCircleIcon /> : <ErrorIcon />}
          sx={{
            mb: 4,
            borderRadius: 3,
            '& .MuiAlert-icon': { alignItems: 'center' },
          }}
          action={
            <Chip
              label={stats.nfc.connecte ? 'NFC Connecté' : 'NFC Simulé'}
              size="small"
              icon={<NfcIcon sx={{ fontSize: 16 }} />}
              color={stats.nfc.connecte ? 'success' : 'warning'}
            />
          }
        >
          <Typography variant="body2" fontWeight={500}>
            {stats.serveur.status === 'ok'
              ? 'Système opérationnel - Imprimante Luca 40 KM prête'
              : 'Connexion au serveur en cours...'}
          </Typography>
        </Alert>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            titre="Utilisateurs"
            valeur={stats.utilisateurs}
            sousTitre="Dans la base de données"
            icon={<PeopleIcon />}
            gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
            onClick={() => navigate('/utilisateurs')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            titre="Templates"
            valeur={stats.templates}
            sousTitre="Modèles disponibles"
            icon={<LayersIcon />}
            gradient="linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
            onClick={() => navigate('/templates')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            titre="Impressions"
            valeur={stats.impressions.total || 0}
            sousTitre={`${stats.impressions.impressions_aujourdhui || 0} aujourd'hui`}
            icon={<PrintIcon />}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            onClick={() => navigate('/historique')}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            titre="Taux de Réussite"
            valeur={
              stats.impressions.total
                ? `${Math.round(((stats.impressions.terminees || 0) / stats.impressions.total) * 100)}%`
                : '100%'
            }
            sousTitre={`${stats.impressions.erreurs || 0} erreur(s)`}
            icon={<TrendingUpIcon />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Actions Rapides
        </Typography>
      </motion.div>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            titre="Nouvelle Impression"
            description="Imprimer une carte avec données et NFC"
            icon={<PrintIcon />}
            gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
            onClick={() => navigate('/impression')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            titre="Créer un Template"
            description="Concevoir un nouveau modèle de carte"
            icon={<AddIcon />}
            gradient="linear-gradient(135deg, #ec4899 0%, #f472b6 100%)"
            onClick={() => navigate('/editeur')}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionCard
            titre="Ajouter un Utilisateur"
            description="Enregistrer une nouvelle personne"
            icon={<PeopleIcon />}
            gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
            onClick={() => navigate('/utilisateurs')}
          />
        </Grid>
      </Grid>

      {/* Bottom Cards */}
      <Grid container spacing={3}>
        {/* Printer Info */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PrintIcon sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Imprimante Luca 40 KM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Retransfer haute qualité
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#6366f1', 0.05),
                        border: '1px solid',
                        borderColor: alpha('#6366f1', 0.1),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CardIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          Format
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        CR80 (85.6 × 53.98 mm)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#6366f1', 0.05),
                        border: '1px solid',
                        borderColor: alpha('#6366f1', 0.1),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <SpeedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          Résolution
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        300 DPI
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#10b981', 0.05),
                        border: '1px solid',
                        borderColor: alpha('#10b981', 0.1),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <NfcIcon sx={{ fontSize: 18, color: 'success.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          NFC
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        MIFARE DESFire
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha('#6366f1', 0.05),
                        border: '1px solid',
                        borderColor: alpha('#6366f1', 0.1),
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MemoryIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          Technologie
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        Retransfer Film
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ScheduleIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Statistiques
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Performance du système
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => navigate('/historique')}
                    sx={{ textTransform: 'none' }}
                  >
                    Voir tout
                  </Button>
                </Box>

                {/* Stats bars */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Impressions réussies
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stats.impressions.terminees || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        stats.impressions.total
                          ? ((stats.impressions.terminees || 0) / stats.impressions.total) * 100
                          : 100
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha('#10b981', 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Avec encodage NFC
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stats.impressions.avec_nfc || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        stats.impressions.total
                          ? ((stats.impressions.avec_nfc || 0) / stats.impressions.total) * 100
                          : 0
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha('#6366f1', 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Erreurs
                      </Typography>
                      <Typography variant="body2" fontWeight={600} color="error.main">
                        {stats.impressions.erreurs || 0}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        stats.impressions.total
                          ? ((stats.impressions.erreurs || 0) / stats.impressions.total) * 100
                          : 0
                      }
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha('#ef4444', 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}

export default PageAccueil;
