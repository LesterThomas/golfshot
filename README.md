# Golf Round Data Extractor

Extract golf round data from the Golfshot website and generate CSV files organized by player and course.

## Quick Start

Use the Claude command to extract rounds within a date range:

```bash
# Extract all rounds in 2024
/extract-golf-rounds "Jan 01, 2024" "Dec 31, 2024"

# Extract rounds from June 2024 onwards
/extract-golf-rounds "Jun 01, 2024"

# Extract all rounds (no date filter)
/extract-golf-rounds
```

## Output

CSV files are generated in the `golf-data/` directory, organized by player and course:

- `lest-donnington-grove-golf-club.csv`
- `gary-donnington-grove-golf-club.csv`
- `lest-wokefield-park-golf-club.csv`
- etc.

### CSV Format

Each CSV contains:
- **Metadata**: date, location, format, pace of play
- **Per Hole** (1-18): par, distance, handicap, score
- **Total Score**: Overall score for the round

Example structure:
```csv
date,location,format,paceOfPlay,hole1_par,hole1_distance,hole1_handicap,hole1_score,...,total_score
"Oct 24, 2025",Newbury,Stableford,4:38 Pace of Play,4,373,10,5,...,105
```

## Files

### Scripts

- **`extract-by-date-range.js`** - Main processing script with date filtering
- **`simple-extract.js`** - Process all rounds without filtering
- **`extract-rounds.js`** - Puppeteer-based automation (requires auth setup)
- **`browser-extract.js`** - Browser console script for manual extraction

### Command

- **`.claude/extract-golf-rounds.md`** - Claude command definition

### Data

- **`golf-data/rounds-data.json`** - Extracted round data (JSON format)
- **`golf-data/*.csv`** - Generated CSV files per player/course

## How It Works

1. The Claude command opens the Golfshot rounds page
2. Collects round URLs from the rounds list
3. Visits each round detail page
4. Extracts hole-by-hole data including:
   - Course information
   - Date and location
   - Par, distance, and handicap for each hole
   - Player scores for each hole
5. Filters rounds by the specified date range
6. Generates CSV files organized by player and course

## Manual Extraction (Alternative)

If you need to manually extract rounds:

1. Navigate to a round page on Golfshot
2. Open browser console (F12)
3. Run the extraction function from `extract-rounds-devtools.js`
4. Copy the JSON output to `golf-data/rounds-data.json`
5. Run `node simple-extract.js` to generate CSVs

## Date Format

Dates should be in the format: **"MMM DD, YYYY"**

Examples:
- `"Jan 01, 2024"`
- `"Jun 15, 2025"`
- `"Oct 24, 2025"`

## Dependencies

Install dependencies with:
```bash
npm install
```

Dependencies:
- Node.js
- puppeteer (for automation)

## Examples

### Extract specific year
```bash
/extract-golf-rounds "Jan 01, 2024" "Dec 31, 2024"
```

### Extract last 6 months
```bash
/extract-golf-rounds "Apr 01, 2025" "Oct 25, 2025"
```

### Extract everything
```bash
/extract-golf-rounds
```

## Analyzing the Data

Once CSV files are generated, you can:
- Open in Excel/Google Sheets
- Import into data analysis tools
- Calculate statistics (average scores, handicap analysis, etc.)
- Compare performance across different courses
- Track improvement over time

## Troubleshooting

**No CSV files generated?**
- Check that `golf-data/rounds-data.json` exists and contains valid data
- Verify the date range includes rounds in your data

**Missing rounds?**
- Date filtering is case-sensitive and format-specific
- Use the exact format: "MMM DD, YYYY"

**Authentication issues?**
- The browser-based extraction requires an active logged-in session
- Make sure you're logged into Golfshot before running the command

## License

This is a personal data extraction tool for analyzing your own golf data.
