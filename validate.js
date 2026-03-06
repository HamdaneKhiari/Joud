const fs = require('fs');
const path = require('path');

function loadJsonArray(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`Fichier ${description} introuvable: ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Le JSON doit être un tableau.');
    }
    return parsed;
  } catch (err) {
    console.error(`Erreur de parsing JSON pour ${description}:`, err.message);
    process.exit(1);
  }
}

function main() {
  const myWordsPath = path.join(__dirname, 'my_words.json');
  const oxfordListPath = path.join(__dirname, 'oxford_list.json');
  const outputPath = path.join(__dirname, 'analysis_report.json');

  const myWords = loadJsonArray(myWordsPath, 'my_words.json');
  const oxfordList = loadJsonArray(oxfordListPath, 'oxford_list.json');

  const oxfordSet = new Set(
    oxfordList
      .map((w) => (w == null ? '' : String(w).trim().toLowerCase()))
      .filter((w) => w.length > 0),
  );

  const validWords = [];
  const outliers = [];

  for (const entry of myWords) {
    if (!entry || typeof entry.word !== 'string') continue;

    const normalized = entry.word.trim().toLowerCase();
    if (!normalized) continue;

    if (oxfordSet.has(normalized)) {
      if (!validWords.includes(normalized)) {
        validWords.push(normalized);
      }
    } else {
      if (!outliers.includes(normalized)) {
        outliers.push(normalized);
      }
    }
  }

  const report = {
    valid_words: validWords,
    outliers,
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Analyse terminée → ${outputPath}`);
  console.log(`Valid words: ${validWords.length}, Outliers: ${outliers.length}`);
}

main();

