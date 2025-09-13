import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PWAUpdateModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Custom modal for PWA update notifications.
 * Replaces browser's native confirm() dialog with better UX.
 */
export function PWAUpdateModal({ open, onConfirm, onCancel }: PWAUpdateModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🔄</span>
            Actualización Disponible
          </DialogTitle>
          <DialogDescription>
            Hay una nueva versión de la aplicación disponible.
            ¿Deseas recargar la página para obtener las últimas mejoras?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            Más tarde
          </Button>
          <Button onClick={onConfirm} className="bg-primary hover:bg-primary/90">
            Actualizar Ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}