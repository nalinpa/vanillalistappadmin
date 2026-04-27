import fs from 'fs';
import path from 'path';

// 🎯 1. CONFIGURE YOUR NEW ENTITY HERE
// Change these values to match your specific project (e.g., Event, Recipe, User)
const TARGET_ENTITY_PASCAL = 'Event';         // e.g., Event
const TARGET_ENTITY_CAMEL = 'event';          // e.g., event
const TARGET_ENTITY_PASCAL_PLURAL = 'Events'; // e.g., Events
const TARGET_ENTITY_CAMEL_PLURAL = 'events';  // e.g., events
const APP_NAME = 'Events App';            // e.g., EventsApp

// 2. The mapping of placeholders found in your codebase to your new entity
const REPLACEMENTS = {
  '__Location__': TARGET_ENTITY_PASCAL,
  '__location__': TARGET_ENTITY_CAMEL,
  '__Locations__': TARGET_ENTITY_PASCAL_PLURAL,
  '__locations__': TARGET_ENTITY_CAMEL_PLURAL,
  '__ENTITY_PLURAL__': TARGET_ENTITY_PASCAL_PLURAL,
  '__ENTITY_SINGULAR__': TARGET_ENTITY_PASCAL,
  '__APP_NAME__ ': APP_NAME,
  '__APP_INITIAL__': APP_NAME.charAt(0).toUpperCase(),
  '__DB_COLLECTION__': TARGET_ENTITY_CAMEL_PLURAL
};

// Directories to ignore so we don't break node_modules or git
const IGNORE_DIRS = ['node_modules', 'dist', '.git', '.vscode'];
const IGNORE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

const rootDir = process.cwd();
const currentScript = path.basename(import.meta.url);

function processDirectory(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (IGNORE_DIRS.includes(item)) continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
      renameItem(fullPath, dir, item);
    } else {
      replaceInFile(fullPath);
      renameItem(fullPath, dir, item);
    }
  }
}

function replaceInFile(filePath) {
  const ext = path.extname(filePath);
  if (IGNORE_EXTENSIONS.includes(ext) || path.basename(filePath) === currentScript) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [placeholder, replacement] of Object.entries(REPLACEMENTS)) {
    if (content.includes(placeholder)) {
      // Replace all occurrences in the file
      const regex = new RegExp(placeholder, 'g');
      content = content.replace(regex, replacement);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated content in: ${path.relative(rootDir, filePath)}`);
  }
}

function renameItem(fullPath, dir, name) {
  let newName = name;
  
  for (const [placeholder, replacement] of Object.entries(REPLACEMENTS)) {
    if (newName.includes(placeholder)) {
      newName = newName.replace(new RegExp(placeholder, 'g'), replacement);
    }
  }

  if (newName !== name) {
    const newPath = path.join(dir, newName);
    fs.renameSync(fullPath, newPath);
    console.log(`🏷️ Renamed: ${name} -> ${newName}`);
  }
}

console.log('🚀 Starting scaffolding replacement...');
// Target the src directory and router.tsx/pages directly to avoid hitting config files unnecessarily,
// or just target the whole root if you want it to hit README.md too.
processDirectory(rootDir);
console.log('✨ Scaffolding complete!');