import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { BranchSalesCategoriesHeader } from './components/branch-sales-categories-header';
import { CategoryCard } from './components/category-card';
import type { BranchSalesCategoriesProps } from './types';
import { transformToCategoryCards } from './utils';

/**
 * Main component for displaying branch sales categories
 * Shows food, drinks, and wines sales data in card format
 */
export function BranchSalesCategories({ data, isLoading = false, error = null, className }: BranchSalesCategoriesProps) {
    // Transform data to category cards format
    const categoryCards = React.useMemo(() => {
        if (!data) return [];
        return transformToCategoryCards(data);
    }, [data]);

    if (process.env.NODE_ENV === 'development') {
        React.useEffect(() => {
            if (data) {
                console.log('📊 BranchSalesCategories rendering with data:', {
                    totalCategories: categoryCards.length,
                    totalSales: data.food.money + data.drinks.money + data.others.money,
                    categories: categoryCards.map((card) => ({
                        name: card.name,
                        money: card.money,
                        percentage: card.percentage,
                    })),
                });
            }
        }, [data, categoryCards]);
    }

    return (
        <Card className={cn('w-full border-border', className)}>
            <CardContent className="px-4 py-3">
                {/* Header */}
                <BranchSalesCategoriesHeader />

                {/* Error state */}
                {error && !isLoading && (
                    <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <p className="text-center text-sm text-destructive">Error al cargar categorías de ventas: {error}</p>
                    </div>
                )}

                {/* Content */}
                <div className="mt-3 space-y-2">
                    {isLoading ? (
                        // Loading state - show 3 skeleton cards
                        <>
                            <CategoryCard
                                data={{
                                    type: 'food',
                                    name: 'Alimentos',
                                    money: 0,
                                    percentage: 0,
                                    color: 'text-green-600',
                                    icon: 'UtensilsCrossed',
                                }}
                                isLoading={true}
                            />
                            <CategoryCard
                                data={{
                                    type: 'drinks',
                                    name: 'Bebidas',
                                    money: 0,
                                    percentage: 0,
                                    color: 'text-blue-600',
                                    icon: 'Coffee',
                                }}
                                isLoading={true}
                            />
                            <CategoryCard
                                data={{
                                    type: 'others',
                                    name: 'Vinos',
                                    money: 0,
                                    percentage: 0,
                                    color: 'text-purple-600',
                                    icon: 'Wine',
                                }}
                                isLoading={true}
                            />
                        </>
                    ) : data && !error ? (
                        // Success state - show actual data
                        categoryCards.map((categoryData) => <CategoryCard key={categoryData.type} data={categoryData} isLoading={false} />)
                    ) : !error ? (
                        // No data state
                        <div className="rounded-lg border border-muted bg-muted/20 p-4">
                            <p className="text-center text-sm text-muted-foreground">No hay datos de categorías disponibles</p>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

export default BranchSalesCategories;
