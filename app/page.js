'use client';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import LoginIcon from '@mui/icons-material/Login';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NavigationIcon from '@mui/icons-material/Navigation';
import Button from '@mui/material/Button';

import { useUserContext } from '../front/contexts/userContext';

export default function FloatingActionButtons() {
  const { user } = useUserContext();

  return (
    <Box sx={{ '& > :not(style)': { m: 1 } }}>
      <Fab color="primary" aria-label="add">
        <AddIcon />
      </Fab>
      <Button variant="outlined" startIcon={<LoginIcon />} href="/auth/login">
        Login
      </Button>
      <Fab color="secondary" aria-label="edit">
        <EditIcon />
      </Fab>
      <Fab variant="extended">
        <NavigationIcon sx={{ mr: 1 }} />
        {user?.name}
      </Fab>
      <Fab disabled aria-label="like">
        <FavoriteIcon />
      </Fab>
    </Box>
  );
}
