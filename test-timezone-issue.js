// Test timezone issue with Date parsing

console.log("=== Timezone Issue Test ===");

// Test date string
const dateStr = "2025-09-07";
console.log("Date string:", dateStr);

// Parse as Date
const date = new Date(dateStr);
console.log("new Date():", date);
console.log("toISOString():", date.toISOString());
console.log("getDate():", date.getDate());
console.log("getDay():", date.getDay(), "(0=Sunday, 6=Saturday)");
console.log("Local date string:", date.toLocaleDateString());

// Parse with explicit time
const dateWithTime = new Date(dateStr + "T00:00:00");
console.log("\n--- With explicit time T00:00:00 ---");
console.log("new Date():", dateWithTime);
console.log("getDate():", dateWithTime.getDate());
console.log("getDay():", dateWithTime.getDay());

// Using proper date parsing
function parseApiDate(dateStr) {
  // Split the date string
  const [year, month, day] = dateStr.split('-').map(Number);
  // Create date using local timezone (month is 0-indexed)
  return new Date(year, month - 1, day);
}

const properDate = parseApiDate(dateStr);
console.log("\n--- Using proper parsing ---");
console.log("Parsed date:", properDate);
console.log("getDate():", properDate.getDate());
console.log("getDay():", properDate.getDay());
console.log("Local date string:", properDate.toLocaleDateString());

// Test all dates
console.log("\n=== Testing API dates ===");
const testDates = [
  "2025-09-07",  // Should be Sunday
  "2025-09-08",  // Should be Monday
  "2025-09-13",  // Should be Saturday
  "2025-09-14"   // Should be Sunday
];

testDates.forEach(dateStr => {
  const wrongDate = new Date(dateStr);
  const correctDate = parseApiDate(dateStr);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  console.log(`\n${dateStr}:`);
  console.log(`  Wrong: Day ${wrongDate.getDate()}, ${dayNames[wrongDate.getDay()]}`);
  console.log(`  Correct: Day ${correctDate.getDate()}, ${dayNames[correctDate.getDay()]}`);
});