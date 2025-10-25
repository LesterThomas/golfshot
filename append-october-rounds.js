const fs = require('fs');

// Read existing data
const existingData = JSON.parse(fs.readFileSync('golf-data/rounds-data.json', 'utf8'));

// New rounds to append (October 2025)
const newRounds = [
  {
    url: 'https://play.golfshot.com/profiles/OYgqr/rounds/xrAyY9',
    courseName: 'Donnington Grove Golf Club',
    date: 'Oct 03, 2025',
    location: 'Newbury',
    format: 'Stableford',
    paceOfPlay: '4:37 Pace of Play',
    players: [
      {name: 'lest', scores: ['6','6','5','5','4','6','5','7','6','7','6','6','8','5','4','7','5','7']},
      {name: 'Gary', scores: ['5','5','5','6','3','7','4','7','5','8','6','5','7','7','6','5','4','7']}
    ],
    holes: [
      {hole: 1, par: '4', distance: '373', handicap: '10'},
      {hole: 2, par: '5', distance: '511', handicap: '8'},
      {hole: 3, par: '4', distance: '389', handicap: '12'},
      {hole: 4, par: '4', distance: '422', handicap: '2'},
      {hole: 5, par: '3', distance: '168', handicap: '16'},
      {hole: 6, par: '5', distance: '550', handicap: '6'},
      {hole: 7, par: '3', distance: '155', handicap: '18'},
      {hole: 8, par: '4', distance: '441', handicap: '4'},
      {hole: 9, par: '4', distance: '317', handicap: '14'},
      {hole: 10, par: '5', distance: '567', handicap: '5'},
      {hole: 11, par: '4', distance: '382', handicap: '1'},
      {hole: 12, par: '4', distance: '366', handicap: '13'},
      {hole: 13, par: '5', distance: '502', handicap: '7'},
      {hole: 14, par: '4', distance: '310', handicap: '17'},
      {hole: 15, par: '3', distance: '161', handicap: '15'},
      {hole: 16, par: '4', distance: '405', handicap: '3'},
      {hole: 17, par: '3', distance: '186', handicap: '9'},
      {hole: 18, par: '4', distance: '371', handicap: '11'}
    ]
  },
  {
    url: 'https://play.golfshot.com/profiles/OYgqr/rounds/Q8pnR0',
    courseName: 'Donnington Grove Golf Club',
    date: 'Oct 05, 2025',
    location: 'Newbury',
    format: 'Stableford',
    paceOfPlay: '2:26 Pace of Play',
    players: [
      {name: 'lest', scores: ['6','7','7','6','5','8','6','6','6','','','','','','','','','']},
      {name: 'Gary', scores: ['6','7','5','5','3','8','5','5','6','','','','','','','','','']}
    ],
    holes: [
      {hole: 1, par: '4', distance: '373', handicap: '10'},
      {hole: 2, par: '5', distance: '511', handicap: '8'},
      {hole: 3, par: '4', distance: '389', handicap: '12'},
      {hole: 4, par: '4', distance: '422', handicap: '2'},
      {hole: 5, par: '3', distance: '168', handicap: '16'},
      {hole: 6, par: '5', distance: '550', handicap: '6'},
      {hole: 7, par: '3', distance: '155', handicap: '18'},
      {hole: 8, par: '4', distance: '441', handicap: '4'},
      {hole: 9, par: '4', distance: '317', handicap: '14'},
      {hole: 10, par: '5', distance: '567', handicap: '5'},
      {hole: 11, par: '4', distance: '382', handicap: '1'},
      {hole: 12, par: '4', distance: '366', handicap: '13'},
      {hole: 13, par: '5', distance: '502', handicap: '7'},
      {hole: 14, par: '4', distance: '310', handicap: '17'},
      {hole: 15, par: '3', distance: '161', handicap: '15'},
      {hole: 16, par: '4', distance: '405', handicap: '3'},
      {hole: 17, par: '3', distance: '186', handicap: '9'},
      {hole: 18, par: '4', distance: '371', handicap: '11'}
    ]
  },
  {
    url: 'https://play.golfshot.com/profiles/OYgqr/rounds/j9r8BP',
    courseName: 'Donnington Grove Golf Club',
    date: 'Oct 12, 2025',
    location: 'Newbury',
    format: 'Stableford',
    paceOfPlay: '4:45 Pace of Play',
    players: [
      {name: 'lest', scores: ['7','6','7','6','4','7','6','5','7','7','4','5','6','5','5','5','6','4']},
      {name: 'Gary', scores: ['5','6','5','4','4','6','5','5','5','7','6','5','6','6','4','6','4','6']}
    ],
    holes: [
      {hole: 1, par: '4', distance: '373', handicap: '10'},
      {hole: 2, par: '5', distance: '511', handicap: '8'},
      {hole: 3, par: '4', distance: '389', handicap: '12'},
      {hole: 4, par: '4', distance: '422', handicap: '2'},
      {hole: 5, par: '3', distance: '168', handicap: '16'},
      {hole: 6, par: '5', distance: '550', handicap: '6'},
      {hole: 7, par: '3', distance: '155', handicap: '18'},
      {hole: 8, par: '4', distance: '441', handicap: '4'},
      {hole: 9, par: '4', distance: '317', handicap: '14'},
      {hole: 10, par: '5', distance: '567', handicap: '5'},
      {hole: 11, par: '4', distance: '382', handicap: '1'},
      {hole: 12, par: '4', distance: '366', handicap: '13'},
      {hole: 13, par: '5', distance: '502', handicap: '7'},
      {hole: 14, par: '4', distance: '310', handicap: '17'},
      {hole: 15, par: '3', distance: '161', handicap: '15'},
      {hole: 16, par: '4', distance: '405', handicap: '3'},
      {hole: 17, par: '3', distance: '186', handicap: '9'},
      {hole: 18, par: '4', distance: '371', handicap: '11'}
    ]
  },
  {
    url: 'https://play.golfshot.com/profiles/OYgqr/rounds/LVrQQw',
    courseName: 'Donnington Grove Golf Club',
    date: 'Oct 15, 2025',
    location: 'Newbury',
    format: 'Stableford',
    paceOfPlay: '2:04 Pace of Play',
    players: [
      {name: 'lest', scores: ['','','','','','','','','','8','4','6','5','6','5','5','5','5']},
      {name: 'Gary', scores: ['','','','','','','','','','8','7','5','6','5','5','5','3','5']}
    ],
    holes: [
      {hole: 1, par: '4', distance: '373', handicap: '10'},
      {hole: 2, par: '5', distance: '511', handicap: '8'},
      {hole: 3, par: '4', distance: '389', handicap: '12'},
      {hole: 4, par: '4', distance: '422', handicap: '2'},
      {hole: 5, par: '3', distance: '168', handicap: '16'},
      {hole: 6, par: '5', distance: '550', handicap: '6'},
      {hole: 7, par: '3', distance: '155', handicap: '18'},
      {hole: 8, par: '4', distance: '441', handicap: '4'},
      {hole: 9, par: '4', distance: '317', handicap: '14'},
      {hole: 10, par: '5', distance: '567', handicap: '5'},
      {hole: 11, par: '4', distance: '382', handicap: '1'},
      {hole: 12, par: '4', distance: '366', handicap: '13'},
      {hole: 13, par: '5', distance: '502', handicap: '7'},
      {hole: 14, par: '4', distance: '310', handicap: '17'},
      {hole: 15, par: '3', distance: '161', handicap: '15'},
      {hole: 16, par: '4', distance: '405', handicap: '3'},
      {hole: 17, par: '3', distance: '186', handicap: '9'},
      {hole: 18, par: '4', distance: '371', handicap: '11'}
    ]
  },
  {
    url: 'https://play.golfshot.com/profiles/OYgqr/rounds/n91lxY',
    courseName: 'Donnington Grove Golf Club',
    date: 'Oct 17, 2025',
    location: 'Newbury',
    format: 'Stableford',
    paceOfPlay: '4:23 Pace of Play',
    players: [
      {name: 'lest', scores: ['6','8','6','8','5','8','3','6','6','7','4','6','9','4','5','6','5','6']},
      {name: 'Gary', scores: ['4','6','6','6','3','8','3','6','5','7','4','6','8','6','4','5','4','4']}
    ],
    holes: [
      {hole: 1, par: '4', distance: '373', handicap: '10'},
      {hole: 2, par: '5', distance: '511', handicap: '8'},
      {hole: 3, par: '4', distance: '389', handicap: '12'},
      {hole: 4, par: '4', distance: '422', handicap: '2'},
      {hole: 5, par: '3', distance: '168', handicap: '16'},
      {hole: 6, par: '5', distance: '550', handicap: '6'},
      {hole: 7, par: '3', distance: '155', handicap: '18'},
      {hole: 8, par: '4', distance: '441', handicap: '4'},
      {hole: 9, par: '4', distance: '317', handicap: '14'},
      {hole: 10, par: '5', distance: '567', handicap: '5'},
      {hole: 11, par: '4', distance: '382', handicap: '1'},
      {hole: 12, par: '4', distance: '366', handicap: '13'},
      {hole: 13, par: '5', distance: '502', handicap: '7'},
      {hole: 14, par: '4', distance: '310', handicap: '17'},
      {hole: 15, par: '3', distance: '161', handicap: '15'},
      {hole: 16, par: '4', distance: '405', handicap: '3'},
      {hole: 17, par: '3', distance: '186', handicap: '9'},
      {hole: 18, par: '4', distance: '371', handicap: '11'}
    ]
  },
  {
    url: 'https://play.golfshot.com/profiles/OYgqr/rounds/W9D8qn',
    courseName: 'Donnington Grove Golf Club',
    date: 'Oct 24, 2025',
    location: 'Newbury',
    format: 'Stableford',
    paceOfPlay: '4:38 Pace of Play',
    players: [
      {name: 'lest', scores: ['5','6','5','7','4','8','4','5','7','8','7','7','5','6','5','7','4','5']},
      {name: 'Gary', scores: ['6','6','5','6','4','6','4','5','4','7','6','6','8','5','4','7','4','5']}
    ],
    holes: [
      {hole: 1, par: '4', distance: '373', handicap: '10'},
      {hole: 2, par: '5', distance: '511', handicap: '8'},
      {hole: 3, par: '4', distance: '389', handicap: '12'},
      {hole: 4, par: '4', distance: '422', handicap: '2'},
      {hole: 5, par: '3', distance: '168', handicap: '16'},
      {hole: 6, par: '5', distance: '550', handicap: '6'},
      {hole: 7, par: '3', distance: '155', handicap: '18'},
      {hole: 8, par: '4', distance: '441', handicap: '4'},
      {hole: 9, par: '4', distance: '317', handicap: '14'},
      {hole: 10, par: '5', distance: '567', handicap: '5'},
      {hole: 11, par: '4', distance: '382', handicap: '1'},
      {hole: 12, par: '4', distance: '366', handicap: '13'},
      {hole: 13, par: '5', distance: '502', handicap: '7'},
      {hole: 14, par: '4', distance: '310', handicap: '17'},
      {hole: 15, par: '3', distance: '161', handicap: '15'},
      {hole: 16, par: '4', distance: '405', handicap: '3'},
      {hole: 17, par: '3', distance: '186', handicap: '9'},
      {hole: 18, par: '4', distance: '371', handicap: '11'}
    ]
  }
];

// Check for duplicates and only add new rounds
const existingUrls = new Set(existingData.map(r => r.url));
const roundsToAdd = newRounds.filter(r => !existingUrls.has(r.url));

console.log('Existing rounds:', existingData.length);
console.log('New rounds found:', roundsToAdd.length);
console.log('Skipped (duplicates):', newRounds.length - roundsToAdd.length);

// Append new rounds
const updatedData = [...existingData, ...roundsToAdd];

// Save
fs.writeFileSync('golf-data/rounds-data.json', JSON.stringify(updatedData, null, 2));

console.log('✅ Updated rounds-data.json with', updatedData.length, 'total rounds');
