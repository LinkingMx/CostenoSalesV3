import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

interface BranchDetailsProps {
  id: string;
  name: string;
  region: string;
}

export default function BranchDetails({ id, name, region }: BranchDetailsProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      router.visit(dashboard().url);
    }, 300);
  };

  return (
    <>
      <Head title={`${name} - Detalles`} />

      <div className={`min-h-screen bg-background ios-page-container ${isExiting ? 'ios-page-exit' : ''}`}>
        <div className="w-full max-w-md mx-auto">
          {/* Header with back button, icon, name and region */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="flex items-center gap-2 text-foreground hover:bg-accent p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Building className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-foreground leading-tight">
                  {name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {region}
                </p>
              </div>
            </div>
          </div>

          {/* Empty content area for future phases */}
          <div className="p-6">
            {/* Content will be added in future phases */}
          </div>
        </div>
      </div>
    </>
  );
}