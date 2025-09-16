/**
 * Search input component for products table
 */

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import React from 'react';
import type { ProductsTableSearchProps } from '../types';
import { sanitizeSearchInput } from '../utils';

export const ProductsTableSearch = React.memo(function ProductsTableSearch({
    value,
    onChange,
    placeholder = 'Buscar producto...',
}: ProductsTableSearchProps) {
    const handleInputChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const sanitizedValue = sanitizeSearchInput(e.target.value);
            onChange(sanitizedValue);
        },
        [onChange],
    );

    return (
        <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                className="h-9 pl-9"
                maxLength={50} // Reasonable limit for product search
            />
        </div>
    );
});
