/**
 * Test Branch Products API
 * Testing file to debug why products are not showing for current date (17-09-2025)
 */

import type { DateRange } from '@/components/main-filter-calendar';
import { fetchStoreDetailsWithCache } from './branch-details.service';

interface TestCase {
    name: string;
    storeId: number;
    dateRange: DateRange;
    description: string;
}

/**
 * Test cases for different scenarios
 */
const testCases: TestCase[] = [
    {
        name: "Current Date (17-09-2025)",
        storeId: 1, // Ajusta este ID según la sucursal que quieras testear
        dateRange: {
            from: new Date(2025, 8, 17), // September 17, 2025
            to: new Date(2025, 8, 17)
        },
        description: "Testing current date where products are not showing"
    },
    {
        name: "Previous Day (16-09-2025)",
        storeId: 1,
        dateRange: {
            from: new Date(2025, 8, 16), // September 16, 2025
            to: new Date(2025, 8, 16)
        },
        description: "Testing previous day where products should show"
    },
    {
        name: "Day Before (15-09-2025)",
        storeId: 1,
        dateRange: {
            from: new Date(2025, 8, 15), // September 15, 2025
            to: new Date(2025, 8, 15)
        },
        description: "Testing day before that where products should show"
    },
    {
        name: "Last Week (10-09-2025)",
        storeId: 1,
        dateRange: {
            from: new Date(2025, 8, 10), // September 10, 2025
            to: new Date(2025, 8, 10)
        },
        description: "Testing last week to see if products show"
    },
    {
        name: "Range: Current to Previous (16-17 Sept)",
        storeId: 1,
        dateRange: {
            from: new Date(2025, 8, 16), // September 16, 2025
            to: new Date(2025, 8, 17)  // September 17, 2025
        },
        description: "Testing date range including current date"
    }
];

/**
 * Format date for display
 */
function formatDateDisplay(date: Date): string {
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short'
    });
}

/**
 * Format date for API (YYYY-MM-DD)
 */
function formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Test a single case
 */
