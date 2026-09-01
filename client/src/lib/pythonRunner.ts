export type PythonRunResult = {
  stdout: string;
  stderr: string;
  durationMs: number;
};

const PYODIDE_SCRIPT = "https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js";
const EXECUTION_TIMEOUT_MS = 8_000;

const WORKER_SOURCE = `
let pyodidePromise;

async function getPyodide() {
  if (!pyodidePromise) {
    importScripts("${PYODIDE_SCRIPT}");
    pyodidePromise = loadPyodide();
  }
  return pyodidePromise;
}

self.onmessage = async event => {
  const { id, code, inputs } = event.data;
  try {
    const pyodide = await getPyodide();
    pyodide.globals.set("user_code", code);
    pyodide.globals.set("inputs_json", JSON.stringify(inputs));

    const runner = [
      "import builtins, io, json, sys, traceback",
      "_input_values = iter(json.loads(inputs_json))",
      "def _pymentor_input(prompt=''):",
      "    if prompt:",
      "        print(prompt, end='')",
      "    try:",
      "        return next(_input_values)",
      "    except StopIteration:",
      "        raise EOFError('Não há mais valores de entrada disponíveis.')",
      "builtins.input = _pymentor_input",
      "sys.stdout = io.StringIO()",
      "sys.stderr = io.StringIO()",
      "try:",
      "    exec(compile(user_code, '<pymentor>', 'exec'), {'__name__': '__main__'})",
      "except BaseException:",
      "    traceback.print_exc(file=sys.stderr)",
      "result_stdout = sys.stdout.getvalue()",
      "result_stderr = sys.stderr.getvalue()",
    ].join("\\n");

    await pyodide.runPythonAsync(runner);
    const stdout = pyodide.globals.get("result_stdout");
    const stderr = pyodide.globals.get("result_stderr");
    self.postMessage({ id, ok: true, stdout: String(stdout), stderr: String(stderr) });
    stdout.destroy();
    stderr.destroy();
  } catch (error) {
    self.postMessage({ id, ok: false, error: error instanceof Error ? error.message : String(error) });
  }
};
`;

type WorkerResponse =
  | { id: number; ok: true; stdout: string; stderr: string }
  | { id: number; ok: false; error: string };

let runnerWorker: Worker | null = null;
let requestId = 0;

function getWorker() {
  if (!runnerWorker) {
    const workerUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "application/javascript" }));
    runnerWorker = new Worker(workerUrl);
    runnerWorker.addEventListener("error", () => {
      runnerWorker?.terminate();
      runnerWorker = null;
    });
  }
  return runnerWorker;
}

export function runPython(code: string, input: string): Promise<PythonRunResult> {
  const id = ++requestId;
  const startedAt = performance.now();
  const worker = getWorker();

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      window.clearTimeout(timeoutId);
      callback();
    };
    const onMessage = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.id !== id) return;
      finish(() => {
        if (event.data.ok) {
          resolve({
            stdout: event.data.stdout,
            stderr: event.data.stderr,
            durationMs: Math.round(performance.now() - startedAt),
          });
        } else {
          reject(new Error(event.data.error));
        }
      });
    };
    const onError = (event: ErrorEvent) => finish(() => reject(new Error(event.message || "O executor Python encontrou um erro inesperado.")));
    const timeoutId = window.setTimeout(() => {
      finish(() => {
        worker.terminate();
        runnerWorker = null;
        reject(new Error("TIMEOUT"));
      });
    }, EXECUTION_TIMEOUT_MS);

    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    const inputs = input.length === 0 ? [] : input.split(/\r?\n/);
    worker.postMessage({ id, code, inputs });
  });
}

export function isPythonTimeout(error: unknown) {
  return error instanceof Error && error.message === "TIMEOUT";
}
