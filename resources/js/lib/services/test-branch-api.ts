/**
 * Test utility for debugging Branch Details API
 * This file helps diagnose API issues by making direct calls
 */

export interface TestApiOptions {
    storeId: number;
    startDate: string; // Format: YYYY-MM-DD
    endDate: string; // Format: YYYY-MM-DD
}

/**
 * Test the Branch Details API directly
 * Use this in the browser console to verify API responses
 */
export async function testBranchDetailsApi(options: TestApiOptions) {
    const { storeId, startDate, endDate } = options;

    console.log('🧪 Testing Branch Details API with:', {
        storeId,
        startDate,
        endDate,
    });

    const requestPayload = {
        start_date: startDate,
        end_date: endDate,
        store_id: storeId,
    };

    try {
        console.log('📤 Sending request:', requestPayload);

        const response = await fetch('http://192.168.100.20/api/get_store_details', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer 342|AxRYaMAz4RxhiMwYTXJmUvCXvkjq24MrXW3YgrF91ef9616f',
            },
            body: JSON.stringify(requestPayload),
        });

        console.log('📥 Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            return null;
        }

        const result = await response.json();
        console.log('📦 Full API Response:', result);

        if (result.success) {
            const data = result.data;
            const totalSales = (data?.food?.money || 0) + (data?.drinks?.money || 0) + (data?.others?.money || 0);

            console.log('✅ API Success Summary:', {
                brand: data?.brand,
                region: data?.region,
                totalSales,
                foodSales: data?.food?.money || 0,
                drinksSales: data?.drinks?.money || 0,
                winesSales: data?.others?.money || 0,
                diners: data?.diners || 0,
                openAccounts: data?.ticket?.open || 0,
                openMoney: data?.ticket?.open_money || 0,
                closedAccounts: data?.ticket?.closed || 0,
                closedMoney: data?.ticket?.closed_money || 0,
                averageTicket: data?.average?.ticket || 0,
                averagePerDiner: data?.average?.diners || 0,
                discounts: data?.discounts || 0,
                topProductsCount: data?.top_products?.length || 0,
            });

            if (totalSales === 0) {
                console.warn('⚠️ WARNING: API returned 0 sales. Possible reasons:');
                console.warn('1. No sales data exists for this date range');
                console.warn('2. The store_id might be incorrect');
                console.warn('3. The date format might not match what the API expects');
                console.warn('4. The store might be closed on these dates');
            }
        } else {
            console.error('❌ API returned success: false', result.message);
        }

        return result;
    } catch (error) {
        console.error('❌ Network or parsing error:', error);
        return null;
    }
}

/**
 * Test multiple date ranges for a store
 */
export async function testMultipleDateRanges(storeId: number) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const tests = [
        { name: 'Today', startDate: formatDate(today), endDate: formatDate(today) },
        { name: 'Yesterday', startDate: formatDate(yesterday), endDate: formatDate(yesterday) },
        { name: 'Last 7 days', startDate: formatDate(lastWeek), endDate: formatDate(today) },
        { name: 'Last 30 days', startDate: formatDate(lastMonth), endDate: formatDate(today) },
    ];

    console.log(`🔬 Testing store ${storeId} with multiple date ranges...`);
    console.log('================================================');

    for (const test of tests) {
        console.log(`\n📅 Testing: ${test.name}`);
        console.log(`   Date range: ${test.startDate} to ${test.endDate}`);

        await testBranchDetailsApi({
            storeId,
            startDate: test.startDate,
            endDate: test.endDate,
        });

        console.log('------------------------------------------------');

        // Wait a bit between requests to avoid overwhelming the API
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n✅ All tests completed!');
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
    (window as any).testBranchDetailsApi = testBranchDetailsApi;
    (window as any).testMultipleDateRanges = testMultipleDateRanges;

    console.log('🚀 Branch Details API Test Functions Available:');
    console.log('   testBranchDetailsApi({ storeId: 15, startDate: "2025-09-15", endDate: "2025-09-15" })');
    console.log('   testMultipleDateRanges(15)');
}
