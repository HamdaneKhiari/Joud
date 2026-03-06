const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function convertExcelToMyWords() {
  const excelPath = path.join(__dirname, 'data_english.xlsx');
  const outputPath = path.join(__dirname, 'my_words.json');

  if (!fs.existsSync(excelPath)) {
    console.error(`Fichier Excel introuvable à l'emplacement attendu: ${excelPath}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Lecture brute en lignes (tableau de tableaux)
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    blankrows: false,
  });

  const items = [];

  rows.forEach((row, index) => {
    if (!row || row.length === 0) return;

    // Ligne d'en-tête principale (module_slug, family_id, ...) → ignorer
    if (index === 0) return;

    const rawFirst = row[0];
    if (rawFirst == null) return;

    const firstCell = String(rawFirst).trim();
    if (!firstCell) return;

    const lower = firstCell.toLowerCase();

    // Ignorer les lignes d'en-tête ou de métadonnées
    if (
      lower === 'id' ||
      lower === 'module_slug' ||
      lower === 'family_id' ||
      lower === 'subfamily_id' ||
      lower === 'level' ||
      lower === 'category_slug'
    ) {
      return;
    }

    // Si première cellule est purement numérique → probablement un ID, on utilise les colonnes suivantes
    const isNumericId = !Number.isNaN(Number(firstCell));

    // Dans la structure actuelle, le mot anglais semble être en colonne 3 (index 3)
    const rawEnglish = row[3];
    if (rawEnglish == null) return;

    const english = String(rawEnglish).trim();
    if (!english) return;

    // Ignore une éventuelle ligne d'en-tête "word_en"
    if (english.toLowerCase() === 'word_en') return;

    const french = row[4] != null ? String(row[4]).trim() : '';
    const exampleEn = row[5] != null ? String(row[5]).trim() : '';
    const exampleFr = row[6] != null ? String(row[6]).trim() : '';
    const audioRaw = row[7] != null ? String(row[7]).trim() : '';

    // Respect strict de DATA_GUIDE.md pour le module vocabulaire
    // Ignorer une éventuelle ligne d'en-tête
    items.push({
      word: english,
      translation: french,
      example: exampleEn,
      exampleTranslation: exampleFr,
      audio: audioRaw || '',
    });
  });

  fs.writeFileSync(outputPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Vocabulaire Excel: ${items.length} entrées normalisées → ${outputPath}`);
}

convertExcelToMyWords();

