import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Tooltip,
  Badge,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Layers as LayersIcon,
  Print as PrintIcon,
  History as HistoryIcon,
  Nfc as NfcIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Tableau de Bord',
    icon: <DashboardIcon />,
    path: '/',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    text: 'Utilisateurs',
    icon: <PeopleIcon />,
    path: '/utilisateurs',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
  },
  {
    text: 'Templates',
    icon: <LayersIcon />,
    path: '/templates',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  },
  {
    text: 'Impression',
    icon: <PrintIcon />,
    path: '/impression',
    gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  },
  {
    text: 'Historique',
    icon: <HistoryIcon />,
    path: '/historique',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
];

function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const currentDrawerWidth = collapsed ? 80 : drawerWidth;

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 70,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
              }}
            >
              <PrintIcon sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                CardPrint Pro
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                Luca 40 KM
              </Typography>
            </Box>
          </Box>
        )}
        {collapsed && (
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PrintIcon sx={{ color: 'white', fontSize: 24 }} />
          </Box>
        )}
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' },
          }}
        >
          <ChevronLeftIcon
            sx={{
              transform: collapsed ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.3s',
            }}
          />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)' }} />

      {/* Navigation */}
      <List sx={{ px: 1.5, py: 2, flex: 1 }}>
        {menuItems.map((item, index) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  selected={isSelected}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1 : 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': isSelected
                      ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: 4,
                          height: '60%',
                          borderRadius: '0 4px 4px 0',
                          background: item.gradient,
                        }
                      : {},
                    '&.Mui-selected': {
                      background: alpha(theme.palette.primary.main, 0.1),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      mr: collapsed ? 0 : 2,
                      color: isSelected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? item.gradient : 'transparent',
                        transition: 'all 0.3s',
                        '& svg': {
                          color: isSelected ? 'white' : 'inherit',
                          fontSize: 20,
                        },
                      }}
                    >
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? 'text.primary' : 'text.secondary',
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', mb: 2 }} />

        {/* NFC Status */}
        <Box
          sx={{
            p: collapsed ? 1 : 2,
            borderRadius: 2,
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 1.5,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <Badge
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px #10b981',
              },
            }}
          >
            <NfcIcon sx={{ color: '#10b981', fontSize: 20 }} />
          </Badge>
          {!collapsed && (
            <Box>
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                NFC Actif
              </Typography>
              <Typography variant="caption" display="block" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                MIFARE DESFire
              </Typography>
            </Box>
          )}
        </Box>

        {/* Version */}
        {!collapsed && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Version 2.0.0 Pro
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          transition: 'width 0.3s, margin 0.3s',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {menuItems.find((item) => item.path === location.pathname)?.text || 'CardPrint Pro'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Système d'impression de cartes professionnelles
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Paramètres">
              <IconButton sx={{ color: 'text.secondary' }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                cursor: 'pointer',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 18 }} />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{
          width: { sm: currentDrawerWidth },
          flexShrink: { sm: 0 },
          transition: 'width 0.3s',
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              transition: 'width 0.3s',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          mt: 8,
          minHeight: '100vh',
          transition: 'width 0.3s',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
