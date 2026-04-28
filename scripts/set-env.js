const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dir = './src/environments';
const fileName = 'environment.ts';
const prodFileName = 'environment.prod.ts';
const filePath = path.join(dir, fileName);
const prodFilePath = path.join(dir, prodFileName);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const adminPassword = process.env['ADMIN_PASSWORD'] ;
const adminPasswordHash = bcrypt.hashSync(adminPassword, 10);

const environmentFileContent = `export const environment = {
  production: false,
  githubToken: '${process.env['GITHUB_TOKEN'] || ''}',
  adminPasswordHash: '${adminPasswordHash}',
  apiUrl: '${process.env['API_URL'] || 'http://localhost:8080/api'}'
};
`;

const prodEnvironmentFileContent = `export const environment = {
  production: true,
  githubToken: '${process.env['GITHUB_TOKEN'] || ''}',
  adminPasswordHash: '${adminPasswordHash}',
  apiUrl: '${process.env['API_URL'] || 'https://gpcueb.org/HorusBack'}'
};
`;

fs.writeFile(filePath, environmentFileContent, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Generated ${filePath}`);
  }
});

fs.writeFile(prodFilePath, prodEnvironmentFileContent, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Generated ${prodFilePath}`);
  }
});
