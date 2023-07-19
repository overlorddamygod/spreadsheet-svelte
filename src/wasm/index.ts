import './wasm_exec';

async function loadWasmModule() {
  const go = new Go();
  const response = await fetch('wasm-eval.wasm');
  const bytes = await response.arrayBuffer();
  const result = await WebAssembly.instantiate(bytes, go.importObject);
  go.run(result.instance);

  // const expression = '2 + 3 * 4'; // Example math expression

  // console.log(`Result: ${evaluateExpression(expression)}`);

  // const customResult = customFunction(5, 7); // Example values for the custom function
  // console.log(`Custom result: ${customResult}`);
  return go;
}

export default loadWasmModule();
