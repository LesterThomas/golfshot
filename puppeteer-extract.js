/**
 * Puppeteer-based Golf Round Data Extractor
 *
 * This script uses Puppeteer to automatically extract all golf rounds from Golfshot
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://play.golfshot.com/profiles/OYgqr/rounds';
const OUTPUT_FILE = path.join(__dirname, 'golf-data', 'rounds-data.json');

// Function to extract round details from a page
const extractRoundDetails = () => {
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
};

async function extractAllRounds() {
  console.log('🏌️ Starting Puppeteer Golf Round Data Extraction...\n');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    defaultViewport: null
  });

  try {
    const page = await browser.newPage();

    // Navigate to rounds page
    console.log('📋 Step 1: Collecting round URLs...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2' });

    // Wait for user to log in if needed
    console.log('⏳ Waiting 10 seconds for page to load (and for you to log in if needed)...');
    await page.waitForTimeout(10000);

    // Collect all round URLs from all pages
    const allRoundUrls = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      console.log(`  Scanning page ${currentPage}...`);

      // Extract round URLs from current page
      const pageRounds = await page.evaluate(() => {
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
      });

      if (pageRounds.length === 0) {
        hasMorePages = false;
      } else {
        allRoundUrls.push(...pageRounds);
        console.log(`  Found ${pageRounds.length} rounds (total: ${allRoundUrls.length})`);

        // Check if there's a next page
        const nextPageExists = await page.evaluate((pageNum) => {
          const nextLink = document.querySelector(`a[href*="p=${pageNum}"]`);
          return !!nextLink;
        }, currentPage + 1);

        if (nextPageExists && currentPage < 20) { // Safety limit
          currentPage++;
          await page.goto(`${BASE_URL}?sb=Date&sd=Descending&p=${currentPage}`, {
            waitUntil: 'networkidle2'
          });
          await page.waitForTimeout(1000);
        } else {
          hasMorePages = false;
        }
      }
    }

    console.log(`✅ Found ${allRoundUrls.length} total rounds!\n`);

    // Step 2: Extract detailed data from each round
    console.log('📊 Step 2: Extracting detailed data from each round...\n');
    const allRoundsData = [];

    for (let i = 0; i < allRoundUrls.length; i++) {
      const round = allRoundUrls[i];
      const progress = Math.round((i / allRoundUrls.length) * 100);

      console.log(`[${progress}%] ${i + 1}/${allRoundUrls.length}: ${round.date} - ${round.course}`);

      try {
        await page.goto(round.url, { waitUntil: 'networkidle2' });
        await page.waitForTimeout(500);

        const detailedData = await page.evaluate(extractRoundDetails);

        allRoundsData.push(detailedData);
      } catch (error) {
        console.error(`  ❌ Error extracting ${round.url}:`, error.message);
      }
    }

    console.log(`\n✅ Extraction complete! Processed ${allRoundsData.length} rounds.`);

    // Save to file
    console.log('\n💾 Saving data to', OUTPUT_FILE);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allRoundsData, null, 2));
    console.log('✅ Data saved successfully!\n');

    console.log('🎉 All done! Now run the date range script to generate CSV files.');

  } finally {
    await browser.close();
  }
}

// Run the extraction
extractAllRounds().catch(console.error);
