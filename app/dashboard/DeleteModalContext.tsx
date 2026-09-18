'use client';

import { createContext, useContext } from 'react';

interface DeleteModalContextType {
  openDeleteModal: (event: { id: string; title: string }, onDeleteSuccess: () => void) => void;
}

export const DeleteModalContext = createContext<DeleteModalContextType | null>(null);

export const useDeleteModal = () => {
  const context = useContext(DeleteModalContext);
  if (!context) {
    throw new Error("useDeleteModal doit être utilisé à l'intérieur d'un DashboardLayout");
  }
  return context;
};
