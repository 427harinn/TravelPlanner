import React, { useMemo, useState } from "react";

const stops = [
  {
    id: "yukuhashi",
    name: "行橋",
    emoji: "🚗",
    time: "9:00",
    category: "出発",
    short: "朝に行橋を出発",
    detail: "行橋駅周辺から出発。別府方面へ車で移動して、最初の目的地である鉄輪の地獄蒸し工房を目指す。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%8C%E6%A9%8B%E9%A7%85",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E8%A1%8C%E6%A9%8B",
    x: 12, y: 70, chip: "#e2e8f0", chipText: "#475569",
  },
  {
    id: "jigokuMushi",
    name: "地獄蒸し工房 鉄輪",
    emoji: "♨️",
    time: "10:10",
    category: "昼食",
    short: "温泉蒸気で食事を楽しむ",
    detail: "鉄輪の名物である地獄蒸しを体験する最初の立ち寄り先。到着後に受付を済ませて、温泉蒸気を使った食事を楽しむ想定。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%9C%B0%E7%8D%84%E8%92%B8%E3%81%97%E5%B7%A5%E6%88%BF%E9%89%84%E8%BC%AA",
    photoUrl: "https://jigokumushi.com/",
    x: 58, y: 28, chip: "#fed7aa", chipText: "#9a3412",
  },
  {
    id: "umi",
    name: "海地獄",
    emoji: "🩵",
    time: "12:00",
    category: "地獄めぐり",
    short: "コバルトブルーの定番スポット",
    detail: "別府地獄めぐりの代表格。鮮やかな青色の湯けむりを楽しめる定番スポットとして組み込まれている。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B5%B7%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/umi/",
    x: 71, y: 18, chip: "#bae6fd", chipText: "#0c4a6e",
  },
  {
    id: "kamado",
    name: "かまど地獄",
    emoji: "🔥",
    time: "12:40",
    category: "地獄めぐり",
    short: "湯けむりと演出を楽しむ",
    detail: "複数の見どころがまとまった人気スポット。海地獄の近くにあるため、流れで立ち寄りやすい構成。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%81%8B%E3%81%BE%E3%81%A9%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    x: 78, y: 28, chip: "#fca5a5", chipText: "#7f1d1d",
  },
  {
    id: "oniishi",
    name: "鬼石坊主地獄",
    emoji: "🪨",
    time: "13:20",
    category: "地獄めぐり",
    short: "泥湯の景観を見る",
    detail: "灰色の熱泥が沸き立つ独特の景観が特徴。近接エリアのため、徒歩でまとめて回る想定に向いている。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%AC%BC%E7%9F%B3%E5%9D%8A%E4%B8%BB%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    x: 63, y: 20, chip: "#d9f99d", chipText: "#365314",
  },
  {
    id: "chinoike",
    name: "血の池地獄",
    emoji: "🔴",
    time: "14:10",
    category: "地獄めぐり",
    short: "赤い熱泥の名所",
    detail: "鉄分を含む赤い池が印象的な地獄。龍巻地獄とセットで訪れやすい終盤の観光ポイント。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%80%E3%81%AE%E6%B1%A0%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    x: 84, y: 52, chip: "#fecdd3", chipText: "#881337",
  },
  {
    id: "tatsumaki",
    name: "龍巻地獄",
    emoji: "🌪️",
    time: "14:40",
    category: "地獄めぐり",
    short: "間欠泉を見学",
    detail: "一定間隔で噴き上がる間欠泉を見られるスポット。血の池地獄と並べて回ると移動効率がよい。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%BE%8D%E5%B7%BB%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    x: 76, y: 46, chip: "#c7d2fe", chipText: "#312e81",
  },
  {
    id: "suginoi",
    name: "杉乃井ホテル",
    emoji: "🏨",
    time: "15:30",
    category: "宿泊",
    short: "チェックインして休憩",
    detail: "観光後の宿泊先。チェックイン後は温泉や館内施設でゆっくり過ごす流れを想定している。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%89%E4%B9%83%E4%BA%95%E3%83%9B%E3%83%86%E3%83%AB+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://suginoi.orixhotelsandresorts.com/",
    x: 44, y: 58, chip: "#a7f3d0", chipText: "#064e3b",
  },
  {
    id: "toyoken",
    name: "東洋軒",
    emoji: "🍗",
    time: "翌日",
    category: "食事",
    short: "とり天で旅を締める",
    detail: "翌日の食事スポット。別府名物のとり天を食べて旅を締める構成になっている。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E6%B4%8B%E8%BB%92+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.toyoken-beppu.co.jp/toriten/",
    x: 33, y: 76, chip: "#fef08a", chipText: "#713f12",
  },
];

