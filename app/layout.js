'use client';

import UserContextProvider from '../front/contexts/userContext';
import Topbar from '../front/components/topbar';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <UserContextProvider>
      <html>
        <body>
          <Topbar />
          {children}
        </body>
      </html>
    </UserContextProvider>
  );
}
