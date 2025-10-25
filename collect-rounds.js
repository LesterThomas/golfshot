// Browser console script to collect all round URLs
// Paste this into the browser console on the rounds page

async function collectAllRounds() {
  const allRounds = [];
  let currentPage = 1;
  const baseUrl = 'https://play.golfshot.com/profiles/OYgqr/rounds';

  console.log('Starting to collect all rounds...');

  // Function to extract rounds from current page
  function extractRoundsFromPage() {
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
          score: cells[2]?.textContent.trim(),
          fairwayPct: cells[3]?.textContent.trim(),
          girPct: cells[4]?.textContent.trim(),
          puttsPerHole: cells[5]?.textContent.trim()
        });
      }
    });

    return rounds;
  }

  // Collect from all pages
  while (true) {
    console.log(`Collecting from page ${currentPage}...`);

    // Navigate to page
    const pageUrl = `${baseUrl}?sb=Date&sd=Descending&p=${currentPage}`;
    window.location.href = pageUrl;

    // Wait for page load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract rounds
    const pageRounds = extractRoundsFromPage();

    if (pageRounds.length === 0) {
      console.log(`No more rounds found on page ${currentPage}`);
      break;
    }

    allRounds.push(...pageRounds);
    console.log(`Found ${pageRounds.length} rounds on page ${currentPage}. Total: ${allRounds.length}`);

    // Check if there's a next page
    const nextPageLink = document.querySelector(`a[href*="p=${currentPage + 1}"]`);
    if (!nextPageLink) {
      console.log('No next page link found');
      break;
    }

    currentPage++;

    // Safety limit
    if (currentPage > 20) {
      console.log('Reached page limit of 20');
      break;
    }
  }

  console.log(`\nCollection complete! Total rounds: ${allRounds.length}`);

  // Save to JSON
  const dataStr = JSON.stringify(allRounds, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'all-rounds-urls.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log('Saved to all-rounds-urls.json');

  return allRounds;
}

// Run the collection
collectAllRounds();
