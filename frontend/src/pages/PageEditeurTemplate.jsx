import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Collapse,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  alpha,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  CropSquare as RectangleIcon,
  Circle as CircleIcon,
  QrCode as QrCodeIcon,
  CreditCard as CardIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  DateRange as DateIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Fingerprint as FingerprintIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  GridOn as GridIcon,
  FlipToFront as FlipIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { SketchPicker } from 'react-color';
import { toast } from 'react-toastify';
import { templatesApi } from '../services/api';

// Dimensions carte CR80 en mm et pixels (300 DPI)
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 53.98;
const DPI = 300;
const MM_TO_PX = DPI / 25.4;
const CARD_WIDTH_PX = Math.round(CARD_WIDTH_MM * MM_TO_PX);
const CARD_HEIGHT_PX = Math.round(CARD_HEIGHT_MM * MM_TO_PX);

// Variables dynamiques disponibles
const DYNAMIC_VARIABLES = [
  { id: 'nom', label: 'Nom', icon: <PersonIcon />, example: 'DUPONT' },
  { id: 'prenom', label: 'Prénom', icon: <PersonIcon />, example: 'Jean' },
  { id: 'photo_url', label: 'Photo', icon: <ImageIcon />, example: '/photo.jpg' },
  { id: 'numero_carte', label: 'N° Carte', icon: <BadgeIcon />, example: 'FR-2024-001' },
  { id: 'date_naissance', label: 'Date de naissance', icon: <DateIcon />, example: '15/03/1985' },
  { id: 'lieu_naissance', label: 'Lieu de naissance', icon: <HomeIcon />, example: 'Paris' },
  { id: 'email', label: 'Email', icon: <EmailIcon />, example: 'jean@email.fr' },
  { id: 'telephone', label: 'Téléphone', icon: <PhoneIcon />, example: '06 12 34 56 78' },
  { id: 'adresse', label: 'Adresse', icon: <HomeIcon />, example: '15 Rue de la République' },
  { id: 'ville', label: 'Ville', icon: <HomeIcon />, example: 'Lyon' },
  { id: 'code_postal', label: 'Code postal', icon: <HomeIcon />, example: '69001' },
  { id: 'numero_permis', label: 'N° Permis', icon: <CardIcon />, example: '12AB34567' },
  { id: 'categorie_permis', label: 'Catégorie permis', icon: <CardIcon />, example: 'B' },
  { id: 'date_delivrance', label: 'Date délivrance', icon: <DateIcon />, example: '20/06/2010' },
  { id: 'date_expiration', label: 'Date expiration', icon: <DateIcon />, example: '20/06/2030' },
  { id: 'nfc_uid', label: 'UID NFC', icon: <FingerprintIcon />, example: 'A1B2C3D4' },
];

