// WebMCP 対応: 対応ブラウザでのみツールを登録する。非対応環境では何もしない。
// 仕様は W3C WebMCP 草案（document.modelContext.registerTool）に追随し、
// 旧来の navigator.modelContext もフォールバックとして見る。

function textResult(payload) {
  return {
    content: [{ type: "text", text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2) }],
  };
}

function summarizePlan(plan) {
  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    startDate: plan.startDate,
    endDate: plan.endDate,
    stopCount: Array.isArray(plan.stops) ? plan.stops.length : 0,
  };
}

function summarizeStop(stop) {
  return {
    id: stop.id,
    day: stop.day,
    time: stop.time,
    name: stop.name,
    category: stop.category,
    short: stop.short,
    detail: stop.detail,
    lat: stop.lat ?? null,
    lng: stop.lng ?? null,
    memos: Array.isArray(stop.memos) ? stop.memos : [],
  };
}

export function registerTravelPlannerTools(handlers) {
  if (typeof document === "undefined") return 0;
  const modelContext = document.modelContext || (typeof navigator !== "undefined" ? navigator.modelContext : undefined);
  if (!modelContext || typeof modelContext.registerTool !== "function") return 0;

  const tools = [
    {
      name: "list_plans",
      description: "旅行プランの一覧を返す",
      inputSchema: { type: "object", properties: {} },
      execute: async () => textResult(handlers.getPlans().map(summarizePlan)),
    },
    {
      name: "get_itinerary",
      description: "指定したプランの旅程を返す。day を指定するとその日だけ返す",
      inputSchema: {
        type: "object",
        properties: {
          planId: { type: "string" },
          day: { type: "number" },
        },
        required: ["planId"],
      },
      execute: async ({ planId, day }) => {
        const plan = handlers.getPlans().find((item) => item.id === planId);
        if (!plan) return textResult(`plan not found: ${planId}`);
        const stops = (plan.stops || []).filter((stop) => !day || stop.day === day).map(summarizeStop);
        return textResult({ ...summarizePlan(plan), stops });
      },
    },
    {
      name: "get_place_schedule",
      description: "同じ場所（座標）にある予定を時刻順に返す。placeName で場所名から探すこともできる",
      inputSchema: {
        type: "object",
        properties: {
          planId: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
          placeName: { type: "string" },
        },
        required: ["planId"],
      },
      execute: async ({ planId, lat, lng, placeName }) => {
        const plan = handlers.getPlans().find((item) => item.id === planId);
        if (!plan) return textResult(`plan not found: ${planId}`);
        let stops = plan.stops || [];
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          stops = stops.filter(
            (stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng)
              && Math.abs(stop.lat - lat) < 0.0005 && Math.abs(stop.lng - lng) < 0.0005,
          );
        } else if (placeName) {
          stops = stops.filter((stop) => stop.name.includes(placeName) || (stop.short || "").includes(placeName));
        }
        return textResult(stops.map(summarizeStop));
      },
    },
    {
      name: "create_plan",
      description: "新しい旅行プランを作成する（ログイン時のみ）",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          startDate: { type: "string", description: "YYYY-MM-DD" },
          endDate: { type: "string", description: "YYYY-MM-DD" },
          icon: { type: "string" },
        },
        required: ["name", "startDate"],
      },
      execute: async (args) => {
        if (!handlers.isLoggedIn()) return textResult("login required");
        const plan = await handlers.createPlan(args);
        return textResult({ created: summarizePlan(plan) });
      },
    },
    {
      name: "add_stop",
      description: "プランに予定を追加する。placeQuery か name から座標を自動取得し、取れない場合は座標なしで登録する（ログイン時のみ）",
      inputSchema: {
        type: "object",
        properties: {
          planId: { type: "string" },
          name: { type: "string" },
          day: { type: "number" },
          time: { type: "string", description: "HH:MM" },
          category: { type: "string" },
          short: { type: "string" },
          detail: { type: "string" },
          placeQuery: { type: "string" },
        },
        required: ["planId", "name"],
      },
      execute: async (args) => {
        if (!handlers.isLoggedIn()) return textResult("login required");
        const stop = await handlers.addStop(args.planId, args);
        if (!stop) return textResult(`plan not found: ${args.planId}`);
        return textResult({ added: summarizeStop(stop) });
      },
    },
    {
      name: "add_memo",
      description: "予定に共有メモを追記する（ログイン時のみ）",
      inputSchema: {
        type: "object",
        properties: {
          planId: { type: "string" },
          stopId: { type: "string" },
          text: { type: "string" },
        },
        required: ["planId", "stopId", "text"],
      },
      execute: async ({ planId, stopId, text }) => {
        if (!handlers.isLoggedIn()) return textResult("login required");
        const memo = await handlers.addMemo(planId, stopId, text);
        if (!memo) return textResult("plan or stop not found");
        return textResult({ added: memo });
      },
    },
  ];

  let registered = 0;
  for (const tool of tools) {
    try {
      modelContext.registerTool(tool);
      registered += 1;
    } catch (error) {
      // 同名ツールの二重登録などは無視する
    }
  }
  return registered;
}
