import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  Copy,
  Check,
  Code2,
  Server,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { xcloudProjectTree, FileNode } from '../services/architectureData';

export const ArchitectureView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileNode>({
    name: 'mpesa.py',
    type: 'file',
    path: 'XCLOUD/backend/apps/payments/mpesa.py',
    description: 'Daraja / Vodacom M-Pesa STK Push Gateway Integration',
    content: xcloudProjectTree.children?.[0].children?.[2].children?.[0].children?.[0].content || ''
  });

  const [copied, setCopied] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(['XCLOUD', 'XCLOUD/backend', 'XCLOUD/backend/apps', 'XCLOUD/backend/apps/payments', 'XCLOUD/radius', 'XCLOUD/radius/freeradius'])
  );

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleCopy = () => {
    if (!selectedFile.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (node: FileNode) => {
    if (node.type === 'file') {
      const isSelected = selectedFile.path === node.path;
      return (
        <button
          key={node.path}
          onClick={() => setSelectedFile(node)}
          className={`w-full flex items-center gap-2 px-2.5 py-1 text-xs rounded text-left transition-colors font-mono ${
            isSelected
              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      );
    }

    const isExpanded = expandedPaths.has(node.path);
    return (
      <div key={node.path} className="space-y-0.5">
        <button
          onClick={() => toggleExpand(node.path)}
          className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-slate-300 hover:text-white rounded hover:bg-slate-800/50 transition-colors font-medium font-sans text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div className="pl-4 border-l border-slate-800 ml-2.5 space-y-0.5">
            {node.children.map(renderTree)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            XCLOUD System Architecture & Backend Codebase
          </h1>
          <p className="text-xs text-slate-400">
            Full file hierarchy: Django 5 apps, FreeRADIUS configuration, WireGuard, and Docker-compose orchestration
          </p>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: File Tree */}
        <div className="md:col-span-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-y-auto max-h-[700px]">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Project Tree Structure
          </div>
          <div className="space-y-1">{renderTree(xcloudProjectTree)}</div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="md:col-span-8 flex flex-col rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
          {/* File Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/70">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-xs font-mono font-semibold text-slate-200">
                  {selectedFile.path}
                </div>
                {selectedFile.description && (
                  <div className="text-[11px] text-slate-400 font-sans">
                    {selectedFile.description}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy File'}</span>
            </button>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed select-all">
            <pre className="whitespace-pre-wrap">{selectedFile.content || '// Select a file to inspect'}</pre>
          </div>

          {/* Code Footer */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-800 bg-slate-950/70 text-[11px] text-slate-500 font-mono">
            <span>
              {selectedFile.path.endsWith('.py')
                ? 'Python 3.12 · Django 5.0'
                : selectedFile.path.endsWith('.conf')
                ? 'FreeRADIUS 3.2 Config'
                : selectedFile.path.endsWith('.yml')
                ? 'Docker Compose 3.8'
                : 'Configuration'}
            </span>
            <span>UTF-8 · Production Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
