import { processS3Keys } from './src/utils/fileSystem';
import assert from 'assert';

const mockData = [
  { Key: 'folder1/file1.txt', Size: 1024 },
  { Key: 'folder1/subfolder/file2.txt', Size: 2048 },
  { Key: 'file3.txt', Size: 512 },
  { Key: 'folder2/', Size: 0 }, // S3 folder marker
];

const result = processS3Keys(mockData);

console.log(JSON.stringify(result, null, 2));

assert.strictEqual(result.length, 3, 'Root should have 3 items (folder1, file3.txt, folder2)');
const folder1 = result.find(n => n.name === 'folder1');
assert.ok(folder1, 'folder1 should exist');
assert.strictEqual(folder1?.children?.length, 2, 'folder1 should have 2 children (file1.txt, subfolder)');
const subfolder = folder1?.children?.find(n => n.name === 'subfolder');
assert.ok(subfolder, 'subfolder should exist');
assert.strictEqual(subfolder?.children?.length, 1, 'subfolder should have 1 child');

console.log('Test passed!');
