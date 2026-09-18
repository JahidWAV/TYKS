'use client';

import { createContext, useContext } from 'react';

interface DeleteModalContextType {
  openDeleteModal: (event: { id: string; title: string }, onDeleteSuccess: () => void) => void;
}

export const DeleteModalContext = createContext<DeleteModalContextType | null>(null);

export const useDeleteModal = () => {
  const context = useContext(DeleteModalContext);
  // Au lieu de crasher l'app, on retourne une fonction vide par sécurité si hors contexte
  if (!context) {
    return {
      openDeleteModal: () => {
        console.warn("openDeleteModal a été appelé en dehors du DashboardLayout");
      }
    };
  }
  return context;
};
