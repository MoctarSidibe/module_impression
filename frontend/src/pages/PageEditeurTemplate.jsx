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
  Tabs,
  Tab,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  CropSquare as RectangleIcon,
  Circle as CircleIcon,
  QrCode as QrCodeIcon,
  CreditCard as CardIcon,
  Layers as LayersIcon,
  Settings as SettingsIcon,
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
  Person as PersonIcon,
  Badge as BadgeIcon,
  DateRange as DateIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Fingerprint as FingerprintIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
  GridOn as GridIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DragIndicator as DragIcon,
  Palette as PaletteIcon,
  HorizontalRule as LineIcon,
  Gradient as GradientIcon,
  ViewWeek as BarcodeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
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
  { id: 'nom', label: 'Nom', icon: <PersonIcon fontSize="small" />, example: 'DUPONT' },
  { id: 'prenom', label: 'Prénom', icon: <PersonIcon fontSize="small" />, example: 'Jean' },
  { id: 'photo_url', label: 'Photo', icon: <ImageIcon fontSize="small" />, example: '/photo.jpg' },
  { id: 'numero_carte', label: 'N° Carte', icon: <BadgeIcon fontSize="small" />, example: 'FR-2024-001' },
  { id: 'date_naissance', label: 'Date de naissance', icon: <DateIcon fontSize="small" />, example: '15/03/1985' },
  { id: 'lieu_naissance', label: 'Lieu de naissance', icon: <HomeIcon fontSize="small" />, example: 'Paris' },
  { id: 'email', label: 'Email', icon: <EmailIcon fontSize="small" />, example: 'jean@email.fr' },
  { id: 'telephone', label: 'Téléphone', icon: <PhoneIcon fontSize="small" />, example: '06 12 34 56 78' },
  { id: 'adresse', label: 'Adresse', icon: <HomeIcon fontSize="small" />, example: '15 Rue de la République' },
  { id: 'ville', label: 'Ville', icon: <HomeIcon fontSize="small" />, example: 'Lyon' },
  { id: 'code_postal', label: 'Code postal', icon: <HomeIcon fontSize="small" />, example: '69001' },
  { id: 'numero_permis', label: 'N° Permis', icon: <CardIcon fontSize="small" />, example: '12AB34567' },
  { id: 'categorie_permis', label: 'Catégorie permis', icon: <CardIcon fontSize="small" />, example: 'B' },
  { id: 'date_delivrance', label: 'Date délivrance', icon: <DateIcon fontSize="small" />, example: '20/06/2010' },
  { id: 'date_expiration', label: 'Date expiration', icon: <DateIcon fontSize="small" />, example: '20/06/2030' },
  { id: 'nfc_uid', label: 'UID NFC', icon: <FingerprintIcon fontSize="small" />, example: 'A1B2C3D4' },
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
  barcode: {
    type: 'barcode',
    variable: 'numero_carte',
    x: 50,
    y: 180,
    width: 150,
    height: 40,
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    format: 'CODE128',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
  line: {
    type: 'line',
    x: 50,
    y: 100,
    width: 200,
    height: 2,
    backgroundColor: '#000000',
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
  gradient: {
    type: 'gradient',
    x: 0,
    y: 0,
    width: 200,
    height: 100,
    gradientType: 'linear',
    gradientDirection: 'to right',
    color1: '#3b82f6',
    color2: '#8b5cf6',
    borderRadius: 0,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
  },
};

// Element Library Item Component
const ElementLibraryItem = ({ icon, label, color, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1.5,
      borderRadius: 2,
      cursor: 'grab',
      bgcolor: 'rgba(15, 15, 35, 0.5)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      transition: 'all 0.2s ease',
      '&:hover': {
        bgcolor: 'rgba(99, 102, 241, 0.15)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        transform: 'translateX(4px)',
      },
      '&:active': {
        cursor: 'grabbing',
        transform: 'scale(0.98)',
      },
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: alpha(color, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.cloneElement(icon, { sx: { color, fontSize: 20 } })}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={500} noWrap>
        {label}
      </Typography>
    </Box>
    <DragIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
  </Box>
);

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
      case 'barcode':
        return {
          ...baseStyle,
          backgroundColor: element.backgroundColor,
          display: element.visible ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'line':
        return {
          ...baseStyle,
          backgroundColor: element.backgroundColor,
        };
      case 'gradient':
        return {
          ...baseStyle,
          background: element.gradientType === 'radial'
            ? `radial-gradient(circle, ${element.color1}, ${element.color2})`
            : `linear-gradient(${element.gradientDirection}, ${element.color1}, ${element.color2})`,
          borderRadius: element.borderRadius * scale,
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
            <PersonIcon sx={{ fontSize: 32 * scale, color: '#999' }} />
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
                  bgcolor: [0, 1, 2, 4, 5, 6, 10, 14, 18, 20, 21, 22, 24].includes(i)
                    ? element.foregroundColor
                    : 'transparent',
                }}
              />
            ))}
          </Box>
        );
      case 'barcode':
        return (
          <Box
            sx={{
              width: '90%',
              height: '70%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '1px',
            }}
          >
            {[...Array(30)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: i % 3 === 0 ? 3 : 2,
                  height: `${60 + (i % 5) * 8}%`,
                  bgcolor: element.foregroundColor,
                }}
              />
            ))}
          </Box>
        );
      case 'line':
        return null; // Line is just a colored box
      case 'gradient':
        return null; // Gradient is handled by CSS background
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
          {['nw', 'ne', 'sw', 'se'].map((pos) => (
            <Box
              key={pos}
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
                '&:hover': {
                  transform: 'scale(1.2)',
                  bgcolor: '#4f46e5',
                },
              }}
            />
          ))}
        </>
      )}
    </Box>
  );
};

