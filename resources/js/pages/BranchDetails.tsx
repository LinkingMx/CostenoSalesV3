import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { useDashboardState } from '@/hooks/use-dashboard-state';
import { MainFilterCalendar, type DateRange } from '@/components/main-filter-calendar';
import { useBranchDetails } from '@/hooks/use-branch-details';
import { BranchSalesCategories } from '@/components/branch-sales-categories';
import { BranchTotalSales, transformToTotalSalesData } from '@/components/branch-total-sales';

// Import test utility in development
if (process.env.NODE_ENV === 'development') {
  import('@/lib/services/test-branch-api');
}

interface BranchDetailsProps {
  id: string;
  name: string;
  region: string;
  dateRange?: {
    from: string;
    to: string;
  };
}

export default function BranchDetails({ id, name, region, dateRange }: BranchDetailsProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const { restoreOriginalDateRange, setCurrentDateRange } = useDashboardState();

  // Parse store ID from props - validate it's a valid number
  const storeId = React.useMemo(() => {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
      console.error('❌ Invalid store ID received:', {
        id,
        parsed,
        type: typeof id,
        length: id?.length,
        isString: typeof id === 'string',
        firstChar: id?.[0],
        lastChar: id?.[id.length - 1]
      });
      return null;
    }
    return parsed;
  }, [id]);

  // Hook for branch details API
  const {
    data: branchData,
    isLoading: isBranchLoading,
    error: branchError,
    isValidDateRange,
    refetch: refetchBranchData
  } = useBranchDetails({
    storeId, // Can be null, hook will handle it
    dateRange: selectedDateRange,
    autoFetch: true,
    onSuccess: (data) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Branch data loaded successfully:', {
          brand: data.brand,
          region: data.region,
          totalSales: data.food.money + data.drinks.money + data.others.money,
          diners: data.diners
        });
      }
    },
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Branch data loading failed:', error.message);
      }
    }
  });

  // Initialize date range from props ONLY on mount to avoid loops
  useEffect(() => {
    try {
      if (dateRange && !selectedDateRange) {
        const from = new Date(dateRange.from);
        const to = new Date(dateRange.to);

        // Validate parsed dates
        if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
          const parsedDateRange: DateRange = { from, to };
          setSelectedDateRange(parsedDateRange);
          setCurrentDateRange(parsedDateRange);

          if (process.env.NODE_ENV === 'development') {
            console.log('📅 BranchDetails: Initial date range set:', {
              from: from.toISOString(),
              to: to.toISOString()
            });
          }
        } else {
          console.warn('Invalid date range received in BranchDetails props:', dateRange);
        }
      } else if (!dateRange && !selectedDateRange) {
        // If no date range provided, set today's date as default
        const today = new Date();
        const defaultRange: DateRange = { from: today, to: today };
        setSelectedDateRange(defaultRange);
        setCurrentDateRange(defaultRange);

        if (process.env.NODE_ENV === 'development') {
          console.log('📅 BranchDetails: Using default date (today):', {
            from: today.toISOString(),
            to: today.toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error parsing date range in BranchDetails:', error);
      // Set today's date as fallback
      const today = new Date();
      const fallbackRange: DateRange = { from: today, to: today };
      setSelectedDateRange(fallbackRange);
      setCurrentDateRange(fallbackRange);
    }
  }, []); // Empty dependency array - run only on mount

  const handleDateChange = React.useCallback((range: DateRange | undefined) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 BranchDetails: Date range changed:', {
        from: range?.from?.toISOString(),
        to: range?.to?.toISOString()
      });
    }
    setSelectedDateRange(range);
    setCurrentDateRange(range);
  }, [setCurrentDateRange]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);

    try {
      // Restore original date range before navigating back
      const originalDate = restoreOriginalDateRange();
      console.log('🔧 RESTORING original date range:', originalDate);

      setTimeout(() => {
        // Use router.visit for SPA navigation without page refresh
        if (originalDate && originalDate.from && originalDate.to) {
          console.log('🔧 VALID original date found, navigating with restore params');
          const fromDate = originalDate.from instanceof Date ? originalDate.from : new Date(originalDate.from);
          const toDate = originalDate.to instanceof Date ? originalDate.to : new Date(originalDate.to);

          router.visit(dashboard().url, {
            method: 'get',
            data: {
              'restoreDate[from]': fromDate.toISOString(),
              'restoreDate[to]': toDate.toISOString()
            },
            preserveState: true,
            preserveScroll: true,
            replace: true, // Replace current history entry
            only: ['restoreDate']
          });
        } else {
          // Fallback to simple navigation if no original date
          console.warn('🔧 NO valid original date found, using fallback navigation');
          router.visit(dashboard().url, {
            preserveState: true,
            preserveScroll: true,
            replace: true
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error during back navigation:', error);
      // Fallback to simple navigation
      setTimeout(() => {
        router.visit(dashboard().url, {
          preserveState: true,
          preserveScroll: true
        });
      }, 300);
    }
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

          {/* Main Filter Calendar */}
          <div className="p-4 border-b border-border">
            <MainFilterCalendar
              value={selectedDateRange}
              onChange={handleDateChange}
            />
          </div>

          {/* Content area */}
          <div className="p-4 space-y-4">
            {/* Invalid store ID state */}
            {storeId === null && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 text-destructive">⚠️</div>
                  <p className="text-sm text-destructive font-medium">ID de sucursal inválido</p>
                </div>
                <p className="text-sm text-destructive/80 mt-1">
                  El ID de la sucursal "{id}" no es válido. Debe ser un número.
                </p>
              </div>
            )}

            {/* Invalid date range state */}
            {storeId !== null && !isValidDateRange && (
              <div className="rounded-lg border border-muted bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground text-center">
                  Selecciona un rango de fechas válido para ver los datos de la sucursal
                </p>
              </div>
            )}

            {/* Branch Total Sales - Only show when valid storeId and date range */}
            {storeId !== null && isValidDateRange && (
              <BranchTotalSales
                data={branchData ? transformToTotalSalesData(branchData) : null}
                isLoading={isBranchLoading}
                error={branchError}
              />
            )}

            {/* Branch Sales Categories - Only show when valid storeId and date range */}
            {storeId !== null && isValidDateRange && (
              <BranchSalesCategories
                data={branchData ? {
                  food: branchData.food,
                  drinks: branchData.drinks,
                  others: branchData.others
                } : null}
                isLoading={isBranchLoading}
                error={branchError}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}