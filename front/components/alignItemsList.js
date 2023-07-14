import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

export default function AlignItemsList({
  data,
  clickHandler,
}) {
  const [selectedIndex, setSelectedIndex] = React.useState(null);

  const handleItemClick = (i) => {
    setSelectedIndex(i);
    clickHandler(data[i]);
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {data.flatMap(({
        from, subject, text, avatar,
      }, i) => [
          <ListItem alignItems="flex-start" key={i} selected={selectedIndex === i} button onClick={() => handleItemClick(i)}>
            <ListItemAvatar>
              <Avatar alt={from} src={avatar || `https://mui.com/static/images/avatar/${(i % 7) + 1}.jpg`} />
            </ListItemAvatar>
            <ListItemText
              primary={subject}
              secondary={
                <React.Fragment>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {from}
                  </Typography><br />
                  {text}
                </React.Fragment>
              }
            />
          </ListItem>,
          (i === data.length - 1 ? false : <Divider key={`divider-${i}`} variant="inset" component="li" />),
      ])}
    </List>
  );
}
