'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './core';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  // Use direct core import to prevent circular dependency with index.ts
  const { firebaseApp, auth, firestore, storage } = useMemo(
    () => initializeFirebase(),
    []
  );

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
};
