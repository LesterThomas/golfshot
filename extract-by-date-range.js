/**
 * Extract golf rounds by date range
 * This script is designed to be called by the Claude command
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = './golf-data';

// Parse date arguments
const args = process.argv.slice(2);
const startDateStr = args[0] || null;
const endDateStr = args[1] || null;

// Convert date string like "Oct 24, 2025" to Date object
function parseGolfDate(dateStr) {
  if (!dateStr) return null;

  // Handle format "MMM DD, YYYY" or "Oct 24, 2025"
  const date = new Date(dateStr);
  return isNaN(date) ? null : date;
}

// Check if a date string is within range
function isDateInRange(dateStr, startDate, endDate) {
  const date = parseGolfDate(dateStr);
  if (!date) return true; // If can't parse, include it

  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;

  return true;
}

// Filter rounds by date range
function filterRoundsByDateRange(rounds, startDate, endDate) {
  return rounds.filter(round => isDateInRange(round.date, startDate, endDate));
}

// Main function to be called with extracted rounds data
function processExtractedRounds(allRounds, startDate, endDate) {
  console.log(`\n📅 Filtering rounds...`);

  if (startDate) {
    console.log(`  Start date: ${startDate.toDateString()}`);
  }
  if (endDate) {
    console.log(`  End date: ${endDate.toDateString()}`);
  }

  const filteredRounds = filterRoundsByDateRange(allRounds, startDate, endDate);

  console.log(`✅ ${filteredRounds.length} rounds match the date range (out of ${allRounds.length} total)\n`);

  return filteredRounds;
}

// Sanitize filename
function sanitizeFilename(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Create CSV content
function createCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header] !== undefined && row[header] !== null ? row[header].toString() : '';
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// Process rounds data and organize by player/course
function processRoundsData(rounds) {
  const playerCourseData = {};

  rounds.forEach(round => {
    const { date, courseName, location, format, paceOfPlay, players, holes } = round;

    players.forEach(player => {
      const playerName = player.name;
      const courseKey = sanitizeFilename(courseName);
      const key = `${sanitizeFilename(playerName)}-${courseKey}`;

      if (!playerCourseData[key]) {
        playerCourseData[key] = {
          playerName: playerName,
          courseName: courseName,
          rounds: []
        };
      }

      const roundRecord = {
        date: date,
        location: location || '',
        format: format || '',
        paceOfPlay: paceOfPlay || ''
      };

      // Add hole details and scores
      holes.forEach((hole, idx) => {
        const holeNum = hole.hole;
        roundRecord[`hole${holeNum}_par`] = hole.par;
        roundRecord[`hole${holeNum}_distance`] = hole.distance;
        roundRecord[`hole${holeNum}_handicap`] = hole.handicap;

        if (player.scores && player.scores[idx]) {
          roundRecord[`hole${holeNum}_score`] = player.scores[idx];
        }
      });

      // Calculate totals
      const scores = player.scores.filter(s => s && s !== '—' && !isNaN(parseInt(s)));
      const totalScore = scores.reduce((sum, score) => sum + parseInt(score), 0);

      roundRecord.total_score = totalScore || '';

      playerCourseData[key].rounds.push(roundRecord);
    });
  });

  return playerCourseData;
}

// Export functions for use by Claude
module.exports = {
  parseGolfDate,
  isDateInRange,
  filterRoundsByDateRange,
  processExtractedRounds,
  processRoundsData,
  createCSV,
  sanitizeFilename
};

// If run directly, provide usage info
if (require.main === module) {
  const startDate = parseGolfDate(startDateStr);
  const endDate = parseGolfDate(endDateStr);

  console.log('🏌️ Golf Rounds Extraction by Date Range');
  console.log('=========================================\n');

  if (startDate) {
    console.log(`Start Date: ${startDate.toDateString()}`);
  } else {
    console.log('Start Date: (beginning of time)');
  }

  if (endDate) {
    console.log(`End Date: ${endDate.toDateString()}`);
  } else {
    console.log('End Date: (today)');
  }

  console.log('\nThis script will be called by the Claude command to filter and process rounds.');
  console.log('Place extracted rounds data in golf-data/rounds-data.json and run via Claude command.\n');

  // Check if data file exists
  const dataFile = path.join(OUTPUT_DIR, 'rounds-data.json');
  if (fs.existsSync(dataFile)) {
    const allRounds = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const filtered = processExtractedRounds(allRounds, startDate, endDate);

    console.log(`📊 Processing ${filtered.length} rounds...`);

    const playerCourseData = processRoundsData(filtered);

    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write CSV files
    Object.keys(playerCourseData).forEach(key => {
      const data = playerCourseData[key];
      if (data.rounds.length === 0) return;

      const csvContent = createCSV(data.rounds);
      const filename = `${key}.csv`;
      const filepath = path.join(OUTPUT_DIR, filename);

      fs.writeFileSync(filepath, csvContent);
      console.log(`✅ Created ${filename} with ${data.rounds.length} rounds`);
    });

    console.log('\n🎉 Processing complete!');
  } else {
    console.log('❌ No rounds-data.json file found. Extract rounds first via Claude command.');
  }
}
