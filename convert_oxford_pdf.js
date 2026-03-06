const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function extractTextWithCli(pdfPath) {
  return new Promise((resolve, reject) => {
    const command = `npx pdf-parse text "${pdfPath}" --format text`;

    exec(
      command,
      { maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(
            new Error(
              `pdf-parse CLI error: ${stderr || error.message}`,
            ),
          );
          return;
        }
        resolve(stdout);
      },
    );
  });
}

async function extractOxfordWords() {
  const pdfPath = path.join(__dirname, 'The_Oxford_3000.pdf');
  const outputPath = path.join(__dirname, 'oxford_list.json');

  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF introuvable à l'emplacement attendu: ${pdfPath}`);
    process.exit(1);
  }

  const text = await extractTextWithCli(pdfPath);

  const lines = text.split(/\r?\n/);
  const wordsSet = new Set();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Ignorer les métadonnées / titres évidents
    if (line.startsWith('©')) continue;
    if (line.startsWith('The Oxford 3000')) continue;
    if (/^\d+\s*\/\s*\d+/.test(line)) continue; // ex: "1 / 11"
    if (/^-- \d+ of \d+ --/.test(line)) continue;

    const firstToken = line.split(/\s+/)[0];
    if (!firstToken) continue;

    // Nettoyer ponctuation en début/fin et normaliser
    let word = firstToken.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g, '').toLowerCase();
    if (!word) continue;

    // Garder uniquement les formes simples a-z
    if (!/^[a-z]+$/.test(word)) continue;

    wordsSet.add(word);
  }

  const words = Array.from(wordsSet).sort();
  fs.writeFileSync(outputPath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`Oxford 3000: ${words.length} mots extraits → ${outputPath}`);
}

extractOxfordWords().catch((err) => {
  console.error('Erreur lors de la conversion du PDF Oxford 3000:', err);
  process.exit(1);
});


