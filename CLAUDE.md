# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js tool for extracting golf round data from the Golfshot website and storing it in JSON format. The extraction leverages Chrome DevTools Protocol for browser automation. Data is incrementally appended to preserve existing rounds.

## Primary Commands

### Data Extraction
```bash
# Extract rounds with date filtering using the Claude command (PRIMARY METHOD)
/extract-golf-rounds "Jan 01, 2024" "Dec 31, 2024"  # Specific date range
/extract-golf-rounds "Jun 01, 2024"                  # From date to present
/extract-golf-rounds                                 # All rounds

# This command:
# - Opens browser and requires manual authentication
# - Extracts rounds using Chrome DevTools MCP
# - Appends new rounds to golf-data/rounds-data.json
# - Skips rounds that already exist (checks by URL)
# - Does NOT generate CSV files (JSON is the primary format)
```

### Score Analysis
```bash
# Analyze scores and generate visualization
node analyze-scores.js                               # Calculate normalized scores and generate graph data

# This script:
# - Reads golf-data/rounds-data.json
# - Counts actual holes played for each round (9, 13, 14, or 18)
# - Normalizes all scores to 18-hole equivalent (score × 18 ÷ holes_played)
# - Generates golf-data/score-graph-data.json for visualization
# - Displays score comparison table and statistics
```

### Development
```bash
npm install                                          # Install dependencies
```

## Architecture

### Extraction Pipeline

The data extraction uses Chrome DevTools Protocol for browser automation:

**Extraction Process**
- Uses Chrome DevTools MCP to automate browser interactions
- Navigates to Golfshot rounds listing page (https://play.golfshot.com/profiles/OYgqr/rounds)
- Collects round URLs within the specified date range
- Visits each individual round detail page
- Extracts structured data from HTML tables using DOM queries
- **Appends new rounds** to existing `golf-data/rounds-data.json` file
- **Skips duplicate rounds** by checking if URL already exists
- Preserves all existing data - no overwrites

### Key Scripts

**Data Extraction:**
- **`.claude/commands/extract-golf-rounds.md`** - Claude command definition that orchestrates browser automation via Chrome DevTools MCP server. This is the primary method for extracting rounds.

- **`browser-extract.js`** - Standalone browser console script that can be pasted directly into DevTools. Alternative extraction method if Chrome DevTools MCP is not available.

- **`extract-specific-rounds.js`** - Browser console script for extracting a specific list of round URLs.

- **`append-october-rounds.js`** - Helper script used to append October 2025 rounds to the dataset.

**Score Analysis & Visualization:**
- **`analyze-scores.js`** - Main analysis script that calculates normalized scores (accounting for 9, 13, 14, or 18 hole rounds) and generates score-graph-data.json for visualization.

- **`golf-scores-graph.html`** - Interactive Chart.js visualization comparing Lest vs Gary scores over time with normalization details.

- **`index.html`** - GitHub Pages version of the visualization (deployed at https://lesterthomas.github.io/golfshot/).

**Legacy Scripts:**
- **`extract-by-date-range.js`** - Legacy processing module for CSV generation. No longer used by default since JSON is the preferred format.

- **`simple-extract.js`** - Legacy CSV generator. Can be used if CSV output is needed.

### Data Flow

```
Golfshot Website
    ↓
Chrome DevTools MCP (browser automation)
    ↓
Extract round URLs from listing page
    ↓
Visit each round detail page
    ↓
Extract structured data via JavaScript
    ↓
Append to golf-data/rounds-data.json
(skip if round URL already exists)
```

### Data Structures

**Round Data (JSON)** - Primary format stored in `golf-data/rounds-data.json`
```javascript
{
  url: "https://play.golfshot.com/profiles/OYgqr/rounds/YNwxjK",  // Used for duplicate detection
  courseName: "Donnington Grove Golf Club",
  date: "Jan 04, 2025",
  location: "Newbury",
  format: "Stableford",
  paceOfPlay: "2:27 Pace of Play",
  players: [
    {
      name: "lest",
      scores: ["6", "8", "7", "6", "4", "9", "4", "7", "7", "", "", "", "", "", "", "", "", ""]  // 18 holes
    },
    {
      name: "Gary",
      scores: ["7", "7", "7", "6", "6", "7", "4", "8", "5", "", "", "", "", "", "", "", "", ""]
    }
  ],
  holes: [
    {
      hole: 1,
      par: "4",
      distance: "373",
      handicap: "10"
    },
    // ... 18 holes total
  ]
}
```

**Important**: The `rounds-data.json` file contains an array of round objects. New rounds are appended to this array, and the URL field is used to prevent duplicates.

### Web Scraping Strategy

The extraction scripts parse Golfshot's round detail pages by:
1. Identifying course name from `<a href*="courses">` link text
2. Extracting date/location using regex patterns: `/(\w{3}\s+\d{1,2},\s+\d{4}),\s+([A-Za-z\s]+)/`
3. Parsing HTML tables to extract hole data (Distance, Handicap, Par rows)
4. Identifying player score rows by filtering for short alphabetic strings that aren't table headers
5. Handling the table structure: columns 0-8 are front 9, column 9 is "Out" total (skipped), columns 10-18 are back 9

### Date Handling

Date format is **"MMM DD, YYYY"** (e.g., "Oct 24, 2025"). The `parseGolfDate()` function in `extract-by-date-range.js` converts these strings to Date objects for comparison. Date filtering is inclusive of start and end dates.

## Output Directory

All data is stored in `golf-data/`:
- `rounds-data.json` - **Primary data file** containing all extracted rounds (incrementally appended)
- `score-graph-data.json` - Processed scoring data with normalization for visualization
- `golf-scores-chart.png` - Screenshot of the interactive visualization

## Chrome DevTools Integration

The `/extract-golf-rounds` command uses the Chrome DevTools MCP server to:
- Open Golfshot rounds page in the browser
- Execute JavaScript to collect round URLs within the specified date range
- Navigate to each round detail page sequentially
- Extract structured data using DOM queries and JavaScript evaluation
- Check if round URL already exists in `rounds-data.json`
- Append only new rounds to the JSON file
- Preserve all existing data (no overwrites)

**Authentication**: The automation requires an active logged-in session to Golfshot. You will be prompted to authenticate manually when the browser opens.

## Score Normalization

Since rounds can have different hole counts (9, 13, 14, or 18 holes), the analysis script normalizes all scores to an 18-hole equivalent for fair comparison:

**Normalization Formula:** `Normalized Score = Raw Score × (18 ÷ Holes Played)`

**Examples:**
- 9-hole round: score of 50 → 50 × 18/9 = 100
- 14-hole round: score of 73 → 73 × 18/14 = 94
- 13-hole round: score of 77 → 77 × 18/13 = 107
- 18-hole round: score of 105 → no change (105)

The visualization uses different point shapes to indicate hole counts:
- ● Circle = 18 holes
- ■ Square = 14 holes
- ▲ Triangle = 9 holes
- ◆ Diamond = 13 holes

## Visualization

The interactive golf scores chart is available at:
- **Live demo:** https://lesterthomas.github.io/golfshot/
- **Local file:** `golf-scores-graph.html`
- **Screenshot:** `golf-scores-chart.png`

Features:
- Line chart comparing Lest vs Gary scores over time
- All scores normalized to 18-hole equivalent
- Interactive tooltips showing raw scores and normalization calculations
- Statistics summary: wins, losses, and ties
- Visual indicators for different hole counts
