import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Skeleton,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CreditCard as CardIcon,
  DriveFileRenameOutline as PermisIcon,
  Badge as BadgeIcon,
  School as SchoolIcon,
  CardMembership as MemberIcon,
  Key as KeyIcon,
  Category as CategoryIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { templatesApi } from '../services/api';

// Templates pré-construits professionnels
const PREBUILT_TEMPLATES = [
  {
    id: 'preset-1',
    nom: 'Permis de Conduire EU',
    description: 'Modèle officiel européen avec hologramme',
    type: 'permis_conduire',
    preview: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e3a8a 100%)',
    featured: true,
    tags: ['Officiel', 'Sécurisé'],
  },
  {
    id: 'preset-2',
    nom: 'Badge Corporate Premium',
    description: 'Design épuré pour entreprise moderne',
    type: 'badge_employe',
    preview: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    featured: true,
    tags: ['Professionnel', 'Moderne'],
  },
  {
    id: 'preset-3',
    nom: 'Carte Étudiant Université',
    description: 'Format standard universitaire avec QR',
    type: 'carte_etudiant',
    preview: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    featured: false,
    tags: ['Éducation', 'QR Code'],
  },
  {
    id: 'preset-4',
    nom: 'Carte Membre VIP',
    description: 'Design luxueux avec dorure',
    type: 'carte_membre',
    preview: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)',
    featured: true,
    tags: ['Luxe', 'Premium'],
  },
  {
    id: 'preset-5',
    nom: 'Carte d\'Accès Sécurisé',
    description: 'Avec encodage NFC et bande magnétique',
    type: 'carte_acces',
    preview: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
    featured: false,
    tags: ['NFC', 'Sécurité'],
  },
  {
    id: 'preset-6',
    nom: 'Carte Identité Minimale',
    description: 'Design minimaliste et élégant',
    type: 'carte_identite',
    preview: 'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
    featured: false,
    tags: ['Minimal', 'Élégant'],
  },
];

const TYPE_ICONS = {
  carte_identite: <CardIcon />,
  permis_conduire: <PermisIcon />,
  badge_employe: <BadgeIcon />,
  carte_etudiant: <SchoolIcon />,
  carte_membre: <MemberIcon />,
  carte_acces: <KeyIcon />,
  autre: <CategoryIcon />,
};

const TYPE_LABELS = {
  carte_identite: "Carte d'identité",
  permis_conduire: 'Permis de conduire',
  badge_employe: 'Badge employé',
  carte_etudiant: 'Carte étudiant',
  carte_membre: 'Carte membre',
  carte_acces: "Carte d'accès",
  autre: 'Autre',
};

