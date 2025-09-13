import { useDarkMode } from '@/hooks/use-dark-mode';

export default function AppLogo() {
    const isDark = useDarkMode();
    
    const logoSrc = isDark 
        ? '/icons/Icon-macOS-Dark-1024x1024@2x.png'
        : '/icons/Icon-macOS-Default-1024x1024@2x.png';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <img 
                    src={logoSrc} 
                    alt="Costeno Sales Logo" 
                    className="size-5 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">Costeno Sales</span>
            </div>
        </>
    );
}
