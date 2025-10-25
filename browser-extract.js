/**
 * Browser-based Golf Round Data Extractor
 *
 * Instructions:
 * 1. Navigate to https://play.golfshot.com/profiles/OYgqr/rounds
 * 2. Open browser console (F12)
 * 3. Paste this entire script and press Enter
 * 4. The script will automatically collect data from all rounds
 * 5. When complete, it will download a JSON file with all the data
 */

(async function extractAllGolfRounds() {
  console.log('🏌️ Starting Golf Round Data Extraction...');

  const allRoundsData = [];
  const baseUrl = 'https://play.golfshot.com/profiles/OYgqr/rounds';
  let totalRounds = 0;

  // Function to extract round URLs from current page
  function getRoundUrlsFromPage() {
    const rounds = [];
    const rows = document.querySelectorAll('tbody tr[data-href]');

    rows.forEach(row => {
      const href = row.getAttribute('data-href');
      const cells = row.querySelectorAll('td');

      if (href && cells.length >= 3) {
        rounds.push({
          url: 'https://play.golfshot.com' + href,
          date: cells[0]?.textContent.trim(),
          course: cells[1]?.textContent.trim(),
          score: cells[2]?.textContent.trim()
        });
      }
    });

    return rounds;
  }

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

    // Create holes array (only first 9 and last 9, skip the "Out" and "In" columns)
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

    // Back 9 (skip the "Out" total at index 9, start at 10)
    for (let i = 10; i < 19 && i < par.length; i++) {
      if (par[i] && par[i] !== '—') {
        data.holes.push({
          hole: i - 9 + 10,
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
      // Player names are typically short words
      return /^[a-zA-Z]+$/.test(text) &&
             text.length > 2 && text.length < 20 &&
             !['Distance', 'Handicap', 'Par', 'Fairways', 'GIR', 'Putts', 'Sand', 'Penalties', 'Tee'].includes(text);
    });

    playerRows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length > 0) {
        const playerName = cells[0].textContent.trim();
        const allScores = cells.slice(1).map(c => c.textContent.trim());

        // Extract front 9, back 9 (skip the totals)
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

  // Step 1: Collect all round URLs from all pages
  console.log('📋 Step 1: Collecting round URLs from all pages...');
  const allRoundUrls = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const pageUrl = `${baseUrl}?sb=Date&sd=Descending&p=${currentPage}`;
    console.log(`  Fetching page ${currentPage}...`);

    // Navigate to page
    window.history.pushState({}, '', pageUrl);
    await fetch(pageUrl);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get rounds from page via fetch and parse
    try {
      const response = await fetch(pageUrl);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const rows = doc.querySelectorAll('tbody tr[data-href]');
      const pageRounds = [];

      rows.forEach(row => {
        const href = row.getAttribute('data-href');
        const cells = row.querySelectorAll('td');

        if (href && cells.length >= 3) {
          pageRounds.push({
            url: 'https://play.golfshot.com' + href,
            date: cells[0]?.textContent.trim(),
            course: cells[1]?.textContent.trim(),
            score: cells[2]?.textContent.trim()
          });
        }
      });

      if (pageRounds.length === 0) {
        hasMorePages = false;
      } else {
        allRoundUrls.push(...pageRounds);
        console.log(`  Found ${pageRounds.length} rounds. Total so far: ${allRoundUrls.length}`);
        currentPage++;
      }

      // Check for next page
      const nextLink = doc.querySelector(`a[href*="p=${currentPage}"]`);
      if (!nextLink) {
        hasMorePages = false;
      }

      // Safety limit
      if (currentPage > 10) {
        console.log('  Reached page limit');
        hasMorePages = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${currentPage}:`, error);
      hasMorePages = false;
    }
  }

  totalRounds = allRoundUrls.length;
  console.log(`✅ Found ${totalRounds} total rounds!`);

  // Step 2: Extract detailed data from each round
  console.log('\n📊 Step 2: Extracting detailed data from each round...');
  console.log('This will take a few minutes...\n');

  for (let i = 0; i < allRoundUrls.length; i++) {
    const round = allRoundUrls[i];
    const progress = Math.round((i / allRoundUrls.length) * 100);

    console.log(`[${progress}%] Processing ${i + 1}/${allRoundUrls.length}: ${round.date} - ${round.course}`);

    try {
      // Fetch and parse the round page
      const response = await fetch(round.url);
      const html = await response.text();
      const parser = new DOMParser();
      const originalDoc = document.implementation.createHTMLDocument();
      originalDoc.documentElement.innerHTML = html;

      // Temporarily replace document to use extraction function
      const oldDoc = document;
      window.document = originalDoc;

      const detailedData = extractRoundDetails();

      // Restore original document
      window.document = oldDoc;

      // Combine metadata and detailed data
      allRoundsData.push({
        url: round.url,
        date: detailedData.date || round.date,
        courseName: detailedData.courseName || round.course,
        location: detailedData.location,
        format: detailedData.format,
        paceOfPlay: detailedData.paceOfPlay,
        score: round.score,
        players: detailedData.players,
        holes: detailedData.holes
      });

      // Small delay to avoid overwhelming the server
      if (i % 10 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`  ❌ Error extracting round ${round.url}:`, error.message);
    }
  }

  console.log(`\n✅ Extraction complete! Processed ${allRoundsData.length} rounds.`);

  // Step 3: Save data to file
  console.log('\n💾 Saving data...');

  const dataStr = JSON.stringify(allRoundsData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'golf-rounds-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('✅ Data saved to golf-rounds-data.json');
  console.log('\n🎉 All done! Now run the Node.js script to generate CSV files.');

  return allRoundsData;
})();
