'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import SanitizedHTML from 'react-sanitized-html';

import { useUserContext } from '../../front/contexts/userContext';
import AlignItemsList from '../../front/components/alignItemsList';

const replaceNicknamePlaceholder = (text, nickname) => {
  if (!text || !nickname) return text;
  return text.replace(/%%%/g, nickname);
};

export default function MailList() {
  const { user } = useUserContext();
  const [data, setData] = useState([]);
  const [content, setContent] = useState({});
  const [activeId, setActiveId] = useState(null);

  const nickname = user?.name || 'Undefined';

  useEffect(() => {
    Promise.all([
      fetch('/api/mail?limit=300')
        .then((r) => r.json()),
      fetch('/api/data/nogizaka46/members')
        .then((r) => r.json()),
    ]).then(([resData, resMembers]) => {
      setData(resData.map(
        ({
          _id: id,
          payload: {
            from: rawFrom,
            subject,
            text,
          },
        }) => {
          const from = rawFrom.replace(/<[a-z0-9]+-([^@]+)@[^>]+>/g, '#$1');
          return {
            id,
            avatar: resMembers?.data?.find(({ english_name: englishName, name }) => {
              const [maybeName, maybeKanaName] = from.split('#');
              if (name.trim() && name.trim() === maybeName.trim()) {
                return true;
              }
              const enPieces = englishName.split(' ');
              return [
                enPieces.join(''),
                enPieces.reverse().join(''),
              ].indexOf(maybeKanaName.replace(/_/g, '')) !== -1;
            })?.img,
            from,
            subject: replaceNicknamePlaceholder(subject, nickname),
            text: replaceNicknamePlaceholder(text, nickname).trim().substring(0, 40),
          };
        },
      ));
    });
  }, [nickname]);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/mail/${activeId}`).then((r) => r.json()).then(({
      payload: {
        from, subject, html, text,
      },
    }) => setContent({
      from, subject, html, text,
    }));
  }, [activeId]);

  const boxStyle = { maxHeight: '90vh', overflow: 'auto' };

  return (
    <Grid container direction="row" spacing={1}>
      <Grid item xs={6} sm={4} lg={3}>
        <Box style={boxStyle}>
          <AlignItemsList data={data} clickHandler={({ id }) => setActiveId(id)} />
        </Box>
      </Grid>
      <Grid item xs={6} sm={8} lg={9}>
        <SanitizedHTML style={boxStyle} allowedTags={['a', 'img', 'br']} html={replaceNicknamePlaceholder(content?.html, nickname)} />
      </Grid>
    </Grid>
  );
}
