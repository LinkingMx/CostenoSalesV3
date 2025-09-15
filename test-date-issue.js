// Test to understand the date range issue

// Simulate API response with dates
const mockApiData = {
  data: {
    range: {
      actual: {
        "2025-09-07": 4337259.37,  // Sunday
        "2025-09-08": 6074341.28,  // Monday
        "2025-09-09": 7522507.81,  // Tuesday
        "2025-09-10": 8974341.28,  // Wednesday
        "2025-09-11": 7074341.28,  // Thursday
        "2025-09-12": 9574341.28,  // Friday
        "2025-09-13": 7074341.28   // Saturday
      },
      last: {
        "2025-08-31": 4313279.54,  // Sunday
        "2025-09-01": 6238484.82,  // Monday
        "2025-09-02": 7598357.42,  // Tuesday
        "2025-09-03": 8938484.82,  // Wednesday
        "2025-09-04": 7238484.82,  // Thursday
        "2025-09-05": 9638484.82,  // Friday
        "2025-09-06": 7238484.82   // Saturday
      },
      two_last: {
        "2025-08-24": 4239247.1,   // Sunday
        "2025-08-25": 6191199.47,  // Monday
        "2025-08-26": 7639247.1,   // Tuesday
        "2025-08-27": 8991199.47,  // Wednesday
        "2025-08-28": 7191199.47,  // Thursday
        "2025-08-29": 9591199.47,  // Friday
        "2025-08-30": 7191199.47   // Saturday
      }
    }
  }
};

// Process the data like the component does
function processWeekData(weekData, weekLabel) {
  const dates = Object.keys(weekData).sort();
  console.log(`\n${weekLabel} week dates:`, dates);

  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  console.log(`Start: ${dates[0]} (${startDate.toLocaleDateString('en-US', { weekday: 'long' })})`);
  console.log(`End: ${dates[dates.length - 1]} (${endDate.toLocaleDateString('en-US', { weekday: 'long' })})`);

  // Format like the component does
  const startDD = startDate.getDate().toString().padStart(2, '0');
  const startMM = (startDate.getMonth() + 1).toString().padStart(2, '0');
  const endDD = endDate.getDate().toString().padStart(2, '0');
  const endMM = (endDate.getMonth() + 1).toString().padStart(2, '0');
  const endYY = endDate.getFullYear().toString().slice(-2);

  const formatted = `${startDD}-${startMM} al ${endDD}-${endMM}-${endYY}`;
  console.log(`Formatted: ${formatted}`);

  return formatted;
}

// Process each week
console.log("=== API Data Analysis ===");
const actualFormatted = processWeekData(mockApiData.data.range.actual, 'Actual');
const lastFormatted = processWeekData(mockApiData.data.range.last, 'Last');
const twoLastFormatted = processWeekData(mockApiData.data.range.two_last, 'Two Last');

console.log("\n=== Summary ===");
console.log("Card A (Actual):", actualFormatted);
console.log("Card P (Last):", lastFormatted);
console.log("Card H (Two Last):", twoLastFormatted);

console.log("\n=== What User Selected ===");
console.log("User selected: Sep 8-14, 2025 (Monday to Sunday)");
console.log("But API returns: Sep 7-13, 2025 (Sunday to Saturday)");