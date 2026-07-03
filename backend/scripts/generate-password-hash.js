const bcrypt = require('bcryptjs');

// Script pour générer le hash d'un mot de passe
// Usage: node scripts/generate-password-hash.js "votre_mot_de_passe"

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/generate-password-hash.js "votre_mot_de_passe"');
  process.exit(1);
}

bcrypt.hash(password, 10).then(hash => {
  console.log('\n✅ Hash généré avec succès!\n');
  console.log('Mot de passe:', password);
  console.log('Hash:', hash);
  console.log('\nAjoutez ce hash dans votre variable d\'environnement:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\n');
});
