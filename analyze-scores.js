const fs = require('fs');

// Read rounds data
const rounds = JSON.parse(fs.readFileSync('golf-data/rounds-data.json', 'utf8'));

// Calculate scores for each round
const results = rounds.map(round => {
  const result = {
    date: round.date,
    url: round.url,
    courseName: round.courseName
  };

  // Find lest and Gary
  const lest = round.players.find(p => p.name.toLowerCase() === 'lest');
  const gary = round.players.find(p => p.name.toLowerCase() === 'gary');

  // Calculate total scores and count holes played
  if (lest) {
    const holesPlayed = lest.scores.filter(s => s !== '').length;
    const rawScore = lest.scores
      .filter(s => s !== '')
      .reduce((sum, score) => sum + parseInt(score), 0);

    result.lestHolesPlayed = holesPlayed;
    result.lestRawScore = rawScore;
    // Normalize to 18 holes: score * (18 / holes_played)
    result.lestScore = Math.round(rawScore * (18 / holesPlayed));
  }

  if (gary) {
    const holesPlayed = gary.scores.filter(s => s !== '').length;
    const rawScore = gary.scores
      .filter(s => s !== '')
      .reduce((sum, score) => sum + parseInt(score), 0);

    result.garyHolesPlayed = holesPlayed;
    result.garyRawScore = rawScore;
    // Normalize to 18 holes: score * (18 / holes_played)
    result.garyScore = Math.round(rawScore * (18 / holesPlayed));
  }

  return result;
});

// Filter to only rounds where both players have scores
const bothPlayed = results.filter(r => r.lestScore && r.garyScore);

console.log('\nScores for all 2025 rounds (normalized to 18 holes):\n');
console.log('Date'.padEnd(15), 'Lest'.padEnd(15), 'Gary'.padEnd(15), 'Winner'.padEnd(10), 'Holes');
console.log('-'.repeat(70));

bothPlayed.forEach(r => {
  const winner = r.lestScore < r.garyScore ? 'Lest' : (r.garyScore < r.lestScore ? 'Gary' : 'Tie');
  const holesLest = r.lestHolesPlayed;
  const holesGary = r.garyHolesPlayed;

  let lestDisplay, garyDisplay, holesDisplay;

  if (holesLest === 18) {
    lestDisplay = r.lestRawScore.toString();
  } else {
    lestDisplay = `${r.lestRawScore}×${18}/${holesLest}=${r.lestScore}`;
  }

  if (holesGary === 18) {
    garyDisplay = r.garyRawScore.toString();
  } else {
    garyDisplay = `${r.garyRawScore}×${18}/${holesGary}=${r.garyScore}`;
  }

  if (holesLest === holesGary) {
    holesDisplay = `${holesLest} holes`;
  } else {
    holesDisplay = `L:${holesLest} G:${holesGary}`;
  }

  console.log(
    r.date.padEnd(15),
    lestDisplay.padEnd(15),
    garyDisplay.padEnd(15),
    winner.padEnd(10),
    holesDisplay
  );
});

console.log('\n' + '-'.repeat(70));
console.log('\nTotal rounds:', bothPlayed.length);

const lestWins = bothPlayed.filter(r => r.lestScore < r.garyScore).length;
const garyWins = bothPlayed.filter(r => r.garyScore < r.lestScore).length;
const ties = bothPlayed.filter(r => r.lestScore === r.garyScore).length;

console.log('Lest wins:', lestWins);
console.log('Gary wins:', garyWins);
console.log('Ties:', ties);

// Save data for graphing
const graphData = {
  dates: bothPlayed.map(r => r.date),
  lestScores: bothPlayed.map(r => r.lestScore),
  garyScores: bothPlayed.map(r => r.garyScore),
  lestRawScores: bothPlayed.map(r => r.lestRawScore),
  garyRawScores: bothPlayed.map(r => r.garyRawScore),
  lestHolesPlayed: bothPlayed.map(r => r.lestHolesPlayed),
  garyHolesPlayed: bothPlayed.map(r => r.garyHolesPlayed)
};

fs.writeFileSync('golf-data/score-graph-data.json', JSON.stringify(graphData, null, 2));
console.log('\n✅ Graph data saved to golf-data/score-graph-data.json');
