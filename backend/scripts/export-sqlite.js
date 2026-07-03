const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbPath = './olympiades.sqlite';
const outputPath = './data-export.json';

const db = new sqlite3.Database(dbPath);

const tables = ['teams', 'games', 'matches', 'match_teams', 'team_match_history'];

const exportData = {};

let completed = 0;

tables.forEach((table) => {
  db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
    if (err) {
      console.error(`Error exporting ${table}:`, err);
    } else {
      exportData[table] = rows;
      console.log(`✓ Exported ${rows.length} rows from ${table}`);
    }
    
    completed++;
    
    if (completed === tables.length) {
      fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2));
      console.log(`\n✓ Data exported to ${outputPath}`);
      db.close();
    }
  });
});
