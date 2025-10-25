const fs = require('fs');
const path = require('path');

// This script processes the manually extracted rounds data
// Place your extracted data in golf-data/rounds-data.json

const OUTPUT_DIR = './golf-data';

function sanitizeFilename(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

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

function main() {
  const dataFile = path.join(OUTPUT_DIR, 'rounds-data.json');

  if (!fs.existsSync(dataFile)) {
    console.log('❌ No rounds-data.json file found at:', dataFile);
    console.log('Please extract the data first.');
    return;
  }

  console.log('📊 Processing golf rounds data...');

  const rounds = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log(`Loaded ${rounds.length} rounds`);

  const playerCourseData = processRoundsData(rounds);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

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
}

main();
