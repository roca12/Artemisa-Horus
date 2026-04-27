const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dir = './src/environments';
const fileName = 'environment.ts';
const filePath = path.join(dir, fileName);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const environmentFileContent = `export const environment = {
  production: ${process.env['NODE_ENV'] === 'production' || false},
  githubToken: '${process.env['GITHUB_TOKEN'] || ''}'
};
`;

fs.writeFile(filePath, environmentFileContent, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log(`Generated ${filePath}`);
  }
});
