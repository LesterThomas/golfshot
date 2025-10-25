# Extract Golf Rounds

Extract golf round data from Golfshot website within a specified date range and append to `golf-data/rounds-data.json`.

## Arguments

- `start_date` (optional): Start date in format "MMM DD, YYYY" (e.g., "Jan 01, 2024"). Defaults to beginning of time.
- `end_date` (optional): End date in format "MMM DD, YYYY" (e.g., "Dec 31, 2024"). Defaults to today.

## Usage Examples

```bash
/extract-golf-rounds
/extract-golf-rounds "Jan 01, 2024" "Dec 31, 2024"
/extract-golf-rounds "Jun 01, 2024"
```

## What it does

1. Opens the Golfshot rounds page in the browser (requires manual authentication)
2. Collects all round URLs within the specified date range
3. Visits each round and extracts detailed hole-by-hole data using Chrome DevTools
4. **Appends new rounds** to `golf-data/rounds-data.json` (does not overwrite)
5. **Skips rounds** that are already present in the JSON file (checks by URL)

## Output Format

Data is stored in JSON format at `golf-data/rounds-data.json`. Each round contains:
- URL, course name, date, location, format, pace of play
- Array of players with their 18-hole scores
- Array of hole details (par, distance, handicap)

## Important Notes

- The command uses Chrome DevTools MCP server for browser automation
- You must manually authenticate to Golfshot when prompted
- Existing rounds are preserved - only new rounds are added
- No CSV files are generated (JSON is the primary format)
