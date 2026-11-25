import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function parseToolText(result) {
  assert.ok(result && Array.isArray(result.content), "tool result has no content");
  assert.equal(result.content[0]?.type, "text", "tool result is not text");
  return JSON.parse(result.content[0].text);
}

await check("WebMCP registers six tools and implements read/write behavior", async () => {
  const { registerTravelPlannerTools } = await import(pathToFileURL(path.join(root, "src/webmcp.js")).href);
  const samePlace = { lat: 35.6812, lng: 139.7671 };
  const fixture = [{
    id: "fixture-plan",
    name: "Fixture trip",
    description: "Acceptance fixture",
    startDate: "2026-11-25",
    endDate: "2026-11-27",
    stops: [
      { id: "day-one", day: 1, time: "09:00", name: "First", category: "visit", short: "A", detail: "", ...samePlace },
      { id: "day-two", day: 2, time: "10:00", name: "Second", category: "visit", short: "B", detail: "", ...samePlace },
      { id: "other-place", day: 1, time: "11:00", name: "Other", category: "visit", short: "C", detail: "", lat: 35.68, lng: 139.76 },
    ],
  }];
  let loggedIn = true;
  const calls = { createPlan: 0, addStop: 0, addMemo: 0 };
  const handlers = {
    getPlans: () => fixture,
    isLoggedIn: () => loggedIn,
    createPlan: async () => { calls.createPlan += 1; return fixture[0]; },
    addStop: async () => { calls.addStop += 1; return fixture[0].stops[0]; },
    addMemo: async () => { calls.addMemo += 1; return { id: "memo-1", text: "ok" }; },
  };
  const registered = [];
  globalThis.document = { modelContext: { registerTool: (tool) => registered.push(tool) } };
  assert.equal(registerTravelPlannerTools(handlers), 6);
  assert.deepEqual(registered.map((tool) => tool.name), [
    "list_plans", "get_itinerary", "get_place_schedule", "create_plan", "add_stop", "add_memo",
  ]);
  const tools = Object.fromEntries(registered.map((tool) => [tool.name, tool]));

  assert.deepEqual(parseToolText(await tools.list_plans.execute({}))[0], {
    id: "fixture-plan", name: "Fixture trip", description: "Acceptance fixture",
    startDate: "2026-11-25", endDate: "2026-11-27", stopCount: 3,
  });
  assert.deepEqual(parseToolText(await tools.get_itinerary.execute({ planId: "fixture-plan", day: 2 })).stops.map((stop) => stop.id), ["day-two"]);
  assert.deepEqual(parseToolText(await tools.get_place_schedule.execute({ planId: "fixture-plan", lat: samePlace.lat, lng: samePlace.lng })).map((stop) => stop.id), ["day-one", "day-two"]);

  loggedIn = false;
  for (const [name, args] of [
    ["create_plan", { name: "Nope", startDate: "2026-11-25" }],
    ["add_stop", { planId: "fixture-plan", name: "Nope" }],
    ["add_memo", { planId: "fixture-plan", stopId: "day-one", text: "Nope" }],
  ]) {
    assert.match((await tools[name].execute(args)).content[0].text, /login required/);
  }
  assert.deepEqual(calls, { createPlan: 0, addStop: 0, addMemo: 0 });
  delete globalThis.document;
  assert.doesNotThrow(() => assert.equal(registerTravelPlannerTools(handlers), 0));
});

await check("AC-1: no hard-coded coordinate fallback", () => {
  const source = read("beppu_travel_itinerary_app.jsx");
  const fallbackPatterns = [
    /Number\.isFinite\(\s*lat\s*\)\s*\?\s*lat\s*:\s*33(?:\.3158)?/g,
    /\b(?:const|let|var)\s+lat\s*=\s*[^;\n]*33\.3158/g,
    /\blat\s*=\s*[^;\n]*(?:\|\||\?\?|fallback|default)[^;\n]*33\.3158/g,
  ];
  const fallbacks = fallbackPatterns.flatMap((pattern) => [...source.matchAll(pattern)].map((match) => match[0]));
  assert.equal(fallbacks.length, 0, `fallback assignment(s): ${fallbacks.join(" | ")}`);
  const coordinateLines = source.split(/\r?\n/).filter((line) => /\blat\s*:\s*33\.3158\b/.test(line));
  console.log(`  coordinate literal report: ${coordinateLines.length ? `sample stop data (${coordinateLines.length} occurrence(s))` : "not present"}`);
});

await check("PWA manifest, icons, service worker, and index wiring", () => {
  const manifest = JSON.parse(read("public/manifest.webmanifest"));
  assert.ok(manifest.name, "manifest.name missing");
  assert.ok(manifest.start_url, "manifest.start_url missing");
  assert.equal(manifest.display, "standalone");
  for (const size of ["192x192", "512x512"]) {
    const icon = manifest.icons?.find((entry) => entry.sizes === size);
    assert.ok(icon, `manifest icon ${size} missing`);
    assert.ok(fs.existsSync(path.join(root, "public", icon.src)), `icon file missing: ${icon.src}`);
  }
  const sw = read("public/sw.js");
  assert.match(sw, /CACHE_NAME/);
  assert.match(sw, /index\.html/);
  const index = read("index.html");
  assert.match(index, /manifest\.webmanifest/);
  assert.match(index, /serviceWorker\.register\(["'`]\.\/sw\.js/);
});

await check("Initial sample plans contain no sample marker", () => {
  const source = read("beppu_travel_itinerary_app.jsx");
  assert.equal(source.includes("サンプル"), false, "found the initial-plan sample marker サンプル");
});

const failed = results.filter((result) => !result.ok).length;
console.log(`SUMMARY: ${results.length - failed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
