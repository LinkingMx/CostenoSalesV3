import type { DateRange } from '@/components/main-filter-calendar';
import { isCustomRangeSelected } from '@/lib/date-validation';
import type { BranchCustomSalesData, CustomBranchMetrics } from '../types';

// Re-export the custom range validation function
export { isCustomRangeSelected };

/**
 * Validation result interface for runtime data validation.
 * Provides detailed feedback on data integrity and validation errors.
 */
interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata: {
        validatedAt: Date;
        source: string;
        itemCount?: number;
        rangeDays?: number;
    };
}

/**
 * Validates custom range branch sales data for integrity and consistency.
 * Performs comprehensive runtime validation with detailed error reporting.
 *
 * @function validateCustomBranchSalesData
 * @param {BranchCustomSalesData[]} branchData - Array of branch sales data to validate
 * @returns {ValidationResult} Detailed validation result with errors and warnings
 *
 * @example
 * const data = [{
 *   id: '1',
 *   name: 'Branch 1',
 *   totalSales: 50000,
 *   percentage: 10.5,
 *   openAccounts: 5000,
 *   closedSales: 45000,
 *   averageTicket: 450,
 *   totalTickets: 100,
 *   avatar: 'B'
 * }];
 * const result = validateCustomBranchSalesData(data);
 * if (!result.isValid) {
 *   console.error('Validation failed:', result.errors);
 * }
 */
