const fs = require('fs');
const path = require('path');

function loadJsonArray(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`Fichier ${description} introuvable: ${filePath}`);
    process.exit(1);
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(parsed)) throw new Error('Le JSON doit être un tableau.');
    return parsed;
  } catch (err) {
    console.error(`Erreur JSON pour ${description}:`, err.message);
    process.exit(1);
  }
}

function main() {
  const myWordsPath = path.join(__dirname, 'my_words.json');
  const oxfordListPath = path.join(__dirname, 'oxford_list.json');
  const outputPath = path.join(__dirname, 'analysis_report.json');

  const myWords = loadJsonArray(myWordsPath, 'my_words.json');
  const oxfordList = loadJsonArray(oxfordListPath, 'oxford_list.json');

  // Oxford en Set pour O(1)
  const oxfordSet = new Set(
    oxfordList.map(item => {
      const w = typeof item === 'string' ? item : item.word;
      return w ? w.trim().toLowerCase() : '';
    }).filter(w => w.length > 0)
  );

  const validWords = [];
  const outliers = [];
  const duplicates = [];
  const seen = new Map(); // mot → premier niveau trouvé

  for (const entry of myWords) {
    if (!entry || typeof entry.word !== 'string') continue;
    const normalized = entry.word.trim().toLowerCase();
    if (!normalized) continue;
    const myLevel = entry.level || 'non_defini';

    // Doublon inter-niveaux
    if (seen.has(normalized)) {
      duplicates.push({
        word: normalized,
        first_level: seen.get(normalized),
        duplicate_in: myLevel
      });
      continue;
    }
    seen.set(normalized, myLevel);

    // Oxford ou pas
    if (oxfordSet.has(normalized)) {
      validWords.push({ word: normalized, level: myLevel });
    } else {
      outliers.push({ word: normalized, level: myLevel });
    }
  }

  const report = {
    stats: {
      total_unique: seen.size,
      valid_count: validWords.length,
      outliers_count: outliers.length,
      duplicates_count: duplicates.length
    },
    duplicates,
    valid_words: validWords,
    outliers
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n🚀 Analyse terminée → ${outputPath}`);
  console.log(`📝 Total mots uniques  : ${seen.size}`);
  console.log(`✅ Validés Oxford      : ${validWords.length}`);
  console.log(`⚠️  Outliers            : ${outliers.length}`);
  console.log(`🚨 Doublons            : ${duplicates.length}`);
}

main();