import React, { useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

const initialStops = [
  {
    id: "yukuhashi",
    name: "行橋",
    emoji: "🚗",
    day: 1,
    time: "9:00",
    category: "出発",
    short: "朝に行橋を出発",
    detail: "行橋駅周辺から出発。別府方面へ車で移動して、最初の目的地である鉄輪の地獄蒸し工房を目指す。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%8C%E6%A9%8B%E9%A7%85",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E8%A1%8C%E6%A9%8B",
    lat: 33.72877, lng: 130.97031, chip: "#e2e8f0", chipText: "#475569",
  },
  {
    id: "jigokuMushi",
    name: "地獄蒸し工房 鉄輪",
    emoji: "♨️",
    day: 1,
    time: "10:10",
    category: "昼食",
    short: "温泉蒸気で食事を楽しむ",
    detail: "鉄輪の名物である地獄蒸しを体験する最初の立ち寄り先。到着後に受付を済ませて、温泉蒸気を使った食事を楽しむ想定。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%9C%B0%E7%8D%84%E8%92%B8%E3%81%97%E5%B7%A5%E6%88%BF%E9%89%84%E8%BC%AA",
    photoUrl: "https://jigokumushi.com/",
    lat: 33.3158, lng: 131.4772, chip: "#fed7aa", chipText: "#9a3412",
  },
  {
    id: "umi",
    name: "海地獄",
    emoji: "🩵",
    day: 1,
    time: "12:00",
    category: "地獄めぐり",
    short: "コバルトブルーの定番スポット",
    detail: "別府地獄めぐりの代表格。鮮やかな青色の湯けむりを楽しめる定番スポットとして組み込まれている。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B5%B7%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/umi/",
    lat: 33.3149, lng: 131.4729, chip: "#bae6fd", chipText: "#0c4a6e",
  },
  {
    id: "kamado",
    name: "かまど地獄",
    emoji: "🔥",
    day: 1,
    time: "12:40",
    category: "地獄めぐり",
    short: "湯けむりと演出を楽しむ",
    detail: "複数の見どころがまとまった人気スポット。海地獄の近くにあるため、流れで立ち寄りやすい構成。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E3%81%8B%E3%81%BE%E3%81%A9%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    lat: 33.3163, lng: 131.4724, chip: "#fca5a5", chipText: "#7f1d1d",
  },
  {
    id: "oniishi",
    name: "鬼石坊主地獄",
    emoji: "🪨",
    day: 1,
    time: "13:20",
    category: "地獄めぐり",
    short: "泥湯の景観を見る",
    detail: "灰色の熱泥が沸き立つ独特の景観が特徴。近接エリアのため、徒歩でまとめて回る想定に向いている。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%AC%BC%E7%9F%B3%E5%9D%8A%E4%B8%BB%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    lat: 33.3153, lng: 131.4696, chip: "#d9f99d", chipText: "#365314",
  },
  {
    id: "chinoike",
    name: "血の池地獄",
    emoji: "🔴",
    day: 1,
    time: "14:10",
    category: "地獄めぐり",
    short: "赤い熱泥の名所",
    detail: "鉄分を含む赤い池が印象的な地獄。龍巻地獄とセットで訪れやすい終盤の観光ポイント。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%80%E3%81%AE%E6%B1%A0%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    lat: 33.3272, lng: 131.4782, chip: "#fecdd3", chipText: "#881337",
  },
  {
    id: "tatsumaki",
    name: "龍巻地獄",
    emoji: "🌪️",
    day: 1,
    time: "14:40",
    category: "地獄めぐり",
    short: "間欠泉を見学",
    detail: "一定間隔で噴き上がる間欠泉を見られるスポット。血の池地獄と並べて回ると移動効率がよい。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%BE%8D%E5%B7%BB%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    lat: 33.3269, lng: 131.4794, chip: "#c7d2fe", chipText: "#312e81",
  },
  {
    id: "suginoi",
    name: "杉乃井ホテル",
    emoji: "🏨",
    day: 1,
    time: "15:30",
    category: "宿泊",
    short: "チェックインして休憩",
    detail: "観光後の宿泊先。チェックイン後は温泉や館内施設でゆっくり過ごす流れを想定している。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%89%E4%B9%83%E4%BA%95%E3%83%9B%E3%83%86%E3%83%AB+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://suginoi.orixhotelsandresorts.com/",
    lat: 33.2833, lng: 131.4756, chip: "#a7f3d0", chipText: "#064e3b",
  },
  {
    id: "toyoken",
    name: "東洋軒",
    emoji: "🍗",
    day: 2,
    time: "11:30",
    category: "食事",
    short: "とり天で旅を締める",
    detail: "翌日の食事スポット。別府名物のとり天を食べて旅を締める構成になっている。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E6%B4%8B%E8%BB%92+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.toyoken-beppu.co.jp/toriten/",
    lat: 33.3042, lng: 131.5002, chip: "#fef08a", chipText: "#713f12",
  },
];

const kannawaArea = {
  id: "kannawa",
  name: "鉄輪エリア",
  short: "地獄蒸しと地獄めぐりの密集スポット",
  stopIds: ["jigokuMushi", "umi", "kamado", "oniishi"],
};

const chipPalette = [
  ["#e2e8f0", "#475569"],
  ["#fed7aa", "#9a3412"],
  ["#bae6fd", "#0c4a6e"],
  ["#fca5a5", "#7f1d1d"],
  ["#d9f99d", "#365314"],
  ["#fecdd3", "#881337"],
  ["#c7d2fe", "#312e81"],
  ["#a7f3d0", "#064e3b"],
  ["#fef08a", "#713f12"],
];

const categoryOptions = [
  { value: "出発", emoji: "🚗" },
  { value: "観光", emoji: "📍" },
  { value: "地獄めぐり", emoji: "♨️" },
  { value: "昼食", emoji: "🍽️" },
  { value: "食事", emoji: "🍗" },
  { value: "カフェ", emoji: "☕" },
  { value: "宿泊", emoji: "🏨" },
  { value: "買い物", emoji: "🛍️" },
  { value: "移動", emoji: "🚌" },
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
.hdr-live  { font-size: 10px; color: var(--accent); margin-top: 4px; font-weight: 700; }
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
.tabs-add {
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 700;
  padding: 0 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
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
  height: 320px;
  border: 1px solid var(--border);
  background: #dbeafe;
}
.map-canvas .leaflet-container {
  width: 100%;
  height: 100%;
}
.leaflet-popup-content-wrapper {
  border-radius: 14px;
  box-shadow: 0 12px 28px rgba(0,0,0,0.14);
}
.leaflet-popup-content {
  margin: 12px 14px;
  font-family: var(--font);
}
.leaflet-popup-tip {
  box-shadow: none;
}
.leaflet-control-attribution {
  font-family: var(--font);
  font-size: 10px;
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
.now-ring {
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 2px rgba(220,38,38,0.16);
}
.now-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  background: #dc2626;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.area-card {
  background: #fff8f4;
  border: 1px solid #ffd8cc;
  border-radius: 16px;
  padding: 12px 14px;
}
.area-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.area-title {
  font-size: 13px;
  font-weight: 700;
}
.area-sub {
  font-size: 11px;
  color: var(--text2);
  margin-top: 3px;
  font-weight: 500;
}
.area-badge {
  flex-shrink: 0;
  border-radius: 999px;
  background: #fff;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  padding: 5px 9px;
}
.area-list {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.area-list::-webkit-scrollbar {
  display: none;
}
.area-chip {
  min-width: 132px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 10px 11px;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.area-chip.sel {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.area-chip.now {
  border-color: #dc2626;
  box-shadow: inset 0 0 0 1px rgba(220,38,38,0.16);
}
.area-chip-top {
  display: flex;
  align-items: center;
  gap: 6px;
}
.area-chip-emoji {
  font-size: 16px;
}
.area-chip-time {
  font-size: 10px;
  color: var(--text2);
  font-weight: 700;
}
.area-chip-name {
  margin-top: 5px;
  font-size: 12px;
  font-weight: 700;
}
.area-chip-short {
  margin-top: 2px;
  font-size: 10px;
  color: var(--text2);
  font-weight: 500;
}

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
.li.now {
  border-color: #dc2626;
  box-shadow: inset 0 0 0 1px rgba(220,38,38,0.14);
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
.li-chip.now {
  background: #fee2e2 !important;
  color: #991b1b !important;
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
  grid-template-columns: 1fr 1fr 1fr;
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

.editor-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.32);
  backdrop-filter: blur(3px);
  z-index: 3000;
  display: flex;
  align-items: flex-end;
}
.editor {
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: 24px 24px 0 0;
  padding: 14px 16px 30px;
  max-height: 90svh;
  overflow-y: auto;
}
.editor-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.editor-title {
  font-size: 18px;
  font-weight: 700;
}
.editor-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 999px;
  background: var(--surface2);
  color: var(--text2);
  font-size: 14px;
}
.editor-grid {
  display: grid;
  gap: 10px;
}
.editor-row2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.editor-field {
  display: grid;
  gap: 6px;
}
.editor-field label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text2);
}
.editor-input,
.editor-textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  padding: 11px 12px;
  font-family: var(--font);
  font-size: 13px;
  color: var(--text);
}
.editor-textarea {
  min-height: 92px;
  resize: vertical;
}
.editor-note {
  font-size: 11px;
  color: var(--text2);
  line-height: 1.6;
}
.editor-inline {
  display: flex;
  gap: 8px;
}
.editor-inline .editor-input {
  flex: 1;
}
.editor-fetch {
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 700;
  padding: 0 12px;
}
.editor-fetch[disabled] {
  opacity: 0.5;
}
.editor-status {
  font-size: 11px;
  color: var(--text2);
}
.editor-results {
  display: grid;
  gap: 8px;
}
.editor-result {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: #fff;
  padding: 10px 11px;
  text-align: left;
  cursor: pointer;
}
.editor-result-name {
  font-size: 12px;
  font-weight: 700;
}
.editor-result-address {
  margin-top: 3px;
  font-size: 11px;
  color: var(--text2);
  line-height: 1.5;
}
.editor-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 14px;
}
.editor-btn {
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-family: var(--font);
  font-size: 13px;
  font-weight: 700;
}
.editor-btn.primary {
  background: var(--accent);
  color: #fff;
}
.editor-btn.secondary {
  background: var(--surface2);
  color: var(--text);
}
.editor-btn.danger {
  background: #fee2e2;
  color: #991b1b;
}
`;

export default function App() {
  const [tab, setTab] = useState("map");
  const [stopsData, setStopsData] = useState(() => initialStops);
  const [selId, setSelId] = useState("jigokuMushi");
  const [sheet, setSheet] = useState(false);
  const [editorMode, setEditorMode] = useState(null);
  const [draft, setDraft] = useState(() => createStopDraft());
  const [geoState, setGeoState] = useState({ loading: false, message: "" });
  const [searchResults, setSearchResults] = useState([]);
  const spotMap = useMemo(() => Object.fromEntries(stopsData.map(s => [s.id, s])), [stopsData]);
  const geocodeCache = React.useRef(new Map());
  const now = useNowClock();
  const currentStopId = useMemo(() => getCurrentStopId(now, stopsData), [now, stopsData]);
  const currentStop = currentStopId ? spotMap[currentStopId] : null;
  const sel = spotMap[selId] || stopsData[0];

  React.useEffect(() => {
    if (!stopsData.find((stop) => stop.id === selId) && stopsData[0]) {
      setSelId(stopsData[0].id);
    }
  }, [selId, stopsData]);

  function open(id) { setSelId(id); setSheet(true); }
  function openCreate() {
    setSheet(false);
    setDraft(createStopDraft());
    setEditorMode("create");
  }
  function openEdit(id) {
    const stop = spotMap[id];
    if (!stop) return;
    setDraft(createStopDraft(stop));
    setEditorMode("edit");
  }
  function closeEditor() {
    setEditorMode(null);
    setGeoState({ loading: false, message: "" });
    setSearchResults([]);
  }
  function handleDraftChange(key, value) {
    setDraft((prev) => {
      if (key === "category") {
        return { ...prev, category: value, emoji: getCategoryEmoji(value) };
      }
      if (key === "mapUrl") {
        const coords = extractCoordsFromGoogleMapsUrl(value);
        return {
          ...prev,
          mapUrl: value,
          lat: coords?.lat != null ? String(coords.lat) : prev.lat,
          lng: coords?.lng != null ? String(coords.lng) : prev.lng,
        };
      }
      return { ...prev, [key]: value };
    });
  }
  async function searchDraftPlace() {
    const nameQuery = draft.name.trim() || extractSearchTextFromMapUrl(draft.mapUrl);
    if (!nameQuery) {
      setGeoState({ loading: false, message: "場所名か住所を入力してください。" });
      return;
    }

    try {
      setGeoState({ loading: true, message: "候補を検索しています..." });
      const queries = buildSearchQueries(nameQuery);
      for (const query of queries) {
        if (geocodeCache.current.has(query)) {
          const cached = geocodeCache.current.get(query);
          setSearchResults(cached);
          setGeoState({ loading: false, message: `「${query}」の候補を表示しています。` });
          return;
        }
        const result = await geocodePlace(query, 5);
        if (result.length > 0) {
          geocodeCache.current.set(query, result);
          setSearchResults(result);
          setGeoState({ loading: false, message: `「${query}」の候補を表示しています。` });
          return;
        }
      }
      setSearchResults([]);
      setGeoState({ loading: false, message: "候補が見つかりませんでした。店名に市区町村まで含めてください。" });
    } catch (error) {
      setSearchResults([]);
      setGeoState({ loading: false, message: "座標の取得に失敗しました。" });
    }
  }
  function applySearchResult(result) {
    setDraft((prev) => ({
      ...prev,
      lat: String(result.lat),
      lng: String(result.lng),
      mapUrl: result.mapUrl || prev.mapUrl,
    }));
    setGeoState({ loading: false, message: "候補から座標を反映しました。" });
    setSearchResults([]);
  }
  function saveDraft() {
    const normalized = normalizeStopDraft(draft, editorMode === "edit" ? spotMap[draft.id] : null);
    setStopsData((prev) => {
      const next = editorMode === "edit"
        ? prev.map((stop) => (stop.id === normalized.id ? normalized : stop))
        : [...prev, normalized];
      return sortStops(next);
    });
    setSelId(normalized.id);
    setSheet(false);
    setEditorMode(null);
  }
  function deleteDraft() {
    if (editorMode !== "edit" || stopsData.length <= 1) return;
    setStopsData((prev) => prev.filter((stop) => stop.id !== draft.id));
    setSheet(false);
    setEditorMode(null);
  }

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="hdr">
          <div className="hdr-icon">♨️</div>
          <div>
            <div className="hdr-title">別府旅行プラン</div>
            <div className="hdr-sub">地獄めぐり＆杉乃井ホテル泊</div>
            <div className="hdr-live">
              {currentStop
                ? `今の想定位置: ${formatStopDay(currentStop)} ${currentStop.time} ${currentStop.name}`
                : "現在時刻は旅程外です"}
            </div>
          </div>
          <div className="hdr-pill">1泊2日</div>
        </div>

        <div className="tabs">
          <button className={`tab${tab === "map" ? " on" : ""}`} onClick={() => setTab("map")}>🗺 地図</button>
          <button className={`tab${tab === "list" ? " on" : ""}`} onClick={() => setTab("list")}>📋 予定</button>
          <button className="tabs-add" onClick={openCreate}>＋追加</button>
        </div>

        <div className="scroll">
          {tab === "map"
            ? <MapView stopsData={stopsData} spotMap={spotMap} selId={selId} currentStopId={currentStopId} onPick={setSelId} onOpen={open} sel={sel} />
            : <ListView stopsData={stopsData} selId={selId} currentStopId={currentStopId} onOpen={open} />
          }
        </div>
      </div>

      {sheet && <Sheet spot={sel} onClose={() => setSheet(false)} onEdit={() => openEdit(sel.id)} />}
      {editorMode && (
        <EditorSheet
          mode={editorMode}
          draft={draft}
          onChange={handleDraftChange}
          onClose={closeEditor}
          onSave={saveDraft}
          onDelete={deleteDraft}
          canDelete={stopsData.length > 1}
          onSearchPlace={searchDraftPlace}
          onApplySearchResult={applySearchResult}
          geoState={geoState}
          searchResults={searchResults}
        />
      )}
    </>
  );
}

function MapView({ stopsData, spotMap, selId, currentStopId, onPick, onOpen, sel }) {
  const route = useMemo(() => stopsData.map(s => s.id), [stopsData]);
  const positions = useMemo(() => route.map(id => [spotMap[id].lat, spotMap[id].lng]), [route, spotMap]);
  const kannawaStops = kannawaArea.stopIds.map(id => spotMap[id]).filter(Boolean);
  const kannawaIds = kannawaStops.map((stop) => stop.id);
  const kannawaCenter = useMemo(() => getCenterFromStops(kannawaStops), [kannawaStops]);
  const inKannawaArea = kannawaIds.includes(selId);
  const mapMarkerIds = route.filter(id => !kannawaIds.includes(id) || id === selId);
  const currentInKannawaArea = currentStopId ? kannawaIds.includes(currentStopId) : false;

  return (
    <div className="map-wrap">
      <div className="map-canvas">
        <MapContainer center={[sel.lat, sel.lng]} zoom={11} scrollWheelZoom className="leaflet-shell">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline
            positions={positions}
            pathOptions={{ color: "#e85c3a", weight: 4, opacity: 0.7, dashArray: "7 8" }}
          />
          {mapMarkerIds.map((id, i) => {
            const s = spotMap[id];
            return (
              <Marker
                key={id}
                position={[s.lat, s.lng]}
                icon={createMapIcon(s, selId === id, currentStopId === id, route.indexOf(id) + 1)}
                eventHandlers={{
                  click: () => onPick(id),
                  dblclick: () => onOpen(id),
                }}
              >
                <Popup>
                  <div style={{ minWidth: 170 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#78716c", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {s.time} · {s.category}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{s.name}</div>
                    <div style={{ marginTop: 3, fontSize: 12, color: "#78716c", fontWeight: 500 }}>{s.short}</div>
                    <button
                      type="button"
                      onClick={() => onOpen(id)}
                      style={{
                        marginTop: 10,
                        border: "none",
                        borderRadius: 999,
                        background: "#e85c3a",
                        color: "#fff",
                        padding: "7px 11px",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font)",
                      }}
                    >
                      詳細を見る
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {!inKannawaArea && kannawaStops.length > 0 ? (
            <Marker
              position={[kannawaCenter.lat, kannawaCenter.lng]}
              icon={createAreaIcon(kannawaStops.length, currentInKannawaArea)}
              eventHandlers={{
                click: () => onPick(kannawaStops[0].id),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#78716c", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    エリア表示
                  </div>
                  <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{kannawaArea.name}</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: "#78716c", fontWeight: 500 }}>{kannawaArea.short}</div>
                </div>
              </Popup>
            </Marker>
          ) : null}
          <MapSelectionSync spot={sel} positions={positions} inKannawaArea={inKannawaArea} />
        </MapContainer>
      </div>

      <div className="sel-card">
        <div className={`sel-icon${currentStopId === selId ? " now-ring" : ""}`} style={{ background: sel.chip + "55" }}>{sel.emoji}</div>
        <div style={{ minWidth: 0 }}>
          <div className="sel-name">{sel.name}</div>
          <div className="sel-short">{sel.short}</div>
        </div>
        {currentStopId === selId ? <div className="now-badge">NOW</div> : null}
        <button className="sel-open" onClick={() => onOpen(selId)}>詳細</button>
      </div>

      <div className="area-card">
        <div className="area-top">
          <div>
            <div className="area-title">鉄輪エリアの見どころ</div>
            <div className="area-sub">近いスポットは地図ではまとめて、ここから選択します。</div>
          </div>
          <div className="area-badge">{kannawaStops.length} 件</div>
        </div>
        <div className="area-list">
          {kannawaStops.map((spot) => (
            <button
              key={spot.id}
              className={`area-chip${selId === spot.id ? " sel" : ""}${currentStopId === spot.id ? " now" : ""}`}
              onClick={() => onPick(spot.id)}
            >
              <div className="area-chip-top">
                <span className="area-chip-emoji">{spot.emoji}</span>
                <span className="area-chip-time">{spot.time}</span>
              </div>
              <div className="area-chip-name">{spot.name}</div>
              <div className="area-chip-short">{spot.short}</div>
              {currentStopId === spot.id ? <div style={{ marginTop: 6 }}><span className="now-badge">NOW</span></div> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="info-grid">
        {[
          ["⏰ 時刻", `${formatStopDay(sel)} ${sel.time}`],
          ["🏷 カテゴリ", sel.category],
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

function ListView({ stopsData, selId, currentStopId, onOpen }) {
  return (
    <div className="list-wrap">
      {stopsData.map((s, i) => (
        <button key={s.id} className={`li${selId === s.id ? " sel" : ""}${currentStopId === s.id ? " now" : ""}`} onClick={() => onOpen(s.id)}>
          <div className="li-icon" style={{ background: s.chip + "66" }}>{s.emoji}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="li-row">
              <span className="li-time">{formatStopDay(s)} {s.time}</span>
              <span className={`li-chip${currentStopId === s.id ? " now" : ""}`} style={{ background: s.chip, color: s.chipText }}>{s.category}</span>
              {currentStopId === s.id ? <span className="now-badge">NOW</span> : null}
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

function Sheet({ spot, onClose, onEdit }) {
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
          <button className="btn-a secondary" onClick={onEdit}>✏️ 編集</button>
          <a href={spot.photoUrl} target="_blank" rel="noreferrer" className="btn-a secondary">🔗 リンク</a>
        </div>
      </div>
    </div>
  );
}

function EditorSheet({ mode, draft, onChange, onClose, onSave, onDelete, canDelete, onSearchPlace, onApplySearchResult, geoState, searchResults }) {
  return (
    <div className="editor-backdrop" onClick={onClose}>
      <div className="editor" onClick={(e) => e.stopPropagation()}>
        <div className="editor-head">
          <div className="editor-title">{mode === "edit" ? "行き先を編集" : "行き先を追加"}</div>
          <button className="editor-close" onClick={onClose}>✕</button>
        </div>

        <div className="editor-grid">
          <div className="editor-row2">
            <div className="editor-field">
              <label>名前</label>
              <div className="editor-inline">
                <input className="editor-input" value={draft.name} onChange={(e) => onChange("name", e.target.value)} />
                <button className="editor-fetch" onClick={onSearchPlace} disabled={geoState.loading}>
                  {geoState.loading ? "検索中" : "場所検索"}
                </button>
              </div>
            </div>
            <div className="editor-field">
              <label>絵文字</label>
              <input className="editor-input" value={draft.emoji} readOnly />
            </div>
          </div>

          <div className="editor-row2">
            <div className="editor-field">
              <label>日数</label>
              <input className="editor-input" type="number" min="1" value={draft.day} onChange={(e) => onChange("day", e.target.value)} />
            </div>
            <div className="editor-field">
              <label>時刻</label>
              <input className="editor-input" placeholder="10:30" value={draft.time} onChange={(e) => onChange("time", e.target.value)} />
            </div>
          </div>

          <div className="editor-row2">
            <div className="editor-field">
              <label>カテゴリ</label>
              <select className="editor-input" value={draft.category} onChange={(e) => onChange("category", e.target.value)}>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.value}</option>
                ))}
              </select>
            </div>
            <div className="editor-field">
              <label>一言説明</label>
              <input className="editor-input" value={draft.short} onChange={(e) => onChange("short", e.target.value)} />
            </div>
          </div>

          <div className="editor-field">
            <label>詳細</label>
            <textarea className="editor-textarea" value={draft.detail} onChange={(e) => onChange("detail", e.target.value)} />
          </div>

          <div className="editor-row2">
            <div className="editor-field">
              <label>緯度</label>
              <input className="editor-input" placeholder="33.3158" value={draft.lat} onChange={(e) => onChange("lat", e.target.value)} />
            </div>
            <div className="editor-field">
              <label>経度</label>
              <input className="editor-input" placeholder="131.4772" value={draft.lng} onChange={(e) => onChange("lng", e.target.value)} />
            </div>
          </div>

          <div className="editor-field">
            <label>Google Maps URL</label>
            <input className="editor-input" value={draft.mapUrl} onChange={(e) => onChange("mapUrl", e.target.value)} />
          </div>
          <div className="editor-field">
            <label>写真・参考URL</label>
            <input className="editor-input" value={draft.photoUrl} onChange={(e) => onChange("photoUrl", e.target.value)} />
          </div>
          <div className="editor-status">{geoState.message}</div>
          {searchResults.length > 0 ? (
            <div className="editor-results">
              {searchResults.map((result) => (
                <button key={`${result.lat}-${result.lng}-${result.displayName}`} className="editor-result" onClick={() => onApplySearchResult(result)}>
                  <div className="editor-result-name">{result.displayName}</div>
                  <div className="editor-result-address">{result.address}</div>
                </button>
              ))}
            </div>
          ) : null}
          <div className="editor-note">まず名前や住所で検索して候補から選ぶ運用にします。Google Maps URL は補助用です。時刻は `HH:MM`、日数は `1` か `2` のように入れてください。</div>
        </div>

        <div className="editor-actions">
          <button className="editor-btn secondary" onClick={onClose}>キャンセル</button>
          <button className="editor-btn primary" onClick={onSave}>保存</button>
          {mode === "edit" ? <button className="editor-btn danger" onClick={onDelete} disabled={!canDelete}>{canDelete ? "削除" : "残り1件"}</button> : <div />}
        </div>
      </div>
    </div>
  );
}

function MapSelectionSync({ spot, positions, inKannawaArea }) {
  const map = useMap();

  React.useEffect(() => {
    map.fitBounds(positions, { padding: [30, 30] });
  }, [map, positions]);

  React.useEffect(() => {
    const zoom = inKannawaArea ? 14 : map.getZoom() < 11 ? 11 : map.getZoom();
    map.flyTo([spot.lat, spot.lng], zoom, {
      animate: true,
      duration: 0.8,
    });
  }, [inKannawaArea, map, spot]);

  return null;
}

function createMapIcon(spot, active, isCurrent, order) {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px;transform:${active ? "scale(1.08)" : "scale(1)"};transition:transform 140ms ease;">
        <div style="width:${active ? 44 : 38}px;height:${active ? 44 : 38}px;border-radius:9999px;background:#ffffff;border:${isCurrent ? 3 : active ? 2.5 : 1.5}px solid ${isCurrent ? "#dc2626" : active ? "#e85c3a" : "rgba(0,0,0,0.12)"};display:flex;align-items:center;justify-content:center;font-size:${active ? 21 : 18}px;box-shadow:${isCurrent ? "0 0 0 4px rgba(220,38,38,0.14)," : ""} 0 4px 12px rgba(0,0,0,0.14);">
          ${spot.emoji}
        </div>
        <div style="font-size:9px;font-weight:700;color:${isCurrent ? "#991b1b" : "#57534e"};background:${isCurrent ? "rgba(254,226,226,0.98)" : "rgba(255,255,255,0.96)"};border-radius:9999px;padding:1px 6px;line-height:1.5;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          ${isCurrent ? "NOW" : order}
        </div>
      </div>
    `,
    iconSize: [56, 62],
    iconAnchor: [28, 48],
    popupAnchor: [0, -42],
  });
}