export function validateCustomBranchSalesData(branchData: BranchCustomSalesData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();

    // Check for empty or null data
    if (!branchData || branchData.length === 0) {
        errors.push('Branch sales data array is empty or null');
        return {
            isValid: false,
            errors,
            warnings,
            metadata: {
                validatedAt: now,
                source: 'custom-branch-sales-data-validation',
                itemCount: 0,
            },
        };
    }

    // Validate each branch record
    branchData.forEach((branch) => {
        const branchLabel = `Branch "${branch.name}" (ID: ${branch.id})`;

        // Validate required string fields
        if (typeof branch.id !== 'string' || branch.id.trim() === '') {
            errors.push(`${branchLabel}: ID must be a non-empty string`);
        }

        if (typeof branch.name !== 'string' || branch.name.trim() === '') {
            errors.push(`${branchLabel}: Name must be a non-empty string`);
        }

        if (typeof branch.avatar !== 'string' || branch.avatar.trim() === '') {
            errors.push(`${branchLabel}: Avatar must be a non-empty string`);
        } else if (branch.avatar.length > 2) {
            warnings.push(`${branchLabel}: Avatar should be 1-2 characters for optimal display`);
        }

        // Validate optional location field
        if (branch.location !== undefined && (typeof branch.location !== 'string' || branch.location.trim() === '')) {
            warnings.push(`${branchLabel}: Location should be a non-empty string when provided`);
        }

        // Validate numeric fields
        const numericFields = [
            { field: 'totalSales', value: branch.totalSales, allowNegative: false },
            { field: 'percentage', value: branch.percentage, allowNegative: true },
            { field: 'openAccounts', value: branch.openAccounts, allowNegative: false },
            { field: 'closedSales', value: branch.closedSales, allowNegative: false },
            { field: 'averageTicket', value: branch.averageTicket, allowNegative: false },
            { field: 'totalTickets', value: branch.totalTickets, allowNegative: false },
        ];

        numericFields.forEach(({ field, value, allowNegative }) => {
            if (typeof value !== 'number') {
                errors.push(`${branchLabel}: ${field} must be a number`);
            } else if (isNaN(value)) {
                errors.push(`${branchLabel}: ${field} is NaN`);
            } else if (!allowNegative && value < 0) {
                errors.push(`${branchLabel}: ${field} cannot be negative`);
            } else if (field === 'totalTickets' && value % 1 !== 0) {
                warnings.push(`${branchLabel}: ${field} should be a whole number`);
            }
        });

        // Business logic validations
        if (branch.totalSales !== undefined && branch.openAccounts !== undefined && branch.closedSales !== undefined) {
            const calculatedTotal = branch.openAccounts + branch.closedSales;
            const tolerance = 0.01; // Allow for floating point precision errors

            if (Math.abs(branch.totalSales - calculatedTotal) > tolerance) {
                warnings.push(`${branchLabel}: totalSales (${branch.totalSales}) doesn't match openAccounts + closedSales (${calculatedTotal})`);
            }
        }

        if (branch.averageTicket !== undefined && branch.totalSales !== undefined && branch.totalTickets !== undefined) {
            if (branch.totalTickets > 0) {
                const calculatedAverage = branch.totalSales / branch.totalTickets;
                const tolerance = 1.0; // Allow for reasonable rounding differences

                if (Math.abs(branch.averageTicket - calculatedAverage) > tolerance) {
                    warnings.push(
                        `${branchLabel}: averageTicket (${branch.averageTicket}) doesn't match totalSales / totalTickets (${calculatedAverage.toFixed(2)})`,
                    );
                }
            }
        }

        // Validate percentage ranges
        if (Math.abs(branch.percentage) > 1000) {
            warnings.push(`${branchLabel}: percentage seems unusually high (${branch.percentage}%)`);
        }
    });

    // Check for duplicate IDs
    const ids = branchData.map((branch) => branch.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
        errors.push(`Duplicate branch IDs found: ${[...new Set(duplicateIds)].join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'custom-branch-sales-data-validation',
            itemCount: branchData.length,
        },
    };
}

/**
 * Validates date range for custom branch analysis requirements.
 * Ensures the date range meets the custom branches component's display requirements.
 *
 * @function validateCustomBranchDateRange
 * @param {DateRange | undefined} dateRange - Date range to validate
 * @returns {ValidationResult} Validation result with specific custom range errors
 *
 * @example
 * const range = { from: new Date('2025-09-01'), to: new Date('2025-09-20') };
 * const result = validateCustomBranchDateRange(range);
 * if (result.isValid) {
 *   // Safe to display custom branch analysis
 * }
 */
export function validateCustomBranchDateRange(dateRange: DateRange | undefined): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const now = new Date();

    if (!dateRange) {
        errors.push('Date range is required');
    } else {
        if (!dateRange.from) {
            errors.push('Start date (from) is required');
        } else if (!(dateRange.from instanceof Date)) {
            errors.push('Start date must be a Date object');
        } else if (isNaN(dateRange.from.getTime())) {
            errors.push('Start date is invalid');
        }

        if (!dateRange.to) {
            errors.push('End date (to) is required');
        } else if (!(dateRange.to instanceof Date)) {
            errors.push('End date must be a Date object');
        } else if (isNaN(dateRange.to.getTime())) {
            errors.push('End date is invalid');
        }

        // Validate custom range requirement
        if (dateRange.from && dateRange.to && dateRange.from instanceof Date && dateRange.to instanceof Date) {
            if (!isCustomRangeSelected(dateRange)) {
                errors.push('Date range must represent a custom range (not single day, complete week, or complete month) for custom branch analysis');
            }

            // Calculate range days for additional validations
            const timeDiff = dateRange.to.getTime() - dateRange.from.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysDiff < 1) {
                errors.push('Custom date range must be at least 2 days');
            }

            if (daysDiff > 365) {
                errors.push('Custom date range cannot exceed 365 days');
            }

            if (dateRange.from > now) {
                warnings.push('Selected custom range starts in the future');
            }

            if (daysDiff > 90) {
                warnings.push(`Large date range selected (${daysDiff + 1} days) - branch data analysis may be less granular`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
            validatedAt: now,
            source: 'custom-branch-date-range-validation',
        },
    };
}

/**
 * Calculates comprehensive metrics for all branches within a custom date range.
 * Provides aggregated statistics and performance indicators for the entire branch network.
 *
 * @function calculateCustomBranchMetrics
 * @param {BranchCustomSalesData[]} branchData - Array of branch sales data
 * @param {DateRange} dateRange - The custom date range being analyzed
 * @returns {CustomBranchMetrics} Calculated metrics for all branches
 *
 * @example
 * const metrics = calculateCustomBranchMetrics(branchData, customRange);
 * console.log(`Top branch: ${metrics.topBranchName} with $${metrics.topBranchSales}`);
 */
export function calculateCustomBranchMetrics(branchData: BranchCustomSalesData[], dateRange: DateRange): CustomBranchMetrics {
    if (!branchData || branchData.length === 0) {
        return {
            totalBranches: 0,
            totalSales: 0,
            averageBranchSales: 0,
            topBranchId: '',
            topBranchName: '',
            topBranchSales: 0,
            totalTickets: 0,
            averageTicketValue: 0,
            dateRange,
            rangeDays: 0,
        };
    }

    const totalBranches = branchData.length;
    const totalSales = branchData.reduce((sum, branch) => sum + branch.totalSales, 0);
    const averageBranchSales = totalSales / totalBranches;
    const totalTickets = branchData.reduce((sum, branch) => sum + branch.totalTickets, 0);
    const averageTicketValue = totalTickets > 0 ? totalSales / totalTickets : 0;

    // Find top performing branch
    const topBranch = branchData.reduce((best, current) => (current.totalSales > best.totalSales ? current : best));

    // Calculate range days
    const timeDiff = dateRange.to && dateRange.from ? dateRange.to.getTime() - dateRange.from.getTime() : 0;
    const rangeDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    return {
        totalBranches,
        totalSales,
        averageBranchSales,
        topBranchId: topBranch.id,
        topBranchName: topBranch.name,
        topBranchSales: topBranch.totalSales,
        totalTickets,
        averageTicketValue,
        dateRange,
        rangeDays,
    };
}