async function testSingleCase(testCase: TestCase): Promise<void> {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    console.log(`📋 Description: ${testCase.description}`);
    console.log(`🏪 Store ID: ${testCase.storeId}`);
    console.log(`📅 Date Range: ${formatDateDisplay(testCase.dateRange.from!)} - ${formatDateDisplay(testCase.dateRange.to!)}`);
    console.log(`🔗 API Dates: ${formatDateForAPI(testCase.dateRange.from!)} to ${formatDateForAPI(testCase.dateRange.to!)}`);

    try {
        const startTime = Date.now();
        const data = await fetchStoreDetailsWithCache(testCase.storeId, testCase.dateRange, {
            forceRefresh: true // Always fetch fresh data for testing
        });
        const endTime = Date.now();

        console.log(`⏱️ Response Time: ${endTime - startTime}ms`);
        console.log(`✅ API Response Success`);

        // Analyze the response
        const totalSales = (data.food?.money || 0) + (data.drinks?.money || 0) + (data.others?.money || 0);
        const topProducts = data.top_products || [];

        console.log(`💰 Total Sales: $${totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
        console.log(`👥 Diners: ${data.diners || 0}`);
        console.log(`🎫 Tickets: Open=${data.ticket?.open || 0}, Closed=${data.ticket?.closed || 0}`);
        console.log(`📦 Products Count: ${topProducts.length}`);

        if (topProducts.length > 0) {
            console.log(`🏆 Top 3 Products:`);
            topProducts.slice(0, 3).forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.name} - Qty: ${product.quantity} - $${product.unit_cost}`);
            });
        } else {
            console.log(`⚠️ NO PRODUCTS FOUND for this date range`);
            console.log(`🔍 Possible reasons:`);
            console.log(`   - No sales occurred on this date`);
            console.log(`   - Data hasn't been processed yet for current date`);
            console.log(`   - Store was closed`);
            console.log(`   - API data sync delay`);
        }

        // Additional debugging info
        console.log(`🏢 Store Info: ${data.brand || 'N/A'} - ${data.region || 'N/A'}`);
        console.log(`📊 Raw API Data Keys:`, Object.keys(data));

    } catch (error) {
        console.error(`❌ Test Failed:`, error);
        if (error instanceof Error) {
            console.error(`📄 Error Details:`, {
                message: error.message,
                name: error.name,
                stack: error.stack?.split('\n').slice(0, 3).join('\n')
            });
        }
    }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
    console.log(`🚀 Starting Branch Products API Testing`);
    console.log(`📅 Current Date: ${new Date().toLocaleString('es-MX')}`);
    console.log(`🎯 Focus: Testing why products don't show for 17-09-2025`);
    console.log(`📡 API Endpoint: http://192.168.100.20/api/get_store_details`);
    console.log(`═══════════════════════════════════════════════════════════`);

    for (let i = 0; i < testCases.length; i++) {
        await testSingleCase(testCases[i]);

        // Add delay between tests to avoid rate limiting
        if (i < testCases.length - 1) {
            console.log(`⏳ Waiting 2 seconds before next test...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n🏁 All tests completed!`);
    console.log(`💡 Compare the results to identify why current date has no products`);
}

/**
 * Test specific store ID with current date
 */
async function testCurrentDateWithStoreId(storeId: number): Promise<void> {
    console.log(`\n🎯 Quick Test: Store ${storeId} - Current Date (17-09-2025)`);

    const testCase: TestCase = {
        name: `Store ${storeId} - Current Date`,
        storeId,
        dateRange: {
            from: new Date(2025, 8, 17),
            to: new Date(2025, 8, 17)
        },
        description: `Testing store ${storeId} for current date issue`
    };

    await testSingleCase(testCase);
}

/**
 * Compare multiple store IDs for current date
 */
async function compareStoresCurrentDate(storeIds: number[]): Promise<void> {
    console.log(`\n🔍 Comparing Multiple Stores for Current Date (17-09-2025)`);

    for (const storeId of storeIds) {
        await testCurrentDateWithStoreId(storeId);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// Export functions for manual testing in browser console
declare global {
    interface Window {
        testBranchProductsAPI: {
            runAllTests: () => Promise<void>;
            testCurrentDateWithStoreId: (storeId: number) => Promise<void>;
            compareStoresCurrentDate: (storeIds: number[]) => Promise<void>;
            testSingleCase: (testCase: TestCase) => Promise<void>;
        };
    }
}

// Assign to window object for browser console access
if (typeof window !== 'undefined') {
    window.testBranchProductsAPI = {
        runAllTests,
        testCurrentDateWithStoreId,
        compareStoresCurrentDate,
        testSingleCase
    };
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Branch Products API Test utility loaded`);
    console.log(`📖 Available functions:`);
    console.log(`   - window.testBranchProductsAPI.runAllTests()`);
    console.log(`   - window.testBranchProductsAPI.testCurrentDateWithStoreId(storeId)`);
    console.log(`   - window.testBranchProductsAPI.compareStoresCurrentDate([1, 2, 3])`);
    console.log(`💡 Or just use: testBranchProductsAPI.runAllTests()`);

    // Test that the functions are available
    setTimeout(() => {
        if (typeof window !== 'undefined' && window.testBranchProductsAPI) {
            console.log(`✅ testBranchProductsAPI is available on window object`);
        } else {
            console.error(`❌ testBranchProductsAPI failed to attach to window object`);
        }
    }, 1000);
}

/**
 * Simple test function for immediate use
 */
function quickTest() {
    console.log('🚀 Quick Branch Products API Test');
    return testCurrentDateWithStoreId(1);
}

// Also assign quickTest to window
if (typeof window !== 'undefined') {
    (window as any).quickTestBranchAPI = quickTest;
    console.log('💡 Quick test available: quickTestBranchAPI()');
}

export {
    runAllTests,
    testCurrentDateWithStoreId,
    compareStoresCurrentDate,
    testSingleCase,
    quickTest
};