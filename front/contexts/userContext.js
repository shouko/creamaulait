'use client';

import {
  createContext, useState, useEffect, useContext,
} from 'react';

export const UserContext = createContext({});

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState({});

  useEffect(() => {
    fetch('/auth/status').then(async (r) => {
      const json = await r.json();
      setUser(json);
    }).catch(() => {
      setUser({
        guest: true,
      });
    });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

export default UserContextProvider;
