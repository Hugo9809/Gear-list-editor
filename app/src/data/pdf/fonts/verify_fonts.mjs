
import { ubuntuVfs } from './ubuntu-vfs.js';

console.log('Checking Ubuntu VFS...');
const keys = Object.keys(ubuntuVfs);
console.log('Keys found:', keys);

for (const key of keys) {
    const content = ubuntuVfs[key];
    const type = typeof content;
    const length = content ? content.length : 0;
    console.log(`Key: ${key}, Type: ${type}, Length: ${length}`);
    if (length < 100) {
        console.warn(`WARNING: Content for ${key} seems too short! Content: "${content}"`);
    }
}
