let wasmReady = false;

var Module = {
    onRuntimeInitialized: function () {
        wasmReady = true;
        postMessage({ type: "ready" });
    }
};

importScripts("engine.js");

self.onmessage = function (event) {
    const data = event.data;

    if (data.type === "analyze") {
        if (!wasmReady) return;

        const ok = Module.ccall(
            "web_set_fen",
            "number",
            ["string"],
            [data.fen]
        );

        if (!ok) {
            postMessage({
                version: data.version,
                result: { ok: false, error: "set fen failed" }
            });
            return;
        }

        const jsonStr = Module.ccall(
            "web_analyze_depth",
            "string",
            ["number"],
            [data.depth]
        );

        const result = JSON.parse(jsonStr);

        postMessage({
            version: data.version,
            result
        });
    }
};