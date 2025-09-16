import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/use-pwa';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function PWAInstallPrompt() {
    const { isInstallable, isIOS, isInstalled, install } = usePWA();
    const [isDismissed, setIsDismissed] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if user has previously dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const now = new Date();
            const daysSinceDismissed = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                setIsDismissed(true);
            } else {
                localStorage.removeItem('pwa-install-dismissed');
            }
        }
    }, []);

    const handleInstall = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        const installed = await install();
        if (installed) {
            setIsDismissed(true);
        }
    };

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    };

    if (isInstalled || isDismissed || !isInstallable) {
        return null;
    }

    if (showIOSInstructions) {
        return (
            <div className="fixed right-4 bottom-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
                <Card className="shadow-lg">
                    <CardHeader className="relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setShowIOSInstructions(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                        <CardTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Instalar en iOS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">Para instalar esta app en tu dispositivo iOS:</p>
                        <ol className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    1
                                </span>
                                <span>
                                    Toca el botón <Share className="inline h-4 w-4" /> Compartir en Safari
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    2
                                </span>
                                <span>Desplázate hacia abajo y toca "Agregar a pantalla de inicio"</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    3
                                </span>
                                <span>Toca "Agregar" para confirmar</span>
                            </li>
                        </ol>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => setShowIOSInstructions(false)}>
                            Entendido
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed right-4 bottom-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
            <Card className="shadow-lg">
                <CardHeader className="relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleDismiss}>
                        <X className="h-4 w-4" />
                    </Button>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Instalar App
                    </CardTitle>
                    <CardDescription>Instala Costeno Sales para una mejor experiencia</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Funciona sin conexión
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Carga más rápido
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Acceso desde pantalla de inicio
                        </li>
                    </ul>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={handleDismiss}>
                        Ahora no
                    </Button>
                    <Button className="flex-1" onClick={handleInstall}>
                        Instalar
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
