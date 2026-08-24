'use client';

/**
 * Central entry point for Firebase services.
 * Re-exports core initialization and hooks while preventing circular dependencies.
 */

export { initializeFirebase } from './core';
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
