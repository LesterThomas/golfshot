const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://play.golfshot.com/profiles/OYgqr/rounds';
const OUTPUT_DIR = './golf-data';

// Helper function to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create CSV content
function createCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      if (value.toString().includes(',') || value.toString().includes('"')) {
        return `"${value.toString().replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// Sanitize filename
function sanitizeFilename(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function extractRoundData(page, roundUrl) {
  try {
    await page.goto(roundUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    await sleep(1000);

    // Extract round data from the page
    const roundData = await page.evaluate(() => {
      const data = {
        courseName: '',
        courseDetails: '',
        date: '',
        location: '',
        format: '',
        paceOfPlay: '',
        players: [],
        holes: []
      };

      // Extract course info
      const courseLink = document.querySelector('a[href*="courses"]');
      if (courseLink) {
        data.courseName = courseLink.textContent.trim();
      }

      // Extract date and location
      const dateElement = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent.match(/\w{3}\s+\d{1,2},\s+\d{4}/)
      );
      if (dateElement) {
        const text = dateElement.textContent.trim();
        const match = text.match(/(\w{3}\s+\d{1,2},\s+\d{4}),\s+(.+)/);
        if (match) {
          data.date = match[1];
          data.location = match[2];
        }
      }

      // Extract format and pace
      const formatElement = Array.from(document.querySelectorAll('*')).find(el =>
        el.textContent.includes('Stableford') || el.textContent.includes('Stroke Play')
      );
      if (formatElement) {
        const text = formatElement.textContent.trim();
        const match = text.match(/(.+?),\s+(.+Pace of Play)/);
        if (match) {
          data.format = match[1];
          data.paceOfPlay = match[2];
        }
      }

      // Extract player names and scores
      const table = document.querySelector('table');
      if (!table) return data;

      const rows = Array.from(table.querySelectorAll('tbody tr'));

      // Find player rows (they have player names)
      const playerNameRows = rows.filter(row => {
        const firstCell = row.querySelector('td');
        return firstCell && firstCell.textContent.match(/^[a-zA-Z]+$/) &&
               firstCell.textContent.length < 20;
      });

      // Extract player data
      playerNameRows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length > 0) {
          const playerName = cells[0].textContent.trim();
          const scores = cells.slice(1).map(cell => cell.textContent.trim());
          data.players.push({ name: playerName, scores: scores });
        }
      });

      // Extract hole information (distance, par, handicap)
      const headerRows = {
        distance: null,
        handicap: null,
        par: null
      };

      rows.forEach(row => {
        const firstCell = row.querySelector('td');
        if (!firstCell) return;

        const label = firstCell.textContent.trim().toLowerCase();
        if (label === 'distance') {
          headerRows.distance = Array.from(row.querySelectorAll('td')).slice(1).map(c => c.textContent.trim());
        } else if (label === 'handicap') {
          headerRows.handicap = Array.from(row.querySelectorAll('td')).slice(1).map(c => c.textContent.trim());
        } else if (label === 'par') {
          headerRows.par = Array.from(row.querySelectorAll('td')).slice(1).map(c => c.textContent.trim());
        }
      });

      // Create hole data structure
      if (headerRows.par) {
        for (let i = 0; i < 18 && i < headerRows.par.length; i++) {
          data.holes.push({
            hole: i + 1,
            par: headerRows.par[i] || '',
            distance: headerRows.distance ? headerRows.distance[i] : '',
            handicap: headerRows.handicap ? headerRows.handicap[i] : ''
          });
        }
      }

      return data;
    });

    return roundData;
  } catch (error) {
    console.error(`Error extracting round data from ${roundUrl}:`, error.message);
    return null;
  }
}

async function getAllRounds(page) {
  const allRounds = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const pageUrl = `${BASE_URL}?sb=Date&sd=Descending&p=${currentPage}`;
    console.log(`Fetching page ${currentPage}...`);

    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(1000);

      // Extract rounds from current page
      const rounds = await page.evaluate(() => {
        const roundRows = [];
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach((row, index) => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 5) {
            const dateCell = cells[0];
            const courseCell = cells[1];
            const scoreCell = cells[2];

            if (dateCell && courseCell && scoreCell) {
              roundRows.push({
                index: index,
                date: dateCell.textContent.trim(),
                course: courseCell.textContent.trim(),
                score: scoreCell.textContent.trim()
              });
            }
          }
        });

        return roundRows;
      });

      if (rounds.length === 0) {
        hasMorePages = false;
      } else {
        allRounds.push(...rounds.map(r => ({ ...r, page: currentPage })));
        console.log(`Found ${rounds.length} rounds on page ${currentPage}`);
        currentPage++;

        // Check if there's a next page link
        const hasNext = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="rounds"]'));
          return links.some(a => a.href.includes(`p=${currentPage + 1}`));
        });

        if (!hasNext) {
          hasMorePages = false;
        }
      }
    } catch (error) {
      console.error(`Error on page ${currentPage}:`, error.message);
      hasMorePages = false;
    }
  }

  return allRounds;
}

async function main() {
  console.log('Starting golf round data extraction...');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();

    // Step 1: Get all rounds metadata
    console.log('Step 1: Collecting all rounds metadata...');
    const allRounds = await getAllRounds(page);
    console.log(`Total rounds found: ${allRounds.length}`);

    // Save rounds metadata
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'rounds-metadata.json'),
      JSON.stringify(allRounds, null, 2)
    );

    // Step 2: Extract detailed data for each round
    console.log('Step 2: Extracting detailed data for each round...');
    const detailedRounds = [];

    for (let i = 0; i < allRounds.length; i++) {
      const round = allRounds[i];
      console.log(`Processing round ${i + 1}/${allRounds.length}: ${round.date} - ${round.course}`);

      // Navigate to the specific page and click the round
      const pageUrl = `${BASE_URL}?sb=Date&sd=Descending&p=${round.page}`;
      await page.goto(pageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
      await sleep(500);

      // Click on the date cell to open the round
      await page.evaluate((index) => {
        const rows = document.querySelectorAll('tbody tr');
        const row = rows[index];
        if (row) {
          const dateCell = row.querySelector('td');
          if (dateCell) {
            dateCell.click();
          }
        }
      }, round.index);

      await sleep(2000);

      // Extract the detailed round data
      const detailedData = await extractRoundData(page, page.url());

      if (detailedData) {
        detailedRounds.push({
          metadata: round,
          details: detailedData
        });
      }

      // Go back to rounds list
      await page.goBack();
      await sleep(500);
    }

    // Save all detailed rounds
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'all-rounds-detailed.json'),
      JSON.stringify(detailedRounds, null, 2)
    );

    // Step 3: Organize by player/course and create CSV files
    console.log('Step 3: Creating CSV files by player/course...');
    const playerCourseData = {};

    detailedRounds.forEach(round => {
      const { metadata, details } = round;

      details.players.forEach(player => {
        const playerName = player.name;
        const courseName = sanitizeFilename(details.courseName || metadata.course);
        const key = `${sanitizeFilename(playerName)}-${courseName}`;

        if (!playerCourseData[key]) {
          playerCourseData[key] = {
            playerName: playerName,
            courseName: details.courseName || metadata.course,
            rounds: []
          };
        }

        // Create a flat structure for CSV
        const roundRecord = {
          date: details.date || metadata.date,
          location: details.location,
          format: details.format,
          paceOfPlay: details.paceOfPlay,
          totalScore: metadata.score
        };

        // Add hole-by-hole scores
        details.holes.forEach((hole, idx) => {
          roundRecord[`hole${hole.hole}_par`] = hole.par;
          roundRecord[`hole${hole.hole}_score`] = player.scores[idx] || '';
          roundRecord[`hole${hole.hole}_distance`] = hole.distance;
        });

        playerCourseData[key].rounds.push(roundRecord);
      });
    });

    // Write CSV files
    Object.keys(playerCourseData).forEach(key => {
      const data = playerCourseData[key];
      const csvContent = createCSV(data.rounds);
      const filename = `${key}.csv`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), csvContent);
      console.log(`Created ${filename} with ${data.rounds.length} rounds`);
    });

    console.log('Extraction complete!');
    console.log(`Data saved to ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('Error during extraction:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