const css = `
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { height: 100%; }

:root {
  --bg: #f8f7f5;
  --surface: #ffffff;
  --surface2: #f1f0ed;
  --text: #1c1917;
  --text2: #78716c;
  --border: #e7e5df;
  --accent: #e85c3a;
  --accent-soft: #fff2ee;
  --font: 'Zen Maru Gothic', 'Hiragino Maru Gothic ProN', sans-serif;
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

/* shell */
.shell {
  display: flex;
  flex-direction: column;
  height: 100svh;
  max-width: 430px;
  margin: 0 auto;
  background: var(--bg);
  overflow: hidden;
}

/* header */
.hdr {
  flex-shrink: 0;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 12px 16px 10px;
  display: flex;
  align-items: center;
  gap: 11px;
}
.hdr-icon {
  width: 40px; height: 40px;
  border-radius: 13px;
  background: var(--accent-soft);
  display: flex; align-items: center; justify-content: center;
  font-size: 21px;
  flex-shrink: 0;
}
.hdr-title { font-size: 16px; font-weight: 700; line-height: 1.25; }
.hdr-sub   { font-size: 11px; color: var(--text2); margin-top: 1px; font-weight: 500; }
.hdr-pill {
  margin-left: auto;
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

/* tabs */
.tabs {
  flex-shrink: 0;
  display: flex;
  padding: 8px 12px;
  gap: 6px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}
.tab {
  flex: 1;
  height: 36px;
  border: none;
  border-radius: 10px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: var(--surface2);
  color: var(--text2);
  transition: background 0.14s, color 0.14s;
  -webkit-tap-highlight-color: transparent;
}
.tab.on { background: var(--accent); color: #fff; }

/* scroll */
.scroll {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* ── MAP ── */
.map-wrap {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.map-canvas {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  height: 280px;
  border: 1px solid var(--border);
  background:
    radial-gradient(ellipse at 18% 22%, #dbeafe88 0%, transparent 50%),
    radial-gradient(ellipse at 78% 65%, #dcfce788 0%, transparent 50%),
    radial-gradient(ellipse at 52% 12%, #fef9c388 0%, transparent 40%),
    #ecfdf5;
}

.map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  z-index: 2;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.13s;
}
.map-pin:active { transform: translate(-50%,-50%) scale(0.9); }
.map-pin.sel { z-index: 3; }

.pin-bubble {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--surface);
  border: 1.5px solid rgba(0,0,0,0.1);
  display: flex; align-items: center; justify-content: center;
  font-size: 17px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.13s;
}
.map-pin.sel .pin-bubble {
  width: 44px; height: 44px;
  font-size: 21px;
  box-shadow: 0 0 0 2.5px var(--accent), 0 3px 10px rgba(0,0,0,0.15);
}
.pin-num {
  font-size: 8px;
  font-weight: 700;
  color: var(--text2);
  background: var(--surface);
  border-radius: 999px;
  padding: 0 5px;
  line-height: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* selected card */
.sel-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  gap: 11px;
}
.sel-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.sel-name  { font-size: 14px; font-weight: 700; }
.sel-short { font-size: 11px; color: var(--text2); margin-top: 2px; font-weight: 500; }
.sel-open {
  margin-left: auto;
  flex-shrink: 0;
  padding: 7px 13px;
  border-radius: 9px;
  border: none;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.sel-open:active { background: #ffddd5; }

/* info grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.mini {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 11px 13px;
}
.mini-lbl {
  font-size: 10px;
  font-weight: 700;
  color: var(--text2);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.mini-val { font-size: 13px; font-weight: 700; margin-top: 4px; }

/* ── LIST ── */
.list-wrap {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-bottom: 28px;
}

.li {
  display: flex;
  align-items: center;
  gap: 11px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 11px 13px;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}
.li:active { background: var(--surface2); }
.li.sel {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.li-icon {
  width: 42px; height: 42px;
  border-radius: 13px;
  display: flex; align-items: center; justify-content: center;
  font-size: 21px;
  flex-shrink: 0;
}
.li-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 2px;
}
.li-time { font-size: 11px; color: var(--text2); font-weight: 700; }
.li-chip {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.03em;
}
.li-name {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.li-short {
  font-size: 11px;
  color: var(--text2);
  margin-top: 1px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.li-num {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--text2);
  background: var(--surface2);
  border-radius: 999px;
  padding: 2px 8px;
  min-width: 26px;
  text-align: center;
}
.li.sel .li-num { background: var(--accent); color: #fff; }

/* ── DETAIL SHEET ── */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.32);
  backdrop-filter: blur(3px);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  animation: bdfade 0.18s ease;
}
@keyframes bdfade { from { opacity:0 } to { opacity:1 } }

.sheet {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  padding: 12px 16px 36px;
  max-height: 86svh;
  overflow-y: auto;
  animation: sheetup 0.22s cubic-bezier(0.34,1.08,0.5,1);
}
@keyframes sheetup {
  from { transform: translateY(55%) }
  to   { transform: translateY(0) }
}

.sheet-handle {
  width: 34px; height: 4px;
  border-radius: 999px;
  background: var(--border);
  margin: 0 auto 14px;
}

.sheet-top {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-bottom: 14px;
}
.sheet-icon {
  width: 52px; height: 52px;
  border-radius: 17px;
  display: flex; align-items: center; justify-content: center;
  font-size: 27px;
  flex-shrink: 0;
}
.sheet-tag { font-size: 10px; font-weight: 700; color: var(--text2); letter-spacing: 0.06em; }
.sheet-name { font-size: 18px; font-weight: 700; margin-top: 2px; line-height: 1.25; }
.sheet-x {
  margin-left: auto;
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--surface2);
  font-size: 14px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--text2);
  -webkit-tap-highlight-color: transparent;
}
.sheet-x:active { background: var(--border); }

.sheet-box {
  background: var(--surface2);
  border-radius: 16px;
  padding: 13px 15px;
  margin-bottom: 12px;
}
.sheet-box-lbl {
  font-size: 10px;
  font-weight: 700;
  color: var(--text2);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.sheet-short { font-size: 14px; font-weight: 700; margin-bottom: 5px; }
.sheet-detail {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text2);
  font-weight: 500;
}

.sheet-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}
.btn-a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 13px;
  border-radius: 13px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.btn-a.primary { background: var(--accent); color: #fff; }
.btn-a.secondary { background: var(--surface2); color: var(--text); }
.btn-a:active { opacity: 0.82; }
`;

