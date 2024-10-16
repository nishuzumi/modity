interface SourceMapEntry {
  s: number; // start
  l: number; // length
  f: number; // file index
  j: string; // jump type
  m: number; // modifier depth
}

interface ParsedSourceMap {
  bytecodeMap: SourceMapEntry[];
  sourceCode: string[];
}

function parseSourceMap(sourceCode: string, bytecodeSourceMap: string): ParsedSourceMap {
  const sourceFiles = sourceCode.split('\n===\n'); // 假设源文件用 '===\n' 分隔

  const bytecodeMap = parseBytecodeSourceMap(bytecodeSourceMap);

  return {
    bytecodeMap,
    sourceCode: sourceFiles
  };
}

function parseBytecodeSourceMap(sourceMap: string): SourceMapEntry[] {
  const entries = sourceMap.split(';');
  let s = -1, l = -1, f = -1, j = '', m = -1;
  
  return entries.map(entry => {
    const parts = entry.split(':');
    
    if (parts[0] !== '') s = parseInt(parts[0], 10);
    if (parts.length > 1 && parts[1] !== '') l = parseInt(parts[1], 10);
    if (parts.length > 2 && parts[2] !== '') f = parseInt(parts[2], 10);
    if (parts.length > 3 && parts[3] !== '') j = parts[3];
    if (parts.length > 4 && parts[4] !== '') m = parseInt(parts[4], 10);
    
    s = s === -1 ? 0 : s;
    l = l === -1 ? 0 : l;
    f = f === -1 ? 0 : f;
    j = j === '' ? '-' : j;
    m = m === -1 ? 0 : m;
    
    return { s, l, f, j, m };
  });
}

function mapBytecodeToSource(parsedMap: ParsedSourceMap): string[] {
  return parsedMap.bytecodeMap.map(entry => {
    if (entry.f >= parsedMap.sourceCode.length) {
      return `Invalid file index: ${entry.f}`;
    }
    const sourceFile = parsedMap.sourceCode[entry.f];
    if (entry.s + entry.l > sourceFile.length) {
      return `Invalid source range: File ${entry.f}, Offset ${entry.s}, Length ${entry.l}`;
    }
    const sourceSnippet = sourceFile.substring(entry.s, entry.s + entry.l);
    return `File ${entry.f}, Offset ${entry.s}, Length ${entry.l}, Jump ${entry.j}, Modifier Depth ${entry.m}: ${sourceSnippet}`;
  });
}