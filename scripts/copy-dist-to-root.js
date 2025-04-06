// Script to copy dist folder contents to root for Bolt deployment
import { promises as fs } from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const TEMP_DIR = path.join(ROOT_DIR, 'temp-deploy');
const IGNORE_PATTERNS = [
  /node_modules/,
  /\.git/,
  /\.github/,
  /\.vscode/,
  /src\//,
  /public\//,
  /scripts\//,
  /supabase\//,
  /\.env/
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyDistToRoot() {
  console.log('📦 Preparing files for Bolt deployment...');

  try {
    // Check if dist directory exists
    const distExists = await fileExists(DIST_DIR);
    if (!distExists) {
      console.error('❌ Error: dist directory not found! Run npm run build first.');
      process.exit(1);
    }

    // Create a list of files in dist
    const distFiles = await fs.readdir(DIST_DIR, { recursive: true });
    console.log(`📋 Found ${distFiles.length} files in dist folder`);

    // Create temporary directory if it doesn't exist
    if (await fileExists(TEMP_DIR)) {
      await fs.rm(TEMP_DIR, { recursive: true, force: true });
    }
    await fs.mkdir(TEMP_DIR);

    // Copy important project files to temp directory first
    const rootFiles = await fs.readdir(ROOT_DIR);
    
    for (const file of rootFiles) {
      const sourcePath = path.join(ROOT_DIR, file);
      const destPath = path.join(TEMP_DIR, file);
      
      // Skip if it matches ignore patterns
      if (IGNORE_PATTERNS.some(pattern => pattern.test(file))) {
        continue;
      }
      
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        // Skip certain directories but keep some important ones
        if (file !== 'dist' && file !== 'node_modules' && !file.startsWith('.')) {
          await fs.cp(sourcePath, destPath, { recursive: true });
        }
      } else {
        // Copy important files like package.json, netlify.toml, etc.
        await fs.copyFile(sourcePath, destPath);
      }
    }
    
    // Now copy all dist files to the root
    console.log('🔄 Copying dist files to root directory...');
    
    for (const file of distFiles) {
      const sourcePath = path.join(DIST_DIR, file);
      const destPath = path.join(ROOT_DIR, file);
      
      try {
        const stats = await fs.stat(sourcePath);
        
        if (stats.isDirectory()) {
          // Create directory if it doesn't exist
          if (!await fileExists(destPath)) {
            await fs.mkdir(destPath, { recursive: true });
          }
        } else {
          // Copy file, creating parent directories if needed
          const destDir = path.dirname(destPath);
          if (!await fileExists(destDir)) {
            await fs.mkdir(destDir, { recursive: true });
          }
          await fs.copyFile(sourcePath, destPath);
        }
      } catch (err) {
        console.error(`❌ Error copying ${file}: ${err.message}`);
      }
    }
    
    console.log('✅ Files prepared for deployment! Ready to deploy with Bolt.');
    console.log('⚠️  Warning: Your root directory now contains built files. Use git status to check which files to commit.');

  } catch (error) {
    console.error('❌ Error preparing files for deployment:', error.message);
    process.exit(1);
  }
}

copyDistToRoot();