export default function App() {
  const [tab, setTab] = useState("map");
  const [selId, setSelId] = useState("jigokuMushi");
  const [sheet, setSheet] = useState(false);
  const spotMap = useMemo(() => Object.fromEntries(stops.map(s => [s.id, s])), []);
  const sel = spotMap[selId];

  function open(id) { setSelId(id); setSheet(true); }

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="hdr">
          <div className="hdr-icon">♨️</div>
          <div>
            <div className="hdr-title">別府旅行プラン</div>
            <div className="hdr-sub">地獄めぐり＆杉乃井ホテル泊</div>
          </div>
          <div className="hdr-pill">1泊2日</div>
        </div>

        <div className="tabs">
          <button className={`tab${tab === "map" ? " on" : ""}`} onClick={() => setTab("map")}>🗺 地図</button>
          <button className={`tab${tab === "list" ? " on" : ""}`} onClick={() => setTab("list")}>📋 予定</button>
        </div>

        <div className="scroll">
          {tab === "map"
            ? <MapView spotMap={spotMap} selId={selId} onPick={setSelId} onOpen={open} sel={sel} />
            : <ListView spotMap={spotMap} selId={selId} onOpen={open} />
          }
        </div>
      </div>

      {sheet && <Sheet spot={sel} onClose={() => setSheet(false)} />}
    </>
  );
}

