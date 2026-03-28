"""
generate_migration.py
─────────────────────
Lit data_english_vocabulary_primaire.xlsx et génère une migration TypeScript
prête à être intégrée dans le système de migrations JoudPrimary.

Usage:
    python generate_migration.py <chemin_vers_xlsx> [numero_migration]

Exemple:
    python generate_migration.py data_english_vocabulary_primaire.xlsx 031
"""

import pandas as pd
import json
import sys
import os
from datetime import datetime

# ─── ARGUMENTS ───────────────────────────────────────────────────────────────
xlsx_path = sys.argv[1] if len(sys.argv) > 1 else 'data_english_vocabulary_primaire.xlsx'
migration_number = sys.argv[2] if len(sys.argv) > 2 else '031'

if not os.path.exists(xlsx_path):
    print(f"❌ Fichier introuvable : {xlsx_path}")
    sys.exit(1)

# ─── LECTURE DU FICHIER ──────────────────────────────────────────────────────
df = pd.read_excel(xlsx_path, sheet_name='Vocabulary Data')
print(f"✅ {len(df)} mots chargés depuis {xlsx_path}")

# ─── FAMILLES UNIQUES → SLUGS ────────────────────────────────────────────────
# On génère un slug depuis le family_name
def make_slug(name: str) -> str:
    return (name.lower()
        .replace("'", "")
        .replace(" & ", "_")
        .replace(" ", "_")
        .replace("é", "e")
        .replace("è", "e")
        .replace("ê", "e")
        .replace("à", "a")
        .replace("ô", "o")
        .replace("î", "i")
        .replace("û", "u")
        .replace("ç", "c")
        .replace("ï", "i")
    )

families = df[['family_id', 'family_name']].drop_duplicates().sort_values('family_id')
family_slugs = {
    row['family_id']: make_slug(row['family_name'])
    for _, row in families.iterrows()
}

# ─── GÉNÉRATION DES INSERTS ──────────────────────────────────────────────────
inserts = []
for _, row in df.iterrows():
    data = {
        "word": str(row['word']),
        "translation": str(row['translation']),
        "example": str(row['example']),
        "exampleTranslation": str(row['exampleTranslation']) if pd.notna(row['exampleTranslation']) else "",
        "audio": ""
    }
    # Note optionnelle
    if pd.notna(row['note']) and str(row['note']).strip():
        data["note"] = str(row['note']).strip()

    data_json = json.dumps(data, ensure_ascii=False)
    slug = family_slugs[row['family_id']]
    subfamily_id = int(row['subfamily_id'])
    level = int(row['level'])
    order_index = int(row['order_index'])

    inserts.append({
        'slug': slug,
        'subfamily_id': subfamily_id,
        'level': level,
        'order_index': order_index,
        'data_json': data_json,
    })

# ─── GROUPER PAR FAMILLE POUR LES LOOKUPS ───────────────────────────────────
slugs_unique = sorted(set(i['slug'] for i in inserts))

# ─── TEMPLATE TYPESCRIPT ─────────────────────────────────────────────────────
ts_lines = []
ts_lines.append(f"""/**
 * ============================================
 * MIGRATION {migration_number}: Seed Primary Vocabulary
 * 828 mots — 14 familles — 4 niveaux
 * Généré automatiquement le {datetime.now().strftime('%Y-%m-%d %H:%M')}
 * ============================================
 */

import type * as SQLite from 'expo-sqlite';
import {{ createMigration }} from './runner';

export default createMigration(
  {int(migration_number)},
  'seed_primary_vocabulary',
  async (db: SQLite.SQLiteDatabase) => {{

    // ── 1. RÉCUPÉRATION DES FAMILY IDs ──────────────────────────────────────
    const familyIds: Record<string, number> = {{}};
    const slugs = {json.dumps(slugs_unique, ensure_ascii=False)};

    for (const slug of slugs) {{
      const row = await db.getFirstAsync<{{id: number}}>('SELECT id FROM families WHERE slug = ?', [slug]);
      if (!row) {{
        console.error(`[Migration {migration_number}] Famille introuvable : ${{slug}}`);
        return;
      }}
      familyIds[slug] = row.id;
    }}

    // ── 2. NETTOYAGE ─────────────────────────────────────────────────────────
    for (const slug of slugs) {{
      await db.runAsync(
        'DELETE FROM content WHERE family_id = ? AND tags = ? AND target_audience = ?',
        [familyIds[slug], 'primary_vocab', 'primary']
      );
    }}

    // ── 3. SEED DES 828 MOTS ─────────────────────────────────────────────────
    const words: [string, number, number, number, string][] = [
      // [slug, subfamily_id, level, order_index, data_json]
""")

for i in inserts:
    escaped = i['data_json'].replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')
    ts_lines.append(f"      ['{i['slug']}', {i['subfamily_id']}, {i['level']}, {i['order_index']}, `{escaped}`],")

ts_lines.append(f"""    ];

    for (const [slug, subfamilyId, level, orderIndex, data] of words) {{
      await db.runAsync(
        `INSERT INTO content (family_id, level, content_type, data, difficulty, tags, target_audience, subfamily_id, order_index)
         VALUES (?, ?, 'word', ?, 'easy', 'primary_vocab', 'primary', ?, ?)`,
        [familyIds[slug], level, data, subfamilyId, orderIndex]
      );
    }}

    console.log('[Migration {migration_number}] ✅ 828 mots Primary insérés');
  }},

  // Rollback
  async (db: SQLite.SQLiteDatabase) => {{
    const slugs = {json.dumps(slugs_unique, ensure_ascii=False)};
    for (const slug of slugs) {{
      const row = await db.getFirstAsync<{{id: number}}>('SELECT id FROM families WHERE slug = ?', [slug]);
      if (row) {{
        await db.runAsync(
          'DELETE FROM content WHERE family_id = ? AND tags = ?',
          [row.id, 'primary_vocab']
        );
      }}
    }}
    console.log('[Migration {migration_number}] ✅ Rollback effectué');
  }}
);
""")

# ─── ÉCRITURE DU FICHIER ─────────────────────────────────────────────────────
output_filename = f"{migration_number}_seed_primary_vocabulary.ts"
output_path = os.path.join(os.getcwd(), output_filename)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(ts_lines))

print(f"✅ Migration générée : {output_path}")
print(f"   {len(inserts)} inserts")
print(f"   {len(slugs_unique)} familles : {', '.join(slugs_unique)}")
