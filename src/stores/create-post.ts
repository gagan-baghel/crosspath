import { create } from "zustand";

interface CreatePostState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCreatePost = create<CreatePostState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