// Templates d'éléments prédéfinis
const ELEMENT_TEMPLATES = {
  text: {
    type: 'text',
    content: 'Nouveau texte',
    x: 50,
    y: 50,
    width: 200,
    height: 30,
    fontSize: 14,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#000000',
    backgroundColor: 'transparent',
    borderRadius: 0,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
  dynamicText: {
    type: 'dynamicText',
    variable: 'nom',
    x: 50,
    y: 50,
    width: 200,
    height: 30,
    fontSize: 14,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    color: '#000000',
    backgroundColor: 'transparent',
    borderRadius: 0,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
  image: {
    type: 'image',
    src: '',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    borderRadius: 0,
    border: 'none',
    rotation: 0,
    opacity: 1,
    objectFit: 'cover',
    locked: false,
    visible: true,
  },
  photo: {
    type: 'photo',
    variable: 'photo_url',
    x: 20,
    y: 50,
    width: 90,
    height: 115,
    borderRadius: 4,
    border: '2px solid #cccccc',
    rotation: 0,
    opacity: 1,
    objectFit: 'cover',
    locked: false,
    visible: true,
  },
  rectangle: {
    type: 'rectangle',
    x: 50,
    y: 50,
    width: 150,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    border: 'none',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
  circle: {
    type: 'circle',
    x: 50,
    y: 50,
    width: 80,
    height: 80,
    backgroundColor: '#ec4899',
    border: 'none',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
  qrcode: {
    type: 'qrcode',
    variable: 'numero_carte',
    x: 250,
    y: 150,
    width: 60,
    height: 60,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
};

// Composant Element sur le canvas
const CanvasElement = ({
  element,
  selected,
  onSelect,
  onUpdate,
  scale,
  showGrid,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDown = (e) => {
    if (element.locked) return;
    e.stopPropagation();
    onSelect(element.id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x * scale,
      y: e.clientY - element.y * scale,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || element.locked) return;

      let newX = (e.clientX - dragStart.x) / scale;
      let newY = (e.clientY - dragStart.y) / scale;

      // Snap to grid if enabled
      if (showGrid) {
        newX = Math.round(newX / 10) * 10;
        newY = Math.round(newY / 10) * 10;
      }

      onUpdate(element.id, {
        x: Math.max(0, Math.min(newX, CARD_WIDTH_PX - element.width)),
        y: Math.max(0, Math.min(newY, CARD_HEIGHT_PX - element.height)),
      });
    },
    [isDragging, dragStart, scale, showGrid, element, onUpdate]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove]);

  const getElementStyle = () => {
    const baseStyle = {
      position: 'absolute',
      left: element.x * scale,
      top: element.y * scale,
      width: element.width * scale,
      height: element.height * scale,
      transform: `rotate(${element.rotation || 0}deg)`,
      opacity: element.opacity,
      cursor: element.locked ? 'not-allowed' : 'move',
      outline: selected ? '2px solid #6366f1' : 'none',
      outlineOffset: 2,
      boxShadow: selected ? '0 0 0 4px rgba(99, 102, 241, 0.2)' : 'none',
      display: element.visible ? 'block' : 'none',
      userSelect: 'none',
    };

    switch (element.type) {
      case 'text':
      case 'dynamicText':
        return {
          ...baseStyle,
          fontSize: element.fontSize * scale,
          fontFamily: element.fontFamily,
          fontWeight: element.fontWeight,
          fontStyle: element.fontStyle,
          textDecoration: element.textDecoration,
          textAlign: element.textAlign,
          color: element.color,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius * scale,
          display: element.visible ? 'flex' : 'none',
          alignItems: 'center',
          padding: '0 4px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        };
      case 'image':
      case 'photo':
        return {
          ...baseStyle,
          borderRadius: element.borderRadius * scale,
          border: element.border,
          overflow: 'hidden',
        };
      case 'rectangle':
        return {
          ...baseStyle,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius * scale,
          border: element.border,
        };
      case 'circle':
        return {
          ...baseStyle,
          backgroundColor: element.backgroundColor,
          borderRadius: '50%',
          border: element.border,
        };
      case 'qrcode':
        return {
          ...baseStyle,
          backgroundColor: element.backgroundColor,
          borderRadius: 4 * scale,
          display: element.visible ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        };
      default:
        return baseStyle;
    }
  };

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return element.content;
      case 'dynamicText':
        const variable = DYNAMIC_VARIABLES.find((v) => v.id === element.variable);
        return `{{${element.variable}}}`;
      case 'image':
        return element.src ? (
          <img
            src={element.src}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: element.objectFit }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: 'rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ImageIcon sx={{ color: 'rgba(0,0,0,0.3)' }} />
          </Box>
        );
      case 'photo':
        return (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              bgcolor: '#e0e0e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}
          >
            <PersonIcon sx={{ fontSize: 32, color: '#999' }} />
            <Typography variant="caption" sx={{ color: '#999', fontSize: 8 * scale }}>
              PHOTO
            </Typography>
          </Box>
        );
      case 'qrcode':
        return (
          <Box
            sx={{
              width: '80%',
              height: '80%',
              bgcolor: '#fff',
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(5, 1fr)',
              gap: '2%',
              p: '10%',
            }}
          >
            {[...Array(25)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  bgcolor: Math.random() > 0.5 ? element.foregroundColor : 'transparent',
                }}
              />
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box
      ref={elementRef}
      sx={getElementStyle()}
      onMouseDown={handleMouseDown}
    >
      {renderContent()}
      {selected && !element.locked && (
        <>
          {/* Resize handles */}
          {['nw', 'ne', 'sw', 'se'].map((pos) => (
            <Box
              key={pos}
              className="resize-handle"
              sx={{
                position: 'absolute',
                width: 10,
                height: 10,
                bgcolor: '#6366f1',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: `${pos}-resize`,
                ...(pos.includes('n') ? { top: -5 } : { bottom: -5 }),
                ...(pos.includes('w') ? { left: -5 } : { right: -5 }),
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
};

// Panel de propriétés
const PropertiesPanel = ({ element, onUpdate, onDelete }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(null);

  if (!element) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez un élément pour modifier ses propriétés
        </Typography>
      </Box>
    );
  }

  const renderColorPicker = (field, label) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Box
        onClick={() => setColorPickerOpen(colorPickerOpen === field ? null : field)}
        sx={{
          width: '100%',
          height: 36,
          borderRadius: 1,
          bgcolor: element[field] || 'transparent',
          border: '2px solid rgba(148, 163, 184, 0.3)',
          cursor: 'pointer',
          position: 'relative',
        }}
      />
      {colorPickerOpen === field && (
        <Box sx={{ position: 'absolute', zIndex: 1000, mt: 1 }}>
          <Box
            sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            onClick={() => setColorPickerOpen(null)}
          />
          <SketchPicker
            color={element[field] || '#000000'}
            onChange={(color) => onUpdate(element.id, { [field]: color.hex })}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Position */}
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Position
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="X"
            type="number"
            size="small"
            fullWidth
            value={Math.round(element.x)}
            onChange={(e) => onUpdate(element.id, { x: Number(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Y"
            type="number"
            size="small"
            fullWidth
            value={Math.round(element.y)}
            onChange={(e) => onUpdate(element.id, { y: Number(e.target.value) })}
          />
        </Grid>
      </Grid>

      {/* Taille */}
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Taille
      </Typography>
      <Grid container spacing={1} sx={{ mb: 2 }}>
        <Grid item xs={6}>
          <TextField
            label="Largeur"
            type="number"
            size="small"
            fullWidth
            value={Math.round(element.width)}
            onChange={(e) => onUpdate(element.id, { width: Number(e.target.value) })}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Hauteur"
            type="number"
            size="small"
            fullWidth
            value={Math.round(element.height)}
            onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
          />
        </Grid>
      </Grid>

      {/* Propriétés texte */}
      {(element.type === 'text' || element.type === 'dynamicText') && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Texte
          </Typography>

          {element.type === 'text' && (
            <TextField
              label="Contenu"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={element.content}
              onChange={(e) => onUpdate(element.id, { content: e.target.value })}
              sx={{ mb: 2 }}
            />
          )}

          {element.type === 'dynamicText' && (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Variable</InputLabel>
              <Select
                value={element.variable}
                label="Variable"
                onChange={(e) => onUpdate(element.id, { variable: e.target.value })}
              >
                {DYNAMIC_VARIABLES.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {v.icon}
                      {v.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Police</InputLabel>
                <Select
                  value={element.fontFamily}
                  label="Police"
                  onChange={(e) => onUpdate(element.id, { fontFamily: e.target.value })}
                >
                  <MenuItem value="Arial">Arial</MenuItem>
                  <MenuItem value="Helvetica">Helvetica</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman</MenuItem>
                  <MenuItem value="Courier New">Courier New</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Taille"
                type="number"
                size="small"
                fullWidth
                value={element.fontSize}
                onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
            <IconButton
              size="small"
              onClick={() =>
                onUpdate(element.id, {
                  fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              sx={{
                bgcolor: element.fontWeight === 'bold' ? 'primary.main' : 'transparent',
                color: element.fontWeight === 'bold' ? 'white' : 'text.secondary',
              }}
            >
              <BoldIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                onUpdate(element.id, {
                  fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              sx={{
                bgcolor: element.fontStyle === 'italic' ? 'primary.main' : 'transparent',
                color: element.fontStyle === 'italic' ? 'white' : 'text.secondary',
              }}
            >
              <ItalicIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() =>
                onUpdate(element.id, {
                  textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              sx={{
                bgcolor: element.textDecoration === 'underline' ? 'primary.main' : 'transparent',
                color: element.textDecoration === 'underline' ? 'white' : 'text.secondary',
              }}
            >
              <UnderlineIcon fontSize="small" />
            </IconButton>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <IconButton
              size="small"
              onClick={() => onUpdate(element.id, { textAlign: 'left' })}
              sx={{
                bgcolor: element.textAlign === 'left' ? 'primary.main' : 'transparent',
                color: element.textAlign === 'left' ? 'white' : 'text.secondary',
              }}
            >
              <AlignLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onUpdate(element.id, { textAlign: 'center' })}
              sx={{
                bgcolor: element.textAlign === 'center' ? 'primary.main' : 'transparent',
                color: element.textAlign === 'center' ? 'white' : 'text.secondary',
              }}
            >
              <AlignCenterIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onUpdate(element.id, { textAlign: 'right' })}
              sx={{
                bgcolor: element.textAlign === 'right' ? 'primary.main' : 'transparent',
                color: element.textAlign === 'right' ? 'white' : 'text.secondary',
              }}
            >
              <AlignRightIcon fontSize="small" />
            </IconButton>
          </Box>

          {renderColorPicker('color', 'Couleur du texte')}
        </>
      )}

      {/* Couleurs pour formes */}
      {(element.type === 'rectangle' || element.type === 'circle') && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Apparence
          </Typography>
          {renderColorPicker('backgroundColor', 'Couleur de fond')}
          <TextField
            label="Rayon de bordure"
            type="number"
            size="small"
            fullWidth
            value={element.borderRadius || 0}
            onChange={(e) => onUpdate(element.id, { borderRadius: Number(e.target.value) })}
            sx={{ mb: 2 }}
          />
        </>
      )}

      {/* Opacité et rotation */}
      <Divider sx={{ my: 2 }} />
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Transformation
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Opacité: {Math.round(element.opacity * 100)}%
        </Typography>
        <Slider
          value={element.opacity}
          min={0}
          max={1}
          step={0.1}
          onChange={(_, value) => onUpdate(element.id, { opacity: value })}
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Rotation: {element.rotation || 0}°
        </Typography>
        <Slider
          value={element.rotation || 0}
          min={0}
          max={360}
          onChange={(_, value) => onUpdate(element.id, { rotation: value })}
        />
      </Box>

      {/* Actions */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Tooltip title="Dupliquer">
          <IconButton size="small">
            <CopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={element.locked ? 'Déverrouiller' : 'Verrouiller'}>
          <IconButton
            size="small"
            onClick={() => onUpdate(element.id, { locked: !element.locked })}
          >
            {element.locked ? <LockIcon /> : <UnlockIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={element.visible ? 'Masquer' : 'Afficher'}>
          <IconButton
            size="small"
            onClick={() => onUpdate(element.id, { visible: !element.visible })}
          >
            {element.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton size="small" color="error" onClick={() => onDelete(element.id)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// Composant principal de l'éditeur
function PageEditeurTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [templateName, setTemplateName] = useState('Nouveau Template');
  const [templateType, setTemplateType] = useState('carte_identite');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFace, setActiveFace] = useState('recto');
  const [elementsVerso, setElementsVerso] = useState([]);
  const [scale, setScale] = useState(0.5);
  const [showGrid, setShowGrid] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const currentElements = activeFace === 'recto' ? elements : elementsVerso;
  const setCurrentElements = activeFace === 'recto' ? setElements : setElementsVerso;
  const selectedElement = currentElements.find((el) => el.id === selectedId);

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  const loadTemplate = async (templateId) => {
    try {
      const response = await templatesApi.getById(templateId);
      if (response.succes) {
        const template = response.donnees;
        setTemplateName(template.nom);
        setTemplateType(template.type);
        // Parse elements from HTML if stored
        // For now, start fresh
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du template');
    }
  };

  const addElement = (type) => {
    const template = ELEMENT_TEMPLATES[type];
    if (!template) return;

    const newElement = {
      ...template,
      id: uuidv4(),
      x: 50 + Math.random() * 100,
      y: 50 + Math.random() * 100,
    };

    setCurrentElements([...currentElements, newElement]);
    setSelectedId(newElement.id);
  };

  const updateElement = (id, updates) => {
    setCurrentElements(
      currentElements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const deleteElement = (id) => {
    setCurrentElements(currentElements.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedId(null);
    }
  };

  const generateHtml = () => {
    let html = `<div style="position: relative; width: 100%; height: 100%;">`;

    currentElements.forEach((el) => {
      if (!el.visible) return;

      const style = `
        position: absolute;
        left: ${(el.x / CARD_WIDTH_PX) * 100}%;
        top: ${(el.y / CARD_HEIGHT_PX) * 100}%;
        width: ${(el.width / CARD_WIDTH_PX) * 100}%;
        height: ${(el.height / CARD_HEIGHT_PX) * 100}%;
        transform: rotate(${el.rotation || 0}deg);
        opacity: ${el.opacity};
      `;

      switch (el.type) {
        case 'text':
          html += `<div style="${style}; font-size: ${el.fontSize}pt; font-family: ${el.fontFamily}; font-weight: ${el.fontWeight}; font-style: ${el.fontStyle}; text-decoration: ${el.textDecoration}; text-align: ${el.textAlign}; color: ${el.color}; background-color: ${el.backgroundColor}; border-radius: ${el.borderRadius}px; display: flex; align-items: center;">${el.content}</div>`;
          break;
        case 'dynamicText':
          html += `<div style="${style}; font-size: ${el.fontSize}pt; font-family: ${el.fontFamily}; font-weight: ${el.fontWeight}; font-style: ${el.fontStyle}; text-decoration: ${el.textDecoration}; text-align: ${el.textAlign}; color: ${el.color}; background-color: ${el.backgroundColor}; border-radius: ${el.borderRadius}px; display: flex; align-items: center;">{{${el.variable}}}</div>`;
          break;
        case 'photo':
          html += `<div style="${style}; border-radius: ${el.borderRadius}px; border: ${el.border}; overflow: hidden;">{{#if photo_url}}<img src="{{photo_url}}" style="width: 100%; height: 100%; object-fit: cover;" />{{else}}<div style="width: 100%; height: 100%; background: #e0e0e0; display: flex; align-items: center; justify-content: center; color: #999;">PHOTO</div>{{/if}}</div>`;
          break;
        case 'rectangle':
          html += `<div style="${style}; background-color: ${el.backgroundColor}; border-radius: ${el.borderRadius}px; border: ${el.border || 'none'};"></div>`;
          break;
        case 'circle':
          html += `<div style="${style}; background-color: ${el.backgroundColor}; border-radius: 50%; border: ${el.border || 'none'};"></div>`;
          break;
      }
    });

    html += '</div>';
    return html;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const templateData = {
        nom: templateName,
        type: templateType,
        largeur_mm: CARD_WIDTH_MM,
        hauteur_mm: CARD_HEIGHT_MM,
        html_recto: generateHtml(),
        html_verso: activeFace === 'verso' || elementsVerso.length > 0 ? generateHtml() : null,
        champs_dynamiques: [...new Set(currentElements.filter(el => el.type === 'dynamicText').map(el => el.variable))],
      };

      if (id) {
        await templatesApi.mettreAJour(id, templateData);
        toast.success('Template mis à jour avec succès');
      } else {
        const response = await templatesApi.creer(templateData);
        toast.success('Template créé avec succès');
        navigate(`/editeur/${response.donnees.id}`);
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)', overflow: 'hidden', mx: -3, mt: -3 }}>
      {/* Left Panel - Elements Library */}
      <Paper
        sx={{
          width: leftPanelOpen ? 280 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Box className="panel-header">
          <LayersIcon sx={{ fontSize: 20 }} />
          Éléments
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Texte
          </Typography>
          <Box
            className="element-library-item"
            onClick={() => addElement('text')}
            sx={{ mb: 1 }}
          >
            <TextFieldsIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2">Texte statique</Typography>
          </Box>
          <Box
            className="element-library-item"
            onClick={() => addElement('dynamicText')}
            sx={{ mb: 2 }}
          >
            <BadgeIcon sx={{ color: 'secondary.main' }} />
            <Typography variant="body2">Champ dynamique</Typography>
          </Box>

          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Images
          </Typography>
          <Box
            className="element-library-item"
            onClick={() => addElement('photo')}
            sx={{ mb: 1 }}
          >
            <PersonIcon sx={{ color: 'info.main' }} />
            <Typography variant="body2">Photo d'identité</Typography>
          </Box>
          <Box
            className="element-library-item"
            onClick={() => addElement('image')}
            sx={{ mb: 2 }}
          >
            <ImageIcon sx={{ color: 'success.main' }} />
            <Typography variant="body2">Image / Logo</Typography>
          </Box>

          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Formes
          </Typography>
          <Box
            className="element-library-item"
            onClick={() => addElement('rectangle')}
            sx={{ mb: 1 }}
          >
            <RectangleIcon sx={{ color: '#3b82f6' }} />
            <Typography variant="body2">Rectangle</Typography>
          </Box>
          <Box
            className="element-library-item"
            onClick={() => addElement('circle')}
            sx={{ mb: 2 }}
          >
            <CircleIcon sx={{ color: '#ec4899' }} />
            <Typography variant="body2">Cercle</Typography>
          </Box>

          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Codes
          </Typography>
          <Box
            className="element-library-item"
            onClick={() => addElement('qrcode')}
          >
            <QrCodeIcon sx={{ color: '#10b981' }} />
            <Typography variant="body2">QR Code</Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Variables disponibles
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {DYNAMIC_VARIABLES.slice(0, 8).map((v) => (
              <Chip
                key={v.id}
                label={v.label}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Center - Canvas */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#0a0a1a' }}>
        {/* Toolbar */}
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            borderRadius: 0,
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Retour">
              <IconButton onClick={() => navigate('/templates')}>
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <TextField
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              variant="standard"
              sx={{
                '& input': { fontSize: '1.1rem', fontWeight: 600 },
                width: 200,
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Annuler">
              <IconButton size="small">
                <UndoIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rétablir">
              <IconButton size="small">
                <RedoIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title="Zoom arrière">
              <IconButton size="small" onClick={() => setScale(Math.max(0.2, scale - 0.1))}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center' }}>
              {Math.round(scale * 100)}%
            </Typography>
            <Tooltip title="Zoom avant">
              <IconButton size="small" onClick={() => setScale(Math.min(2, scale + 0.1))}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Tooltip title={showGrid ? 'Masquer grille' : 'Afficher grille'}>
              <IconButton
                size="small"
                onClick={() => setShowGrid(!showGrid)}
                sx={{ color: showGrid ? 'primary.main' : 'text.secondary' }}
              >
                <GridIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tabs
              value={activeFace}
              onChange={(_, v) => setActiveFace(v)}
              sx={{ minHeight: 36 }}
            >
              <Tab label="Recto" value="recto" sx={{ minHeight: 36, py: 0 }} />
              <Tab label="Verso" value="verso" sx={{ minHeight: 36, py: 0 }} />
            </Tabs>
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              size="small"
            >
              Aperçu
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              size="small"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </Box>
        </Paper>

        {/* Canvas Area */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}
        >
          <Paper
            ref={canvasRef}
            onClick={handleCanvasClick}
            sx={{
              width: CARD_WIDTH_PX * scale,
              height: CARD_HEIGHT_PX * scale,
              bgcolor: 'white',
              borderRadius: 2,
              position: 'relative',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              overflow: 'hidden',
              backgroundImage: showGrid
                ? `
                  linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
                `
                : 'none',
              backgroundSize: `${10 * scale}px ${10 * scale}px`,
            }}
          >
            {currentElements.map((element) => (
              <CanvasElement
                key={element.id}
                element={element}
                selected={selectedId === element.id}
                onSelect={setSelectedId}
                onUpdate={updateElement}
                scale={scale}
                showGrid={showGrid}
              />
            ))}
          </Paper>
        </Box>

        {/* Footer info */}
        <Box
          sx={{
            px: 2,
            py: 1,
            borderTop: '1px solid rgba(148, 163, 184, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Format: CR80 ({CARD_WIDTH_MM}mm × {CARD_HEIGHT_MM}mm) • 300 DPI
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentElements.length} élément{currentElements.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Box>

      {/* Right Panel - Properties */}
      <Paper
        sx={{
          width: rightPanelOpen ? 300 : 0,
          overflow: 'hidden',
          transition: 'width 0.3s',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          borderLeft: '1px solid rgba(148, 163, 184, 0.1)',
        }}
      >
        <Box className="panel-header">
          <SettingsIcon sx={{ fontSize: 20 }} />
          Propriétés
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <PropertiesPanel
            element={selectedElement}
            onUpdate={updateElement}
            onDelete={deleteElement}
          />
        </Box>
      </Paper>
    </Box>
  );
}

export default PageEditeurTemplate;
