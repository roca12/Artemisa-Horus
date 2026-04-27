const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dir = './src/environments';
const fileName = 'environment.ts';
const filePath = path.join(dir, fileName);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const adminPassword = process.env['ADMIN_PASSWORD'] || 'admin';
const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);

const environmentFileContent = `export const environment = {
  production: ${process.env['NODE_ENV'] === 'production' || false},
  githubToken: '${process.env['GITHUB_TOKEN'] || ''}',
  adminPasswordHash: '${adminPasswordHash}'
};
`;

fs.writeFile(filePath, environmentFileContent, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Generated ${filePath}`);
  }
});