const TemplateCard = ({ template, isPreset, onEdit, onDelete, onDuplicate, onPreview }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'visible',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-8px)' : 'none',
          '&:hover': {
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
          },
        }}
      >
        {/* Preview */}
        <Box
          sx={{
            height: 160,
            background: template.preview || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '16px 16px 0 0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Card mockup */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '75%',
              height: '70%',
              bgcolor: 'rgba(255,255,255,0.95)',
              borderRadius: 2,
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              p: 1.5,
              gap: 1,
            }}
          >
            {/* Photo placeholder */}
            <Box
              sx={{
                width: 35,
                height: 45,
                bgcolor: '#e5e7eb',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: '#9ca3af',
                }}
              />
            </Box>
            {/* Text lines */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ height: 8, bgcolor: '#374151', borderRadius: 0.5, width: '80%' }} />
              <Box sx={{ height: 6, bgcolor: '#9ca3af', borderRadius: 0.5, width: '60%' }} />
              <Box sx={{ height: 6, bgcolor: '#d1d5db', borderRadius: 0.5, width: '70%' }} />
              <Box sx={{ flex: 1 }} />
              <Box sx={{ height: 5, bgcolor: '#e5e7eb', borderRadius: 0.5, width: '50%' }} />
            </Box>
          </Box>

          {/* Featured badge */}
          {template.featured && (
            <Chip
              icon={<StarIcon sx={{ fontSize: 14 }} />}
              label="Recommandé"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(251, 191, 36, 0.9)',
                color: '#78350f',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
          )}

          {/* Hover overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {isPreset ? (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => onDuplicate(template)}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    }}
                  >
                    Utiliser ce modèle
                  </Button>
                ) : (
                  <>
                    <Tooltip title="Modifier">
                      <IconButton
                        onClick={() => navigate(`/editeur/${template.id}`)}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Dupliquer">
                      <IconButton
                        onClick={() => onDuplicate(template)}
                        sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                      >
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        onClick={() => onDelete(template.id)}
                        sx={{ bgcolor: 'rgba(239,68,68,0.8)', color: 'white' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Content */}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: alpha('#6366f1', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                }}
              >
                {TYPE_ICONS[template.type] || <CardIcon />}
              </Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {template.nom}
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
            {template.description || 'Aucune description'}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip
              label={TYPE_LABELS[template.type] || template.type}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
            {template.tags?.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  fontSize: '0.7rem',
                  bgcolor: alpha('#6366f1', 0.1),
                  color: 'primary.main',
                }}
              />
            ))}
            {!isPreset && template.html_verso && (
              <Chip
                label="Recto/Verso"
                size="small"
                color="success"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function PageTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateType, setNewTemplateType] = useState('carte_identite');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await templatesApi.getAll();
      setTemplates(response.donnees || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setDialogOpen(true);
  };

  const handleConfirmCreate = () => {
    if (newTemplateName.trim()) {
      navigate('/editeur', {
        state: {
          name: newTemplateName,
          type: newTemplateType,
        },
      });
    }
    setDialogOpen(false);
    setNewTemplateName('');
  };

  const handleDuplicate = async (template) => {
    try {
      if (template.id.startsWith('preset-')) {
        // Pour les templates préfabriqués, créer un nouveau basé sur ce modèle
        navigate('/editeur', {
          state: {
            name: `${template.nom} (copie)`,
            type: template.type,
            preset: template.id,
          },
        });
      } else {
        await templatesApi.dupliquer(template.id);
        toast.success('Template dupliqué');
        loadTemplates();
      }
    } catch (error) {
      toast.error('Erreur lors de la duplication');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        await templatesApi.supprimer(id);
        toast.success('Template supprimé');
        loadTemplates();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const filteredTemplates = templates.filter((t) => {
    const matchSearch =
      t.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

  const filteredPresets = PREBUILT_TEMPLATES.filter((t) => {
    const matchSearch =
      t.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    return matchSearch && matchType;
  });

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
            Templates de Cartes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Créez et gérez vos modèles de cartes professionnelles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            px: 3,
          }}
        >
          Nouveau Template
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Rechercher un template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type de carte</InputLabel>
            <Select
              value={filterType}
              label="Type de carte"
              onChange={(e) => setFilterType(e.target.value)}
            >
              <MenuItem value="all">Tous les types</MenuItem>
              {Object.entries(TYPE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {TYPE_ICONS[key]}
                    {label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_, v) => setTabValue(v)}
        sx={{ mb: 3 }}
      >
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
              Modèles prédéfinis
              <Chip label={filteredPresets.length} size="small" />
            </Box>
          }
        />
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              Mes templates
              <Chip label={filteredTemplates.length} size="small" />
            </Box>
          }
        />
      </Tabs>

      {/* Content */}
      {tabValue === 0 && (
        <>
          {/* Featured */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#fbbf24' }} />
            Modèles recommandés
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {filteredPresets
              .filter((t) => t.featured)
              .map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <TemplateCard
                    template={template}
                    isPreset
                    onDuplicate={handleDuplicate}
                  />
                </Grid>
              ))}
          </Grid>

          {/* All presets */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Tous les modèles
          </Typography>
          <Grid container spacing={3}>
            {filteredPresets
              .filter((t) => !t.featured)
              .map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <TemplateCard
                    template={template}
                    isPreset
                    onDuplicate={handleDuplicate}
                  />
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={3}>
          {loading ? (
            [...Array(6)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card>
                  <Skeleton variant="rectangular" height={160} />
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Skeleton variant="rounded" width={80} height={24} />
                      <Skeleton variant="rounded" width={60} height={24} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <TemplateCard
                  template={template}
                  onEdit={() => navigate(`/editeur/${template.id}`)}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 8 }}>
                <CardContent>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha('#6366f1', 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <CardIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    Aucun template personnalisé
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Commencez par créer un nouveau template ou utilisez un modèle prédéfini
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={() => setTabValue(0)}
                    >
                      Voir les modèles
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateTemplate}
                    >
                      Créer un template
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Template</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nom du template"
              fullWidth
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Ex: Badge Employé 2024"
            />
            <FormControl fullWidth>
              <InputLabel>Type de carte</InputLabel>
              <Select
                value={newTemplateType}
                label="Type de carte"
                onChange={(e) => setNewTemplateType(e.target.value)}
              >
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {TYPE_ICONS[key]}
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleConfirmCreate}
            disabled={!newTemplateName.trim()}
          >
            Créer et éditer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PageTemplates;
