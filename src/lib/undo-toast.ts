import { toast } from 'sonner';

export function showUndoToast(
  message: string,
  onUndo: () => Promise<void>,
  onExpire?: () => void
): void {
  let undone = false;
  toast.success(message, {
    duration: 15000,
    action: {
      label: '↩ Deshacer',
      onClick: () => {
        undone = true;
        onUndo()
          .then(() => toast.success('Cambio revertido'))
          .catch(() => toast.error('No se pudo revertir el cambio'));
      }
    },
    onAutoClose: () => {
      if (!undone) onExpire?.();
    },
    onDismiss: () => {
      if (!undone) onExpire?.();
    }
  });
}
