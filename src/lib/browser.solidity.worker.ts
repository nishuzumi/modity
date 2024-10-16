declare global {
  interface SolidityModule {
    cwrap: (name: string, returnType: string, argTypes: string[]) => (...args: string[]) => string;
    _solidity_compile?: unknown;
  }

  interface Worker {
    Module: SolidityModule;
  }
}

function browserSolidityCompiler() {
  const ctx: Worker = self as unknown as Worker;
  const loaded: Record<string, boolean> = {}

  ctx.addEventListener('message', ({ data }) => {
    const { id, input, version } = data;
    if (input === 'fetch-compiler-versions') {
      fetch('https://binaries.soliditylang.org/bin/list.json')
        .then((response) => response.json())
        .then((result) => {
          postMessage({ id, result });
        })
        .catch((error) => {
          postMessage({ id, error: error.message });
        });
    } else {
      if(!loaded[version]){
        importScripts(version);
        loaded[version] = true
      }
      const soljson = ctx.Module;

      if ('_solidity_compile' in soljson) {
        const compile = soljson.cwrap('solidity_compile', 'string', [
          'string',
          'number',
        ]);
        const output = JSON.parse(compile(input));
        postMessage({ id, result: output });
      }
    }
  });
}

if (
  typeof WorkerGlobalScope !== 'undefined' &&
  self instanceof WorkerGlobalScope
) {
  browserSolidityCompiler();
}

export { browserSolidityCompiler };