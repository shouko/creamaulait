'use client';

import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Box from '@mui/material/Box';
import LoginIcon from '@mui/icons-material/Login';

import {
  Tooltip,
  Avatar,
  MenuItem,
  Menu,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
} from '@mui/material';

import { useUserContext } from '../contexts/userContext';

const drawerWidth = 240;

export default function Topbar() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { user } = useUserContext();

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Creamaulait
        </Typography>
        {user?.email ? (
          <Box sx={{ flexGrow: 0 }}>
          <Tooltip title="Open settings">
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt="Remy Sharp" src={user.picture} />
            </IconButton>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            {[user.name, user.email, 'Dashboard', 'Logout'].map((label) => (
              <MenuItem key={label} onClick={handleCloseUserMenu} {...(label === 'Logout' ? {
                component: 'a',
                href: '/auth/logout',
              } : {})}>
                <Typography textAlign="center">{label}</Typography>
              </MenuItem>
            ))}
          </Menu>
        </Box>
        ) : (
        <Button color="inherit" variant="outlined" startIcon={<LoginIcon />} href="/auth/login">
          Login
        </Button>
        )}
      </Toolbar>
    </AppBar>
    <Drawer
      variant="persistent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
      }}
      open={drawerOpen}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {
            [
              ['Inbox', 'Starred', 'Send email', 'Drafts'],
              ['All mail', 'Trash', 'Spam'],
              ['Inbox', 'Starred', 'Send email', 'Drafts'],
            ].flatMap((items, i, sections) => [
              ...items.map((text, j) => (<ListItem key={`${i}.${j}.${text}`} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {j % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>)),
              ...(i + 1 < sections.length ? [<Divider key={i} />] : []),
            ])
          }
        </List>
      </Box>
    </Drawer>
    </>
  );
}
