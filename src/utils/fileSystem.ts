export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  size?: number;
  lastModified?: Date;
}

export const processS3Keys = (objects: any[]): FileNode[] => {
  const root: FileNode[] = [];
  const map: { [key: string]: FileNode } = {};

  objects.forEach((obj) => {
    const key = obj.Key;
    if (!key) return;

    const isExplicitFolder = key.endsWith('/');
    const cleanKey = isExplicitFolder ? key.slice(0, -1) : key;
    const parts = cleanKey.split('/');
    let currentPath = "";

    parts.forEach((part: string, index: number) => {
      const isLastPart = index === parts.length - 1;
      const isFile = isLastPart && !isExplicitFolder;

      const parentPath = currentPath;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!map[currentPath]) {
        const node: FileNode = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : [],
          size: isFile ? obj.Size : undefined,
          lastModified: isFile ? obj.LastModified : undefined,
        };

        map[currentPath] = node;

        if (index === 0) {
          root.push(node);
        } else {
          const parent = map[parentPath];
          if (parent && parent.children) {
            // Check if child already exists (avoid duplicates)
            if (!parent.children.find(c => c.path === node.path)) {
              parent.children.push(node);
            }
          }
        }
      } else if (isLastPart && isExplicitFolder) {
        // If we already have a node for this path (created implicitly by a file inside it),
        // but now we see the explicit folder key, we might want to update metadata if needed.
        // For now, existing is fine.
      }
    });
  });

  return root;
};
