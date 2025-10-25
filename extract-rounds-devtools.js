/**
 * Manual extraction script
 * For each round URL, navigate to it in the browser and run this extraction function
 */

const fs = require('fs');
const path = require('path');

// URLs to process
const roundUrls = [
  "https://play.golfshot.com/profiles/OYgqr/rounds/W9D8qn",
  "https://play.golfshot.com/profiles/OYgqr/rounds/n91lxY",
  "https://play.golfshot.com/profiles/OYgqr/rounds/LVrQQw",
  "https://play.golfshot.com/profiles/OYgqr/rounds/j9r8BP",
  "https://play.golfshot.com/profiles/OYgqr/rounds/Q8pnR0",
  "https://play.golfshot.com/profiles/OYgqr/rounds/xrAyY9",
  "https://play.golfshot.com/profiles/OYgqr/rounds/3xXLyp",
  "https://play.golfshot.com/profiles/OYgqr/rounds/O0DxJL",
  "https://play.golfshot.com/profiles/OYgqr/rounds/j9Apmv",
  "https://play.golfshot.com/profiles/OYgqr/rounds/j98yRl"
];

// Paste this function in browser console to extract data from current page:
const BROWSER_EXTRACT_FUNCTION = `
(() => {
  const data = {
    url: window.location.href,
    courseName: '',
    date: '',
    location: '',
    format: '',
    paceOfPlay: '',
    players: [],
    holes: []
  };

  // Extract course name - get the actual course name from the link text
  const courseHeading = document.querySelector('a[href*="courses"]');
  if (courseHeading) {
    // The text is like "Donnington Grove Golf Club - Donnington Grove"
    const fullText = courseHeading.textContent.trim();
    data.courseName = fullText.split(' - ')[0];
  }

  // Extract date and location
  const allText = document.body.textContent;
  const dateMatch = allText.match(/(\\w{3}\\s+\\d{1,2},\\s+\\d{4}),\\s+([A-Za-z\\s]+)/);
  if (dateMatch) {
    data.date = dateMatch[1];
    data.location = dateMatch[2].split('\\n')[0].trim();
  }

  // Extract format and pace
  const formatMatch = allText.match(/(Stableford|Stroke Play),\\s+([\\d:]+\\s+Pace of Play)/);
  if (formatMatch) {
    data.format = formatMatch[1];
    data.paceOfPlay = formatMatch[2];
  }

  // Extract table data
  const table = document.querySelector('table');
  if (!table) return JSON.stringify(data, null, 2);

  const rows = Array.from(table.querySelectorAll('tbody tr'));

  // Helper to extract row data by label
  const extractRowData = (label) => {
    const row = rows.find(r => {
      const firstCell = r.querySelector('td');
      return firstCell && firstCell.textContent.trim().toLowerCase() === label.toLowerCase();
    });

    if (!row) return null;
    const cells = Array.from(row.querySelectorAll('td')).slice(1);
    return cells.map(c => c.textContent.trim());
  };

  // Extract hole information
  const distance = extractRowData('distance') || [];
  const handicap = extractRowData('handicap') || [];
  const par = extractRowData('par') || [];

  // Create holes array - front 9 (indices 0-8)
  for (let i = 0; i < 9; i++) {
    if (par[i] && par[i] !== '—') {
      data.holes.push({
        hole: i + 1,
        par: par[i],
        distance: distance[i] || '',
        handicap: handicap[i] || ''
      });
    }
  }

  // Back 9 (indices 10-18, skip index 9 which is the "Out" total)
  for (let i = 10; i < 19 && i < par.length; i++) {
    if (par[i] && par[i] !== '—') {
      data.holes.push({
        hole: i,  // i is already 10-18 which are the correct hole numbers
        par: par[i],
        distance: distance[i] || '',
        handicap: handicap[i] || ''
      });
    }
  }

  // Extract players and their scores
  const playerRows = rows.filter(row => {
    const firstCell = row.querySelector('td');
    if (!firstCell) return false;

    const text = firstCell.textContent.trim();
    return /^[a-zA-Z]+$/.test(text) &&
           text.length > 2 && text.length < 20 &&
           !['Distance', 'Handicap', 'Par', 'Fairways', 'GIR', 'Putts', 'Sand', 'Penalties', 'Tee'].includes(text);
  });

  playerRows.forEach(row => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (cells.length > 0) {
      const playerName = cells[0].textContent.trim();
      const allScores = cells.slice(1).map(c => c.textContent.trim());

      // Extract front 9 (indices 0-8) and back 9 (indices 10-18, skip index 9)
      const front9 = allScores.slice(0, 9);
      const back9 = allScores.slice(10, 19);

      data.players.push({
        name: playerName,
        scores: [...front9, ...back9]
      });
    }
  });

  return JSON.stringify(data, null, 2);
})();
`;

console.log('Round extraction helper');
console.log('======================\n');
console.log('For each round URL, navigate to it and run this in the browser console:\n');
console.log(BROWSER_EXTRACT_FUNCTION);
console.log('\n\nThen save all results to golf-data/rounds-data.json as a JSON array.');
console.log('\nRound URLs to process:');
roundUrls.forEach((url, i) => {
  console.log(`${i + 1}. ${url}`);
});
