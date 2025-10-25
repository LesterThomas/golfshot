/**
 * Script to extract all golf round data from Golfshot
 * Run this using: node extract-all-rounds.js
 */

const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = './golf-data';

// Sample data structure - in real use, you would collect this from the browser
const roundsData = [];

// Helper to sanitize filenames
function sanitizeFilename(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper to create CSV content
function createCSV(data) {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(header => {
      const value = row[header] !== undefined && row[header] !== null ? row[header].toString() : '';
      // Escape quotes and wrap in quotes if contains comma
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

// Process the extracted data and organize by player/course
function processRoundsData(allRounds) {
  const playerCourseData = {};

  allRounds.forEach(round => {
    const { date, courseName, location, format, paceOfPlay, players, holes } = round;

    // Process each player in the round
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

      // Create a flat structure for CSV
      const roundRecord = {
        date: date,
        location: location,
        format: format,
        paceOfPlay: paceOfPlay
      };

      // Add hole information
      holes.forEach((hole, idx) => {
        const holeNum = hole.hole;
        roundRecord[`hole${holeNum}_par`] = hole.par;
        roundRecord[`hole${holeNum}_distance`] = hole.distance;
        roundRecord[`hole${holeNum}_handicap`] = hole.handicap;

        // Add player's score for this hole
        if (player.scores && player.scores[idx]) {
          roundRecord[`hole${holeNum}_score`] = player.scores[idx];
        }
      });

      // Calculate totals
      const frontNine = player.scores.slice(0, 9).reduce((sum, score) => {
        const num = parseInt(score);
        return sum + (isNaN(num) ? 0 : num);
      }, 0);

      const backNine = player.scores.slice(9, 18).reduce((sum, score) => {
        const num = parseInt(score);
        return sum + (isNaN(num) ? 0 : num);
      }, 0);

      roundRecord.front_nine = frontNine || '';
      roundRecord.back_nine = backNine || '';
      roundRecord.total_score = (frontNine + backNine) || '';

      playerCourseData[key].rounds.push(roundRecord);
    });
  });

  return playerCourseData;
}

// Main function
function main() {
  console.log('Processing golf rounds data...');

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if we have a data file to process
  const dataFile = path.join(OUTPUT_DIR, 'extracted-rounds.json');

  if (!fs.existsSync(dataFile)) {
    console.log('No extracted-rounds.json file found.');
    console.log('Please run the data extraction first using the browser.');
    console.log('The file should be saved at:', dataFile);
    return;
  }

  // Load the data
  const allRounds = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log(`Loaded ${allRounds.length} rounds`);

  // Process and organize by player/course
  const playerCourseData = processRoundsData(allRounds);

  // Write CSV files
  Object.keys(playerCourseData).forEach(key => {
    const data = playerCourseData[key];
    if (data.rounds.length === 0) {
      console.log(`Skipping ${key} - no rounds`);
      return;
    }

    const csvContent = createCSV(data.rounds);
    const filename = `${key}.csv`;
    const filepath = path.join(OUTPUT_DIR, filename);

    fs.writeFileSync(filepath, csvContent);
    console.log(`Created ${filename} with ${data.rounds.length} rounds`);
  });

  console.log('\nProcessing complete!');
  console.log(`CSV files saved to ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processRoundsData, createCSV, sanitizeFilename };
