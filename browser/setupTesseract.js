import { TesseractWorker } from "tesseract.js";

import {hljs} from "highlight.js";

export function setupTesseract() {

    const results = document.getElementById("results");
    const timings = document.getElementById("timing");

    const worker = new TesseractWorker({
        workerPath: require.resolve("worker.min.js"),
        langPath: require.resolve("lang-data"),
        corePath: require.resolve("tesseract-core.js"),
    });
    let start = window.performance.now();
    worker
        .recognize("images/rcc.jpg", "micr")
        .progress((info) => {
            console.log(info);
        })
        .then((result) => {
            console.log(result);
            let end = window.performance.now();
            let time = end - start;
            debugger;
            const getCircularReplacer = () => {
                const seen = new WeakSet();
                return (key, value) => {
                    if (typeof value === "object" && value !== null) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };
            };
            results.innerHTML = result.text;
            // results.innerHTML = JSON.stringify(result, getCircularReplacer());
            // hljs.highlightBlock(results);
            timings.innerHTML = "Took: " + time + "ms";
        });
}