function createAreaIcon(count, isCurrent) {
  return L.divIcon({
    className: "",
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
        <div style="min-width:54px;height:54px;border-radius:9999px;background:${isCurrent ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#1c1917,#57534e)"};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;box-shadow:0 8px 18px rgba(0,0,0,0.18);border:4px solid rgba(255,255,255,0.95);padding:0 12px;">
          ${isCurrent ? "NOW" : `${count}件`}
        </div>
        <div style="font-size:10px;font-weight:700;color:${isCurrent ? "#991b1b" : "#57534e"};background:${isCurrent ? "rgba(254,226,226,0.98)" : "rgba(255,255,255,0.96)"};border-radius:9999px;padding:2px 8px;line-height:1.4;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          鉄輪
        </div>
      </div>
    `,
    iconSize: [66, 74],
    iconAnchor: [33, 50],
    popupAnchor: [0, -44],
  });
}

function useNowClock() {
  const [now, setNow] = useState(() => new Date());

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => window.clearInterval(id);
  }, []);

  return now;
}

function getCurrentStopId(now, stopsData) {
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const schedule = stopsData.map((stop, index) => {
    const [hour, minute] = stop.time.split(":").map(Number);
    const start = new Date(todayStart);
    start.setDate(todayStart.getDate() + (stop.day - 1));
    start.setHours(hour, minute, 0, 0);

    const nextStop = stopsData[index + 1];
    const end = nextStop ? createStopDate(todayStart, nextStop) : new Date(start.getTime() + 3 * 60 * 60 * 1000);

    return {
      id: stop.id,
      start,
      end,
    };
  });

  const current = schedule.find((slot) => now >= slot.start && now < slot.end);
  return current ? current.id : null;
}

function createStopDate(baseDate, stop) {
  const [hour, minute] = stop.time.split(":").map(Number);
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + (stop.day - 1));
  date.setHours(hour, minute, 0, 0);
  return date;
}

function formatStopDay(stop) {
  return `DAY ${stop.day}`;
}

function getCenterFromStops(stopsData) {
  if (stopsData.length === 0) {
    return { lat: 33.3156, lng: 131.473 };
  }

  const sum = stopsData.reduce(
    (acc, stop) => ({
      lat: acc.lat + stop.lat,
      lng: acc.lng + stop.lng,
    }),
    { lat: 0, lng: 0 },
  );

  return {
    lat: sum.lat / stopsData.length,
    lng: sum.lng / stopsData.length,
  };
}

function createStopDraft(base) {
  const category = base?.category || "観光";
  return {
    id: base?.id || "",
    name: base?.name || "",
    emoji: base?.emoji || getCategoryEmoji(category),
    day: String(base?.day || 1),
    time: base?.time || "10:00",
    category,
    short: base?.short || "",
    detail: base?.detail || "",
    mapUrl: base?.mapUrl || "",
    photoUrl: base?.photoUrl || "",
    lat: base?.lat != null ? String(base.lat) : "",
    lng: base?.lng != null ? String(base.lng) : "",
  };
}

function normalizeStopDraft(draft, existingStop) {
  const lat = Number.parseFloat(draft.lat);
  const lng = Number.parseFloat(draft.lng);
  const safeName = draft.name.trim() || "新しい行き先";
  const id = existingStop?.id || createStopId(safeName);
  const [chip, chipText] = existingStop ? [existingStop.chip, existingStop.chipText] : pickChipPair(id);

  return {
    id,
    name: safeName,
    emoji: getCategoryEmoji(draft.category),
    day: Math.max(1, Number.parseInt(draft.day, 10) || 1),
    time: isValidTime(draft.time) ? draft.time : "10:00",
    category: draft.category.trim() || "観光",
    short: draft.short.trim() || safeName,
    detail: draft.detail.trim() || "詳細未設定",
    mapUrl: draft.mapUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeName)}`,
    photoUrl: draft.photoUrl.trim() || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(safeName)}`,
    lat: Number.isFinite(lat) ? lat : 33.3158,
    lng: Number.isFinite(lng) ? lng : 131.4772,
    chip,
    chipText,
  };
}

function sortStops(stopsData) {
  return [...stopsData].sort((a, b) => {
    const dayDiff = a.day - b.day;
    if (dayDiff !== 0) return dayDiff;
    return timeToMinutes(a.time) - timeToMinutes(b.time);
  });
}

function createStopId(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "stop"}-${Math.random().toString(36).slice(2, 7)}`;
}

