import { toast } from 'sonner';

export function showUndoToast(message: string, onUndo: () => Promise<void>): void {
  toast.success(message, {
    duration: 10000,
    action: {
      label: '↩ Deshacer',
      onClick: () => {
        onUndo()
          .then(() => toast.success('Cambio revertido'))
          .catch(() => toast.error('No se pudo revertir el cambio'));
      }
    }
  });
}