function MapView({ spotMap, selId, onPick, onOpen, sel }) {
  const route = useMemo(() => stops.map(s => s.id), []);
  return (
    <div className="map-wrap">
      <div className="map-canvas">
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            points={route.map(id => `${spotMap[id].x},${spotMap[id].y}`).join(" ")}
            stroke="rgba(0,0,0,0.12)"
            strokeDasharray="2.5 2.5"
            strokeLinecap="round"
            strokeWidth="1.1"
          />
        </svg>
        {route.map((id, i) => {
          const s = spotMap[id];
          return (
            <button
              key={id}
              className={`map-pin${selId === id ? " sel" : ""}`}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              onClick={() => onPick(id)}
              onDoubleClick={() => onOpen(id)}
            >
              <div className="pin-bubble">{s.emoji}</div>
              <div className="pin-num">{i + 1}</div>
            </button>
          );
        })}
      </div>

      <div className="sel-card">
        <div className="sel-icon" style={{ background: sel.chip + "55" }}>{sel.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div className="sel-name">{sel.name}</div>
          <div className="sel-short">{sel.short}</div>
        </div>
        <button className="sel-open" onClick={() => onOpen(selId)}>詳細</button>
      </div>

      <div className="info-grid">
        {[
          ["⏰ 時刻", sel.time],
          ["🏷 カテゴリ", sel.category],
          ["🏨 宿泊", "杉乃井ホテル"],
          ["📍 スポット数", `${stops.length} 件`],
        ].map(([lbl, val]) => (
          <div className="mini" key={lbl}>
            <div className="mini-lbl">{lbl}</div>
            <div className="mini-val">{val}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ListView({ spotMap, selId, onOpen }) {
  return (
    <div className="list-wrap">
      {stops.map((s, i) => (
        <button key={s.id} className={`li${selId === s.id ? " sel" : ""}`} onClick={() => onOpen(s.id)}>
          <div className="li-icon" style={{ background: s.chip + "66" }}>{s.emoji}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="li-row">
              <span className="li-time">{s.time}</span>
              <span className="li-chip" style={{ background: s.chip, color: s.chipText }}>{s.category}</span>
            </div>
            <div className="li-name">{s.name}</div>
            <div className="li-short">{s.short}</div>
          </div>
          <div className="li-num">{i + 1}</div>
        </button>
      ))}
    </div>
  );
}

function Sheet({ spot, onClose }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-top">
          <div className="sheet-icon" style={{ background: spot.chip + "55" }}>{spot.emoji}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sheet-tag">{spot.time} · {spot.category}</div>
            <div className="sheet-name">{spot.name}</div>
          </div>
          <button className="sheet-x" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-box">
          <div className="sheet-box-lbl">まとめ</div>
          <div className="sheet-short">{spot.short}</div>
          <div className="sheet-detail">{spot.detail}</div>
        </div>
        <div className="sheet-btns">
          <a href={spot.mapUrl} target="_blank" rel="noreferrer" className="btn-a primary">🗺 マップ</a>
          <a href={spot.photoUrl} target="_blank" rel="noreferrer" className="btn-a secondary">📸 写真</a>
        </div>
      </div>
    </div>
  );
}