function pickChipPair(seed) {
  const code = seed.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return chipPalette[code % chipPalette.length];
}

function isValidTime(value) {
  return /^\d{1,2}:\d{2}$/.test(value);
}

function timeToMinutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function getCategoryEmoji(category) {
  return categoryOptions.find((option) => option.value === category)?.emoji || "📍";
}

function extractCoordsFromGoogleMapsUrl(value) {
  if (!value) return null;

  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&]query=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) {
      return {
        lat: Number.parseFloat(match[1]),
        lng: Number.parseFloat(match[2]),
      };
    }
  }

  return null;
}

function extractSearchTextFromMapUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    const query = url.searchParams.get("query") || url.searchParams.get("q");
    if (query) return query;

    const placeMatch = url.pathname.match(/\/place\/([^/]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1]).replace(/\+/g, " ");
    }
  } catch (_error) {
    return "";
  }

  return "";
}

function buildSearchQueries(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const queries = [trimmed];
  if (!/[都道府県市区町村]/.test(trimmed)) {
    queries.push(`${trimmed} 日本`);
  }
  return [...new Set(queries)];
}

async function geocodePlace(query, limit = 5) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=${limit}&countrycodes=jp&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const result = await response.json();
  return result.map((item) => ({
    lat: Number.parseFloat(item.lat),
    lng: Number.parseFloat(item.lon),
    displayName: item.name || item.display_name,
    address: item.display_name,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.lat},${item.lon}`)}`,
  }));
}
