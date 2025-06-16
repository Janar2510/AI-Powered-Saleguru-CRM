import { useEffect } from 'react';
import { useGuru } from '../contexts/GuruContext';

export const useKeyboardShortcuts = () => {
  const { openGuru } = useGuru();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open Guru
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        openGuru();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openGuru]);
};