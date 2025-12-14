import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Tooltip,
  Grid,
  alpha,
  Avatar,
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Nfc as NfcIcon,
  TrendingUp as TrendingUpIcon,
  Today as TodayIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { impressionApi } from '../services/api';

const MotionCard = motion(Card);

function PageHistorique() {
  const [impressions, setImpressions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    chargerImpressions();
  }, []);

  const chargerImpressions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await impressionApi.getHistorique(200);
      setImpressions(response.donnees || []);
    } catch (error) {
      toast.error("Erreur lors du chargement de l'historique");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReimprimer = async (id) => {
    try {
      await impressionApi.reimprimer(id);
      toast.success('Réimpression lancée');
    } catch (error) {
      toast.error('Erreur lors de la réimpression');
    }
  };

  const getStatutChip = (statut) => {
    const configs = {
      termine: {
        icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
        label: 'Terminé',
        color: 'success',
        bgcolor: alpha('#10b981', 0.1),
        borderColor: alpha('#10b981', 0.3),
      },
      erreur: {
        icon: <ErrorIcon sx={{ fontSize: 16 }} />,
        label: 'Erreur',
        color: 'error',
        bgcolor: alpha('#ef4444', 0.1),
        borderColor: alpha('#ef4444', 0.3),
      },
      en_attente: {
        icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
        label: 'En attente',
        color: 'warning',
        bgcolor: alpha('#f59e0b', 0.1),
        borderColor: alpha('#f59e0b', 0.3),
      },
      en_cours: {
        icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
        label: 'En cours',
        color: 'info',
        bgcolor: alpha('#3b82f6', 0.1),
        borderColor: alpha('#3b82f6', 0.3),
      },
    };

    const config = configs[statut] || configs.en_attente;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgcolor,
          border: '1px solid',
          borderColor: config.borderColor,
          color: `${config.color}.main`,
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: 'inherit',
          },
        }}
      />
    );
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          #{params.value}
        </Typography>
      ),
    },
    {
      field: 'date_impression',
      headerName: 'Date',
      width: 170,
      renderCell: (params) => {
        if (!params.value) return '';
        const date = new Date(params.value);
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {date.toLocaleDateString('fr-FR')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'utilisateur',
      headerName: 'Utilisateur',
      width: 200,
      renderCell: (params) => {
        const nom = params.row.utilisateur_nom || '';
        const prenom = params.row.utilisateur_prenom || '';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha('#6366f1', 0.2),
                color: 'primary.main',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {prenom[0]}{nom[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {prenom} {nom}
              </Typography>
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'template_nom',
      headerName: 'Template',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.value || 'N/A'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 500 }}
        />
      ),
    },
    {
      field: 'statut',
      headerName: 'Statut',
      width: 130,
      renderCell: (params) => getStatutChip(params.value),
    },
    {
      field: 'nfc_encode',
      headerName: 'NFC',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title={params.value ? 'Encodage NFC effectué' : 'Sans encodage NFC'}>
          <NfcIcon
            sx={{
              color: params.value ? 'success.main' : 'text.disabled',
              fontSize: 20,
            }}
          />
        </Tooltip>
      ),
    },
    {
      field: 'imprimante',
      headerName: 'Imprimante',
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || 'Luca 40 KM'}
        </Typography>
      ),
    },
    {
      field: 'erreur',
      headerName: 'Erreur',
      width: 200,
      renderCell: (params) =>
        params.value ? (
          <Tooltip title={params.value}>
            <Typography
              variant="body2"
              color="error"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 180,
              }}
            >
              {params.value}
            </Typography>
          </Tooltip>
        ) : null,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Réimprimer">
          <span>
            <IconButton
              size="small"
              onClick={() => handleReimprimer(params.row.id)}
              disabled={!params.row.pdf_chemin}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#6366f1', 0.1) },
                '&.Mui-disabled': { color: 'text.disabled' },
              }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  const impressionsFiltrees = recherche
    ? impressions.filter(
        (imp) =>
          imp.utilisateur_nom?.toLowerCase().includes(recherche.toLowerCase()) ||
          imp.utilisateur_prenom?.toLowerCase().includes(recherche.toLowerCase()) ||
          imp.template_nom?.toLowerCase().includes(recherche.toLowerCase())
      )
    : impressions;

  // Stats
  const stats = {
    total: impressions.length,
    terminees: impressions.filter((i) => i.statut === 'termine').length,
    erreurs: impressions.filter((i) => i.statut === 'erreur').length,
    avecNfc: impressions.filter((i) => i.nfc_encode).length,
    aujourdhui: impressions.filter((i) => {
      const date = new Date(i.date_impression);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    }).length,
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Historique des Impressions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Consultez et gérez l'historique de toutes les impressions
          </Typography>
        </Box>
        <Tooltip title="Actualiser">
          <IconButton
            onClick={() => chargerImpressions(true)}
            disabled={refreshing}
            sx={{
              bgcolor: alpha('#6366f1', 0.1),
              '&:hover': { bgcolor: alpha('#6366f1', 0.2) },
            }}
          >
            <RefreshIcon
              sx={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  from: { transform: 'rotate(0deg)' },
                  to: { transform: 'rotate(360deg)' },
                },
              }}
            />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2.4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <CardContent sx={{ py: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <PrintIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardContent sx={{ py: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <CheckCircleIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="success.main">
                {stats.terminees}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Réussies
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardContent sx={{ py: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <WarningIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="error.main">
                {stats.erreurs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Erreurs
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CardContent sx={{ py: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <NfcIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="info.main">
                {stats.avecNfc}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avec NFC
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={6} sm={4} md={2.4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CardContent sx={{ py: 2, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <TodayIcon sx={{ color: 'white', fontSize: 20 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} color="warning.main">
                {stats.aujourdhui}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aujourd'hui
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Rechercher par nom, prénom ou template..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={impressionsFiltrees}
            columns={columns}
            pageSize={25}
            rowsPerPageOptions={[25, 50, 100]}
            autoHeight
            loading={loading}
            disableSelectionOnClick
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
            initialState={{
              sorting: {
                sortModel: [{ field: 'date_impression', sort: 'desc' }],
              },
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: 'rgba(148, 163, 184, 0.1)',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: alpha('#6366f1', 0.05),
                borderBottom: '2px solid',
                borderColor: alpha('#6366f1', 0.2),
              },
              '& .MuiDataGrid-row:hover': {
                bgcolor: alpha('#6366f1', 0.03),
              },
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default PageHistorique;
