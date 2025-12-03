import React, { useState } from 'react';
import type { FileNode } from '../utils/fileSystem';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileExplorerProps {
  node: FileNode;
  level?: number;
}

const getFileKind = (name: string, type: 'file' | 'folder'): string => {
  if (type === 'folder') return 'Folder';
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts': return 'TypeScript file';
    case 'tsx': return 'TypeScript React file';
    case 'js': return 'JavaScript file';
    case 'jsx': return 'JavaScript React file';
    case 'json': return 'JSON document';
    case 'css': return 'CSS file';
    case 'html': return 'HTML document';
    case 'md': return 'Markdown document';
    case 'txt': return 'Text document';
    case 'png': return 'PNG image';
    case 'jpg':
    case 'jpeg': return 'JPEG image';
    case 'svg': return 'SVG image';
    case 'glb':
    case 'gltf': return 'GL Transmission Format';
    default: return `${ext?.toUpperCase() || 'Unknown'} file`;
  }
};

const formatDate = (date?: Date) => {
  if (!date) return '--';
  return new Date(date).toLocaleString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const formatSize = (bytes?: number) => {
  if (bytes === undefined) return '--';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const FileExplorer: React.FC<FileExplorerProps> = ({ node, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    }
  };

  const paddingLeft = `${level * 20}px`;

  return (
    <div>
      <div
        className={`grid grid-cols-12 gap-4 px-4 py-1 hover:bg-blue-50 cursor-pointer text-sm items-center group ${isOpen ? 'bg-gray-50' : ''}`}
        onClick={toggleOpen}
      >
        {/* Name Column */}
        <div className="col-span-6 flex items-center overflow-hidden whitespace-nowrap" style={{ paddingLeft }}>
          <span className="mr-1 text-gray-400 flex-shrink-0">
            {node.type === 'folder' ? (
              <div className="p-0.5 rounded-sm hover:bg-gray-200 transition-colors">
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            ) : (
              <span className="w-[18px]" /> 
            )}
          </span>
          
          <span className={`mr-2 flex-shrink-0 ${node.type === 'folder' ? 'text-blue-400' : 'text-gray-400'}`}>
            {node.type === 'folder' ? <Folder size={16} fill="currentColor" className="text-blue-400" /> : <File size={16} />}
          </span>
          
          <span className={`truncate ${node.type === 'folder' ? 'font-medium text-gray-700' : 'text-gray-600'}`}>
            {node.name}
          </span>
        </div>

        {/* Date Modified Column */}
        <div className="col-span-3 text-gray-500 truncate text-xs">
          {formatDate(node.lastModified)}
        </div>

        {/* Size Column */}
        <div className="col-span-1 text-right text-gray-500 text-xs font-mono">
          {formatSize(node.size)}
        </div>

        {/* Kind Column */}
        <div className="col-span-2 pl-4 text-gray-500 truncate text-xs">
          {getFileKind(node.name, node.type)}
        </div>
      </div>

      {isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileExplorer key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
