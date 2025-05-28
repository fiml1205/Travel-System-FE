'use client';

import { ReactNode } from 'react';
import { UserContext } from './UserContext';

interface Props {
  children: ReactNode;
  value: any;
}

export default function UserProvider({ children, value }: Props) {
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
