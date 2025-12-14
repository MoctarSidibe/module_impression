import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Typography,
  InputAdornment,
  Avatar,
  Chip,
  Tooltip,
  Skeleton,
  alpha,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { DataGrid, frFR } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PhotoCamera as PhotoCameraIcon,
  Print as PrintIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarMonth as CalendarIcon,
  Home as HomeIcon,
  CreditCard as CardIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { utilisateursApi } from '../services/api';

function PageUtilisateurs() {
  const navigate = useNavigate();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [dialogOuvert, setDialogOuvert] = useState(false);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    date_naissance: '',
    lieu_naissance: '',
    adresse: '',
    ville: '',
    code_postal: '',
    numero_carte: '',
    numero_permis: '',
    categorie_permis: '',
    date_delivrance: '',
    date_expiration: '',
  });

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = async () => {
    setLoading(true);
    try {
      const response = await utilisateursApi.getAll();
      setUtilisateurs(response.donnees || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleRecherche = async (e) => {
    const terme = e.target.value;
    setRecherche(terme);

    if (terme.length >= 2) {
      try {
        const response = await utilisateursApi.rechercher(terme);
        setUtilisateurs(response.donnees || []);
      } catch (error) {
        console.error('Erreur recherche:', error);
      }
    } else if (terme.length === 0) {
      chargerUtilisateurs();
    }
  };

  const ouvrirDialog = (utilisateur = null) => {
    if (utilisateur) {
      setUtilisateurSelectionne(utilisateur);
      setFormData({ ...utilisateur });
    } else {
      setUtilisateurSelectionne(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        date_naissance: '',
        lieu_naissance: '',
        adresse: '',
        ville: '',
        code_postal: '',
        numero_carte: '',
        numero_permis: '',
        categorie_permis: '',
        date_delivrance: '',
        date_expiration: '',
      });
    }
    setTabValue(0);
    setDialogOuvert(true);
  };

  const fermerDialog = () => {
    setDialogOuvert(false);
    setUtilisateurSelectionne(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (utilisateurSelectionne) {
        await utilisateursApi.mettreAJour(utilisateurSelectionne.id, formData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await utilisateursApi.creer(formData);
        toast.success('Utilisateur créé avec succès');
      }
      fermerDialog();
      chargerUtilisateurs();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleSupprimer = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await utilisateursApi.supprimer(id);
        toast.success('Utilisateur supprimé');
        chargerUtilisateurs();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleImprimer = (utilisateur) => {
    navigate('/impression', { state: { utilisateur } });
  };

  const columns = [
    {
      field: 'photo',
      headerName: '',
      width: 60,
      sortable: false,
      renderCell: (params) => (
        <Avatar
          src={params.row.photo_url}
          sx={{
            width: 40,
            height: 40,
            bgcolor: alpha('#6366f1', 0.2),
            color: 'primary.main',
            fontWeight: 600,
          }}
        >
          {params.row.prenom?.[0]}
          {params.row.nom?.[0]}
        </Avatar>
      ),
    },
    {
      field: 'numero_carte',
      headerName: 'N° Carte',
      width: 140,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={params.value}
            size="small"
            sx={{
              fontFamily: 'monospace',
              bgcolor: alpha('#6366f1', 0.1),
              color: 'primary.main',
            }}
          />
        ) : (
          <Typography variant="caption" color="text.disabled">
            Non défini
          </Typography>
        ),
    },
    {
      field: 'nom',
      headerName: 'Nom',
      width: 140,
      renderCell: (params) => (
        <Typography fontWeight={600}>{params.value?.toUpperCase()}</Typography>
      ),
    },
    { field: 'prenom', headerName: 'Prénom', width: 130 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'telephone', headerName: 'Téléphone', width: 130 },
    {
      field: 'categorie_permis',
      headerName: 'Permis',
      width: 100,
      renderCell: (params) =>
        params.value ? (
          <Chip
            label={params.value}
            size="small"
            color="success"
            variant="outlined"
          />
        ) : null,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Imprimer">
            <IconButton
              size="small"
              onClick={() => handleImprimer(params.row)}
              sx={{
                color: 'success.main',
                '&:hover': { bgcolor: alpha('#10b981', 0.1) },
              }}
            >
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => ouvrirDialog(params.row)}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: alpha('#6366f1', 0.1) },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              onClick={() => handleSupprimer(params.row.id)}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: alpha('#ef4444', 0.1) },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
            Utilisateurs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gérez les personnes pour l'impression de cartes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => ouvrirDialog()}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            px: 3,
          }}
        >
          Nouvel Utilisateur
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {utilisateurs.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total utilisateurs
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
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
                <BadgeIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {utilisateurs.filter((u) => u.numero_carte).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avec N° carte
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CardIcon sx={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  {utilisateurs.filter((u) => u.numero_permis).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Avec permis
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Rechercher par nom, prénom, email ou numéro de carte..."
            value={recherche}
            onChange={handleRecherche}
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
            rows={utilisateurs}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            loading={loading}
            disableSelectionOnClick
            localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
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

      {/* Dialog */}
      <Dialog
        open={dialogOuvert}
        onClose={fermerDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {utilisateurSelectionne ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </Typography>
          </Box>
          <IconButton onClick={fermerDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<PersonIcon />} label="Identité" iconPosition="start" />
            <Tab icon={<HomeIcon />} label="Coordonnées" iconPosition="start" />
            <Tab icon={<CardIcon />} label="Permis" iconPosition="start" />
          </Tabs>

          {tabValue === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="N° Carte"
                  name="numero_carte"
                  value={formData.numero_carte}
                  onChange={handleChange}
                  placeholder="Ex: FR-2024-001"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de naissance"
                  name="date_naissance"
                  type="date"
                  value={formData.date_naissance}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Lieu de naissance"
                  name="lieu_naissance"
                  value={formData.lieu_naissance}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}

          {tabValue === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HomeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Ville"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Code postal"
                  name="code_postal"
                  value={formData.code_postal}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}

          {tabValue === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="N° Permis"
                  name="numero_permis"
                  value={formData.numero_permis}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CardIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Catégorie"
                  name="categorie_permis"
                  value={formData.categorie_permis}
                  onChange={handleChange}
                  placeholder="Ex: B, A2, C"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de délivrance"
                  name="date_delivrance"
                  type="date"
                  value={formData.date_delivrance}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date d'expiration"
                  name="date_expiration"
                  type="date"
                  value={formData.date_expiration}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={fermerDialog} variant="outlined">
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {utilisateurSelectionne ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PageUtilisateurs;
