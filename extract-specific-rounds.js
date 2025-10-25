/**
 * Browser Console Script to Extract Specific Golf Rounds
 *
 * Instructions:
 * 1. Open browser console (F12)
 * 2. Paste this entire script
 * 3. Press Enter
 * 4. Script will download rounds-data.json when complete
 */

(async function extractSpecificRounds() {
  console.log('🏌️ Starting extraction of 17 rounds...\n');

  const roundUrls = [
    "https://play.golfshot.com/profiles/OYgqr/rounds/YNwxjK", // Jan 04, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/MxzVZ3", // Jan 19, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/kNmAgx", // Feb 16, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/XloQRk", // Apr 13, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/jKnOyP", // Apr 21, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/NB81gK", // Apr 27, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/43kK3J", // Apr 30, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/ODLmWQ", // May 11, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/olnrL3", // May 18, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/kLJ9ON", // Jul 20, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/qkj8Y2", // Jul 28, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/RVog3O", // Jul 30, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/5zRxPx", // Aug 07, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/j98yRl", // Aug 10, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/j9Apmv", // Aug 17, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/O0DxJL", // Sep 07, 2025
    "https://play.golfshot.com/profiles/OYgqr/rounds/3xXLyp"  // Sep 21, 2025
  ];

  const allRoundsData = [];

  // Function to extract detailed data from a round page
  function extractRoundDetails() {
    const data = {
      courseName: '',
      date: '',
      location: '',
      format: '',
      paceOfPlay: '',
      players: [],
      holes: []
    };

    // Extract course name
    const courseLink = document.querySelector('a[href*="courses"]');
    if (courseLink) {
      data.courseName = courseLink.textContent.trim().split(' - ')[0];
    }

    // Extract date and location
    const allText = document.body.textContent;
    const dateMatch = allText.match(/(\w{3}\s+\d{1,2},\s+\d{4}),\s+([A-Za-z\s]+)/);
    if (dateMatch) {
      data.date = dateMatch[1];
      data.location = dateMatch[2].split('\n')[0].trim();
    }

    // Extract format and pace
    const formatMatch = allText.match(/(Stableford|Stroke Play),\s+([\d:]+\s+Pace of Play)/);
    if (formatMatch) {
      data.format = formatMatch[1];
      data.paceOfPlay = formatMatch[2];
    }

    // Extract table data
    const table = document.querySelector('table');
    if (!table) return data;

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

    // Create holes array (front 9: indices 0-8)
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

    // Back 9 (indices 10-18, skip index 9 which is "Out" total)
    for (let i = 10; i < 19 && i < par.length; i++) {
      if (par[i] && par[i] !== '—') {
        data.holes.push({
          hole: i,
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

        // Extract front 9 and back 9 (skip the "Out" total at index 9)
        const front9 = allScores.slice(0, 9);
        const back9 = allScores.slice(10, 19);

        data.players.push({
          name: playerName,
          scores: [...front9, ...back9]
        });
      }
    });

    return data;
  }

  // Extract each round
  for (let i = 0; i < roundUrls.length; i++) {
    const url = roundUrls[i];
    const progress = Math.round((i / roundUrls.length) * 100);
    console.log(`[${progress}%] Extracting round ${i + 1}/${roundUrls.length}...`);

    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Temporarily replace document to use extraction function
      const originalDoc = document;
      const tempDoc = document.implementation.createHTMLDocument();
      tempDoc.documentElement.innerHTML = html;

      // Create a temporary window context
      const savedDoc = window.document;
      window.document = tempDoc;

      const detailedData = extractRoundDetails();

      // Restore
      window.document = savedDoc;

      allRoundsData.push({
        url: url,
        ...detailedData
      });

      // Small delay
      if (i < roundUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`Error extracting ${url}:`, error.message);
    }
  }

  console.log(`\n✅ Extraction complete! Processed ${allRoundsData.length} rounds.`);
  console.log('\n💾 Downloading rounds-data.json...');

  // Download the data
  const dataStr = JSON.stringify(allRoundsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'rounds-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  console.log('✅ Download started! Save the file to golf-data/rounds-data.json');

  return allRoundsData;
})();