// Panel de propriétés
const PropertiesPanel = ({ element, onUpdate, onDelete, onDuplicate }) => {
  const [colorPickerOpen, setColorPickerOpen] = useState(null);

  if (!element) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 2,
            bgcolor: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <SettingsIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez un élément pour modifier ses propriétés
        </Typography>
      </Box>
    );
  }

  const renderColorPicker = (field, label) => (
    <Box sx={{ mb: 2, position: 'relative' }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
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
          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      />
      {colorPickerOpen === field && (
        <Box sx={{ position: 'absolute', zIndex: 1000, mt: 1, left: 0 }}>
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
      {/* Element Type Badge */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={element.type.replace('dynamic', 'dynamique ').toUpperCase()}
          size="small"
          color="primary"
          variant="outlined"
        />
        {element.locked && (
          <Chip label="Verrouillé" size="small" color="warning" variant="outlined" />
        )}
      </Box>

      {/* Position */}
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Position
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="X"
          type="number"
          size="small"
          fullWidth
          value={Math.round(element.x)}
          onChange={(e) => onUpdate(element.id, { x: Number(e.target.value) })}
        />
        <TextField
          label="Y"
          type="number"
          size="small"
          fullWidth
          value={Math.round(element.y)}
          onChange={(e) => onUpdate(element.id, { y: Number(e.target.value) })}
        />
      </Box>

      {/* Taille */}
      <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        Taille
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Largeur"
          type="number"
          size="small"
          fullWidth
          value={Math.round(element.width)}
          onChange={(e) => onUpdate(element.id, { width: Number(e.target.value) })}
        />
        <TextField
          label="Hauteur"
          type="number"
          size="small"
          fullWidth
          value={Math.round(element.height)}
          onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
        />
      </Box>

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

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
            <TextField
              label="Taille"
              type="number"
              size="small"
              sx={{ width: 100 }}
              value={element.fontSize}
              onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
            <Tooltip title="Gras">
              <IconButton
                size="small"
                onClick={() =>
                  onUpdate(element.id, {
                    fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                sx={{
                  bgcolor: element.fontWeight === 'bold' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: element.fontWeight === 'bold' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: element.fontWeight === 'bold' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <BoldIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Italique">
              <IconButton
                size="small"
                onClick={() =>
                  onUpdate(element.id, {
                    fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                sx={{
                  bgcolor: element.fontStyle === 'italic' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: element.fontStyle === 'italic' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: element.fontStyle === 'italic' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <ItalicIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Souligné">
              <IconButton
                size="small"
                onClick={() =>
                  onUpdate(element.id, {
                    textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline',
                  })
                }
                sx={{
                  bgcolor: element.textDecoration === 'underline' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: element.textDecoration === 'underline' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: element.textDecoration === 'underline' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <UnderlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Tooltip title="Aligner à gauche">
              <IconButton
                size="small"
                onClick={() => onUpdate(element.id, { textAlign: 'left' })}
                sx={{
                  bgcolor: element.textAlign === 'left' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: element.textAlign === 'left' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: element.textAlign === 'left' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <AlignLeftIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Centrer">
              <IconButton
                size="small"
                onClick={() => onUpdate(element.id, { textAlign: 'center' })}
                sx={{
                  bgcolor: element.textAlign === 'center' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: element.textAlign === 'center' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: element.textAlign === 'center' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <AlignCenterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Aligner à droite">
              <IconButton
                size="small"
                onClick={() => onUpdate(element.id, { textAlign: 'right' })}
                sx={{
                  bgcolor: element.textAlign === 'right' ? 'primary.main' : 'rgba(255,255,255,0.05)',
                  color: element.textAlign === 'right' ? 'white' : 'text.secondary',
                  '&:hover': {
                    bgcolor: element.textAlign === 'right' ? 'primary.dark' : 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                <AlignRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
          {element.type === 'rectangle' && (
            <TextField
              label="Rayon de bordure"
              type="number"
              size="small"
              fullWidth
              value={element.borderRadius || 0}
              onChange={(e) => onUpdate(element.id, { borderRadius: Number(e.target.value) })}
              sx={{ mb: 2 }}
            />
          )}
        </>
      )}

      {/* QR Code */}
      {element.type === 'qrcode' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            QR Code
          </Typography>
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
          {renderColorPicker('foregroundColor', 'Couleur du QR')}
          {renderColorPicker('backgroundColor', 'Couleur de fond')}
        </>
      )}

      {/* Barcode */}
      {element.type === 'barcode' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Code-barres
          </Typography>
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
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Format</InputLabel>
            <Select
              value={element.format || 'CODE128'}
              label="Format"
              onChange={(e) => onUpdate(element.id, { format: e.target.value })}
            >
              <MenuItem value="CODE128">Code 128</MenuItem>
              <MenuItem value="CODE39">Code 39</MenuItem>
              <MenuItem value="EAN13">EAN-13</MenuItem>
              <MenuItem value="EAN8">EAN-8</MenuItem>
              <MenuItem value="UPC">UPC</MenuItem>
            </Select>
          </FormControl>
          {renderColorPicker('foregroundColor', 'Couleur des barres')}
          {renderColorPicker('backgroundColor', 'Couleur de fond')}
        </>
      )}

      {/* Line */}
      {element.type === 'line' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Ligne
          </Typography>
          {renderColorPicker('backgroundColor', 'Couleur de la ligne')}
          <TextField
            label="Épaisseur"
            type="number"
            size="small"
            fullWidth
            value={element.height || 2}
            onChange={(e) => onUpdate(element.id, { height: Number(e.target.value) })}
            sx={{ mb: 2 }}
          />
        </>
      )}

      {/* Gradient */}
      {element.type === 'gradient' && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Dégradé
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={element.gradientType || 'linear'}
              label="Type"
              onChange={(e) => onUpdate(element.id, { gradientType: e.target.value })}
            >
              <MenuItem value="linear">Linéaire</MenuItem>
              <MenuItem value="radial">Radial</MenuItem>
            </Select>
          </FormControl>
          {element.gradientType !== 'radial' && (
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Direction</InputLabel>
              <Select
                value={element.gradientDirection || 'to right'}
                label="Direction"
                onChange={(e) => onUpdate(element.id, { gradientDirection: e.target.value })}
              >
                <MenuItem value="to right">Droite</MenuItem>
                <MenuItem value="to left">Gauche</MenuItem>
                <MenuItem value="to bottom">Bas</MenuItem>
                <MenuItem value="to top">Haut</MenuItem>
                <MenuItem value="to bottom right">Diagonale bas-droite</MenuItem>
                <MenuItem value="to bottom left">Diagonale bas-gauche</MenuItem>
              </Select>
            </FormControl>
          )}
          {renderColorPicker('color1', 'Couleur 1')}
          {renderColorPicker('color2', 'Couleur 2')}
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
          size="small"
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
          size="small"
        />
      </Box>

      {/* Actions */}
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Tooltip title="Dupliquer">
          <IconButton
            size="small"
            onClick={() => onDuplicate(element.id)}
            sx={{
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
            }}
          >
            <CopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={element.locked ? 'Déverrouiller' : 'Verrouiller'}>
          <IconButton
            size="small"
            onClick={() => onUpdate(element.id, { locked: !element.locked })}
            sx={{
              bgcolor: element.locked ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              '&:hover': { bgcolor: element.locked ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)' },
            }}
          >
            {element.locked ? <LockIcon fontSize="small" /> : <UnlockIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={element.visible ? 'Masquer' : 'Afficher'}>
          <IconButton
            size="small"
            onClick={() => onUpdate(element.id, { visible: !element.visible })}
            sx={{
              bgcolor: 'rgba(99, 102, 241, 0.1)',
              '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.2)' },
            }}
          >
            {element.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Supprimer">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete(element.id)}
            sx={{
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
            }}
          >
            <DeleteIcon fontSize="small" />
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const canvasRef = useRef(null);

  const [templateName, setTemplateName] = useState('Nouveau Template');
  const [templateType, setTemplateType] = useState('carte_identite');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeFace, setActiveFace] = useState('recto');
  const [elementsVerso, setElementsVerso] = useState([]);
  const [scale, setScale] = useState(isMobile ? 0.3 : isTablet ? 0.4 : 0.5);
  const [showGrid, setShowGrid] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
  const [saving, setSaving] = useState(false);
  const [cardBackgroundColor, setCardBackgroundColor] = useState('#ffffff');
  const [cardBackgroundColorVerso, setCardBackgroundColorVerso] = useState('#ffffff');
  const [showCardColorPicker, setShowCardColorPicker] = useState(false);

  const currentElements = activeFace === 'recto' ? elements : elementsVerso;
  const setCurrentElements = activeFace === 'recto' ? setElements : setElementsVerso;
  const selectedElement = currentElements.find((el) => el.id === selectedId);

  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  // Responsive scale adjustment
  useEffect(() => {
    setScale(isMobile ? 0.3 : isTablet ? 0.4 : 0.5);
    setLeftPanelOpen(!isMobile);
    setRightPanelOpen(!isMobile);
  }, [isMobile, isTablet]);

  const loadTemplate = async (templateId) => {
    try {
      const response = await templatesApi.getById(templateId);
      if (response.succes) {
        const template = response.donnees;
        setTemplateName(template.nom);
        setTemplateType(template.type);
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

    // Open properties panel on mobile when element is added
    if (isMobile) {
      setRightPanelOpen(true);
      setLeftPanelOpen(false);
    }
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

  const duplicateElement = (id) => {
    const element = currentElements.find((el) => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: uuidv4(),
        x: element.x + 20,
        y: element.y + 20,
      };
      setCurrentElements([...currentElements, newElement]);
      setSelectedId(newElement.id);
    }
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
        case 'qrcode':
          html += `<div style="${style}; display: flex; align-items: center; justify-content: center;">{{qrcode ${el.variable}}}</div>`;
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
        html_verso: elementsVerso.length > 0 ? generateHtml() : null,
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

  const leftPanelWidth = isMobile ? '100%' : 260;
  const rightPanelWidth = isMobile ? '100%' : 280;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)', overflow: 'hidden', mx: -3, mt: -3 }}>
      {/* Top Toolbar */}
      <Paper
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          borderRadius: 0,
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Retour">
            <IconButton onClick={() => navigate('/templates')} size="small">
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <TextField
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            variant="standard"
            sx={{
              '& input': { fontSize: '1rem', fontWeight: 600 },
              width: isMobile ? 120 : 180,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Zoom arrière">
            <IconButton size="small" onClick={() => setScale(Math.max(0.2, scale - 0.1))}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="body2" sx={{ minWidth: 45, textAlign: 'center', fontSize: '0.75rem' }}>
            {Math.round(scale * 100)}%
          </Typography>
          <Tooltip title="Zoom avant">
            <IconButton size="small" onClick={() => setScale(Math.min(2, scale + 0.1))}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title={showGrid ? 'Masquer grille' : 'Afficher grille'}>
            <IconButton
              size="small"
              onClick={() => setShowGrid(!showGrid)}
              sx={{ color: showGrid ? 'primary.main' : 'text.secondary' }}
            >
              <GridIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tabs
            value={activeFace}
            onChange={(_, v) => setActiveFace(v)}
            sx={{ minHeight: 32 }}
          >
            <Tab label="Recto" value="recto" sx={{ minHeight: 32, py: 0, px: 1.5, fontSize: '0.75rem' }} />
            <Tab label="Verso" value="verso" sx={{ minHeight: 32, py: 0, px: 1.5, fontSize: '0.75rem' }} />
          </Tabs>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </Box>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel Toggle (Mobile) */}
        {isMobile && (
          <IconButton
            onClick={() => { setLeftPanelOpen(!leftPanelOpen); setRightPanelOpen(false); }}
            sx={{
              position: 'absolute',
              left: 8,
              top: 8,
              zIndex: 10,
              bgcolor: 'background.paper',
              boxShadow: 2,
            }}
          >
            <LayersIcon />
          </IconButton>
        )}

        {/* Left Panel - Elements Library */}
        <Paper
          sx={{
            width: leftPanelOpen ? leftPanelWidth : 0,
            minWidth: leftPanelOpen ? leftPanelWidth : 0,
            overflow: 'hidden',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            borderRight: '1px solid rgba(148, 163, 184, 0.1)',
            position: isMobile ? 'absolute' : 'relative',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: isMobile ? 20 : 1,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LayersIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Éléments
              </Typography>
            </Box>
            {!isMobile && (
              <IconButton size="small" onClick={() => setLeftPanelOpen(false)}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
            {isMobile && (
              <IconButton size="small" onClick={() => setLeftPanelOpen(false)}>
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
              Texte
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <ElementLibraryItem
                icon={<TextFieldsIcon />}
                label="Texte statique"
                color="#6366f1"
                onClick={() => addElement('text')}
              />
              <ElementLibraryItem
                icon={<BadgeIcon />}
                label="Champ dynamique"
                color="#8b5cf6"
                onClick={() => addElement('dynamicText')}
              />
            </Box>

            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
              Images
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <ElementLibraryItem
                icon={<PersonIcon />}
                label="Photo d'identité"
                color="#3b82f6"
                onClick={() => addElement('photo')}
              />
              <ElementLibraryItem
                icon={<ImageIcon />}
                label="Image / Logo"
                color="#10b981"
                onClick={() => addElement('image')}
              />
            </Box>

            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
              Formes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <ElementLibraryItem
                icon={<RectangleIcon />}
                label="Rectangle"
                color="#3b82f6"
                onClick={() => addElement('rectangle')}
              />
              <ElementLibraryItem
                icon={<CircleIcon />}
                label="Cercle"
                color="#ec4899"
                onClick={() => addElement('circle')}
              />
              <ElementLibraryItem
                icon={<LineIcon />}
                label="Ligne"
                color="#64748b"
                onClick={() => addElement('line')}
              />
              <ElementLibraryItem
                icon={<GradientIcon />}
                label="Dégradé"
                color="#f59e0b"
                onClick={() => addElement('gradient')}
              />
            </Box>

            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
              Codes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              <ElementLibraryItem
                icon={<QrCodeIcon />}
                label="QR Code"
                color="#10b981"
                onClick={() => addElement('qrcode')}
              />
              <ElementLibraryItem
                icon={<BarcodeIcon />}
                label="Code-barres"
                color="#06b6d4"
                onClick={() => addElement('barcode')}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
              Fond de carte
            </Typography>
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                onClick={() => setShowCardColorPicker(!showCardColorPicker)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: 'rgba(15, 15, 35, 0.5)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    borderColor: 'rgba(99, 102, 241, 0.3)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: activeFace === 'recto' ? cardBackgroundColor : cardBackgroundColorVerso,
                    border: '2px solid rgba(148, 163, 184, 0.3)',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>
                    Couleur de fond
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    {activeFace === 'recto' ? cardBackgroundColor : cardBackgroundColorVerso}
                  </Typography>
                </Box>
                <PaletteIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
              </Box>
              {showCardColorPicker && (
                <Box sx={{ position: 'absolute', zIndex: 1000, mt: 1, left: 0 }}>
                  <Box
                    sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                    onClick={() => setShowCardColorPicker(false)}
                  />
                  <SketchPicker
                    color={activeFace === 'recto' ? cardBackgroundColor : cardBackgroundColorVerso}
                    onChange={(color) => {
                      if (activeFace === 'recto') {
                        setCardBackgroundColor(color.hex);
                      } else {
                        setCardBackgroundColorVerso(color.hex);
                      }
                    }}
                  />
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: 'block', fontSize: '0.65rem' }}>
              Variables
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {DYNAMIC_VARIABLES.slice(0, 8).map((v) => (
                <Chip
                  key={v.id}
                  label={v.label}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.6rem', height: 20 }}
                />
              ))}
            </Box>
          </Box>
        </Paper>

        {/* Toggle Left Panel Button (Desktop) */}
        {!isMobile && !leftPanelOpen && (
          <IconButton
            onClick={() => setLeftPanelOpen(true)}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              zIndex: 5,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}

        {/* Canvas Area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0a0a1a',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
            }}
          >
            <Paper
              ref={canvasRef}
              onClick={handleCanvasClick}
              sx={{
                width: CARD_WIDTH_PX * scale,
                height: CARD_HEIGHT_PX * scale,
                minWidth: CARD_WIDTH_PX * scale,
                minHeight: CARD_HEIGHT_PX * scale,
                bgcolor: activeFace === 'recto' ? cardBackgroundColor : cardBackgroundColorVerso,
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
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              CR80 ({CARD_WIDTH_MM}mm × {CARD_HEIGHT_MM}mm) • 300 DPI • NFC NTAG 216
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentElements.length} élément{currentElements.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        {/* Toggle Right Panel Button (Desktop) */}
        {!isMobile && !rightPanelOpen && (
          <IconButton
            onClick={() => setRightPanelOpen(true)}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              zIndex: 5,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        {/* Right Panel Toggle (Mobile) */}
        {isMobile && (
          <IconButton
            onClick={() => { setRightPanelOpen(!rightPanelOpen); setLeftPanelOpen(false); }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 10,
              bgcolor: 'background.paper',
              boxShadow: 2,
            }}
          >
            <SettingsIcon />
          </IconButton>
        )}

        {/* Right Panel - Properties */}
        <Paper
          sx={{
            width: rightPanelOpen ? rightPanelWidth : 0,
            minWidth: rightPanelOpen ? rightPanelWidth : 0,
            overflow: 'hidden',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            borderLeft: '1px solid rgba(148, 163, 184, 0.1)',
            position: isMobile ? 'absolute' : 'relative',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: isMobile ? 20 : 1,
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="subtitle2" fontWeight={600}>
                Propriétés
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setRightPanelOpen(false)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <PropertiesPanel
              element={selectedElement}
              onUpdate={updateElement}
              onDelete={deleteElement}
              onDuplicate={duplicateElement}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default PageEditeurTemplate;
