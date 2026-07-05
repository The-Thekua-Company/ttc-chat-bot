const fs = require('fs');
const path = require('path');

const KNOWLEDGE_BASE_DIR = path.join(__dirname, '..', '..', 'knowledge-base');

let cachedText = null;

function getKnowledgeBaseText() {
  if (cachedText !== null) {
    return cachedText;
  }

  const files = fs
    .readdirSync(KNOWLEDGE_BASE_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();

  cachedText = files
    .map((file) => {
      const content = fs.readFileSync(path.join(KNOWLEDGE_BASE_DIR, file), 'utf-8');
      return `## ${file}\n\n${content}`;
    })
    .join('\n\n---\n\n');

  return cachedText;
}

module.exports = { getKnowledgeBaseText };
