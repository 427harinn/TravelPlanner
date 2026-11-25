import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import {
  deleteTravelPlan,
  firebaseEnabled,
  resetPassword,
  savePlan,
  savePlans,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthState,
  subscribeToPlans,
  subscribeToPublicPlanByShareId,
} from "./src/firebase.js";
import { registerTravelPlannerTools } from "./src/webmcp.js";

const beppuStops = [
  {
    id: "choco-dropoff",
    name: "自宅を出発",
    emoji: "🐶",
    day: 1,
    time: "09:30",
    category: "出発",
    short: "自宅を出発",
    detail: "1日目の最初の予定。自宅を出発して別府方面へ向かう。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%8C%E6%A9%8B",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E8%A1%8C%E6%A9%8B",
    lat: 33.72877, lng: 130.97031, chip: "#e2e8f0", chipText: "#475569",
  },
  {
    id: "yukuhashi-start",
    name: "出発地を出発",
    emoji: "🚗",
    day: 1,
    time: "10:00",
    category: "移動",
    short: "別府へ向けて出発",
    detail: "出発時刻。ここから別府・鉄輪エリアへ向かう。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%8C%E6%A9%8B",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E8%A1%8C%E6%A9%8B",
    lat: 33.72877, lng: 130.97031, chip: "#fed7aa", chipText: "#9a3412",
  },
  {
    id: "kannawa-arrival",
    name: "別府・鉄輪エリア到着",
    emoji: "📍",
    day: 1,
    time: "11:20",
    category: "観光",
    short: "11:10〜11:30ごろ到着 / 11:20ごろ合流予定",
    detail: "別府・鉄輪エリアに到着。11:20ごろに合流する想定で、その後は地獄蒸し工房へ向かう。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E9%89%84%E8%BC%AA+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E9%89%84%E8%BC%AA+%E5%88%A5%E5%BA%9C",
    lat: 33.3158, lng: 131.4772, chip: "#fca5a5", chipText: "#7f1d1d",
  },
  {
    id: "jigoku-mushi-reception",
    name: "地獄蒸し工房鉄輪で受付",
    emoji: "♨️",
    day: 1,
    time: "11:20",
    category: "昼食",
    short: "待ち時間が長ければ近くの地獄を先に回る",
    detail: "地獄蒸し工房鉄輪で受付。待ち時間が長ければ近くの地獄を先に回る運用。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%9C%B0%E7%8D%84%E8%92%B8%E3%81%97%E5%B7%A5%E6%88%BF%E9%89%84%E8%BC%AA",
    photoUrl: "https://jigokumushi.com/",
    lat: 33.3158, lng: 131.4772, chip: "#d9f99d", chipText: "#365314",
  },
  {
    id: "lunch-or-first-half",
    name: "地獄蒸しランチ or 地獄めぐり前半",
    emoji: "🍽️",
    day: 1,
    time: "12:00",
    category: "昼食",
    short: "11:20〜13:10ごろ / 当日の混雑で前後",
    detail: "地獄蒸しランチを楽しむか、当日の混雑次第で地獄めぐり前半を先に回る。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%9C%B0%E7%8D%84%E8%92%B8%E3%81%97%E5%B7%A5%E6%88%BF%E9%89%84%E8%BC%AA",
    photoUrl: "https://jigokumushi.com/",
    lat: 33.3158, lng: 131.4772, chip: "#fecdd3", chipText: "#881337",
  },
  {
    id: "jigoku-second-half",
    name: "地獄めぐり後半",
    emoji: "🩵",
    day: 1,
    time: "13:20",
    category: "地獄めぐり",
    short: "地獄めぐり後半戦 / 13:20〜15:00ごろ",
    detail: "13:20〜15:00ごろの後半戦。海地獄、かまど地獄、鬼石坊主地獄、血の池地獄、龍巻地獄を回る想定。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%B5%B7%E5%9C%B0%E7%8D%84+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.beppu-jigoku.com/",
    lat: 33.3149, lng: 131.4729, chip: "#c7d2fe", chipText: "#312e81",
  },
  {
    id: "suginoi-arrival",
    name: "杉乃井ホテル 到着",
    emoji: "🏨",
    day: 1,
    time: "15:30",
    category: "宿泊",
    short: "15:30〜16:00ごろに到着",
    detail: "1日目の最後は杉乃井ホテルへ到着。チェックインしてゆっくり過ごす。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%89%E4%B9%83%E4%BA%95%E3%83%9B%E3%83%86%E3%83%AB+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://suginoi.orixhotelsandresorts.com/",
    lat: 33.2833, lng: 131.4756, chip: "#a7f3d0", chipText: "#064e3b",
  },
  {
    id: "hotel-morning",
    name: "杉乃井ホテルでゆっくり",
    emoji: "🌅",
    day: 2,
    time: "08:00",
    category: "宿泊",
    short: "朝風呂 / 朝食 / 部屋でのんびり",
    detail: "2日目の朝は杉乃井ホテルでゆっくり。朝風呂、朝食、部屋時間を楽しむ。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%89%E4%B9%83%E4%BA%95%E3%83%9B%E3%83%86%E3%83%AB+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://suginoi.orixhotelsandresorts.com/",
    lat: 33.2833, lng: 131.4756, chip: "#fef08a", chipText: "#713f12",
  },
  {
    id: "hotel-stay-late",
    name: "ホテルでダラダラ",
    emoji: "🧖",
    day: 2,
    time: "10:00",
    category: "宿泊",
    short: "ホテル時間をしっかり楽しむ",
    detail: "チェックアウトぎりぎりまでホテル時間をしっかり楽しむ予定。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%89%E4%B9%83%E4%BA%95%E3%83%9B%E3%83%86%E3%83%AB+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://suginoi.orixhotelsandresorts.com/",
    lat: 33.2833, lng: 131.4756, chip: "#ddd6fe", chipText: "#5b21b6",
  },
  {
    id: "toyoken-lunch",
    name: "東洋軒で とり天ランチ",
    emoji: "🍗",
    day: 2,
    time: "11:30",
    category: "食事",
    short: "11:30ごろ〜 とり天ランチ",
    detail: "2日目の昼は東洋軒でとり天ランチ。別府名物を楽しむ。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E6%B4%8B%E8%BB%92+%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.toyoken-beppu.co.jp/toriten/",
    lat: 33.3042, lng: 131.5002, chip: "#fef08a", chipText: "#713f12",
  },
  {
    id: "leave-beppu",
    name: "別府を出発 → 行橋へ",
    emoji: "🚗",
    day: 2,
    time: "13:30",
    category: "移動",
    short: "昼すぎ〜午後に帰路へ",
    detail: "昼すぎ〜午後に別府を出発して行橋へ向かう。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%88%A5%E5%BA%9C",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E5%88%A5%E5%BA%9C",
    lat: 33.2795, lng: 131.4979, chip: "#fdba74", chipText: "#9a3412",
  },
  {
    id: "choco-pickup",
    name: "帰宅",
    emoji: "🐶",
    day: 2,
    time: "16:30",
    category: "出発",
    short: "帰路の最後に帰宅",
    detail: "帰宅前の最後の予定。そのまま帰宅する。",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E8%A1%8C%E6%A9%8B",
    photoUrl: "https://www.google.com/search?tbm=isch&q=%E8%A1%8C%E6%A9%8B",
    lat: 33.72877, lng: 130.97031, chip: "#fecaca", chipText: "#991b1b",
  },
];


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

const cleanCategoryOptions = [
  { value: "出発", emoji: "🚉" },
  { value: "観光", emoji: "🌋" },
  { value: "地獄めぐり", emoji: "♨️" },
  { value: "昼食", emoji: "🍽️" },
  { value: "食事", emoji: "🍴" },
  { value: "カフェ", emoji: "☕" },
  { value: "宿泊", emoji: "🛏️" },
  { value: "休憩", emoji: "🫖" },
  { value: "移動", emoji: "🚗" },
];

const categoryAliases = {
  出発: "出発",
  "蜃ｺ逋ｺ": "出発",
  "陷・ｽｺ騾具ｽｺ": "出発",
  観光: "観光",
  "隕ｳ蜈・": "観光",
  地獄めぐり: "地獄めぐり",
  "蝨ｰ迯・ａ縺舌ｊ": "地獄めぐり",
  昼食: "昼食",
  "譏ｼ鬟・": "昼食",
  食事: "食事",
  "鬟滉ｺ・": "食事",
  カフェ: "カフェ",
  "繧ｫ繝輔ぉ": "カフェ",
  宿泊: "宿泊",
  "螳ｿ豕・": "宿泊",
  休憩: "休憩",
  "雋ｷ縺・黄": "休憩",
  移動: "移動",
  "遘ｻ蜍・": "移動",
};

const stableCategoryOptions = [
  { value: "\u51fa\u767a", emoji: "\ud83d\ude89" },
  { value: "\u89b3\u5149", emoji: "\ud83c\udf0b" },
  { value: "\u5730\u7344\u3081\u3050\u308a", emoji: "\u2668\ufe0f" },
  { value: "\u663c\u98df", emoji: "\ud83c\udf7d\ufe0f" },
  { value: "\u98df\u4e8b", emoji: "\ud83c\udf74" },
  { value: "\u30ab\u30d5\u30a7", emoji: "\u2615" },
  { value: "\u5bbf\u6cca", emoji: "\ud83d\udecf\ufe0f" },
  { value: "\u4f11\u61a9", emoji: "\ud83e\uded6" },
  { value: "\u79fb\u52d5", emoji: "\ud83d\ude97" },
];

const stableCategoryAliases = {
  "\u51fa\u767a": "\u51fa\u767a",
  "蜃ｺ逋ｺ": "\u51fa\u767a",
  "陷・ｽｺ騾具ｽｺ": "\u51fa\u767a",
  "\u89b3\u5149": "\u89b3\u5149",
  "隕ｳ蜈・": "\u89b3\u5149",
  "\u5730\u7344\u3081\u3050\u308a": "\u5730\u7344\u3081\u3050\u308a",
  "蝨ｰ迯・ａ縺舌ｊ": "\u5730\u7344\u3081\u3050\u308a",
  "\u663c\u98df": "\u663c\u98df",
  "譏ｼ鬟・": "\u663c\u98df",
  "\u98df\u4e8b": "\u98df\u4e8b",
  "鬟滉ｺ・": "\u98df\u4e8b",
  "\u30ab\u30d5\u30a7": "\u30ab\u30d5\u30a7",
  "繧ｫ繝輔ぉ": "\u30ab\u30d5\u30a7",
  "\u5bbf\u6cca": "\u5bbf\u6cca",
  "螳ｿ豕・": "\u5bbf\u6cca",
  "\u4f11\u61a9": "\u4f11\u61a9",
  "雋ｷ縺・黄": "\u4f11\u61a9",
  "莨第・": "\u4f11\u61a9",
  "\u79fb\u52d5": "\u79fb\u52d5",
  "遘ｻ蜍・": "\u79fb\u52d5",
};

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
  background: var(--accent);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.hdr-side {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}
.hdr-settings {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 12px;
  background: var(--surface2);
  color: var(--text2);
  font-size: 16px;
}

/* scroll */
.scroll {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── MAP ── */
.map-wrap {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
  min-height: 0;
}

.map-fit-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 700;
  font-family: var(--font);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
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
  z-index: 0;
}
.map-canvas .leaflet-pane,
.map-canvas .leaflet-top,
.map-canvas .leaflet-bottom,
.map-canvas .leaflet-control,
.map-canvas .leaflet-popup-pane {
  z-index: 0 !important;
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
.sel-name,
.sel-short {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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

.schedule-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.schedule-action {
  border: none;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 11px 12px;
  font-family: var(--font);
  font-size: 12px;
  font-weight: 700;
}
.schedule-action.primary {
  background: var(--accent);
  color: #fff;
}

.schedule-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.schedule-head {
  padding: 11px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.schedule-list-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
.schedule-toggle {
  width: 100%;
  border: none;
  background: transparent;
  padding: 13px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  font-family: var(--font);
}
.schedule-toggle-title {
  font-size: 14px;
  font-weight: 700;
}
.schedule-toggle-sub {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text2);
  font-weight: 500;
}
.schedule-toggle-mark {
  font-size: 18px;
  color: var(--text2);
}
.schedule-body {
  border-top: 1px solid var(--border);
  padding: 8px;
  display: grid;
  gap: 7px;
}

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
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
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
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}
.li-time { font-size: 11px; color: var(--text2); font-weight: 700; }
.li-chip {
  font-size: 9px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}
.li-chip.now {
  background: #fee2e2 !important;
  color: #991b1b !important;
}
.li-name {
  font-size: 14px;
  font-weight: 700;
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.li-short {
  font-size: 11px;
  color: var(--text2);
  margin-top: 1px;
  font-weight: 500;
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.li-main {
  min-width: 0;
  flex: 1;
  overflow: hidden;
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
  z-index: 4000;
  display: flex;
  align-items: flex-end;
  animation: bdfade 0.18s ease;
  touch-action: none;
  overscroll-behavior: none;
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
  touch-action: pan-y;
  overscroll-behavior: contain;
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
  touch-action: none;
  overscroll-behavior: none;
}
.settings-backdrop {
  align-items: center;
  justify-content: center;
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
  touch-action: pan-y;
  overscroll-behavior: contain;
}
.overlay-panel {
  width: min(560px, calc(100vw - 32px));
  max-height: min(82vh, 760px);
  margin: 0;
  border-radius: 24px;
  padding: 18px 18px 22px;
  box-shadow: 0 24px 80px rgba(28,25,23,0.2);
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
.editor-group-lbl {
  font-size: 11px;
  font-weight: 700;
  color: var(--text2);
  letter-spacing: 0.08em;
  margin-top: 6px;
}
.editor-details {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 10px 12px;
}
.editor-details summary {
  font-size: 12px;
  font-weight: 700;
  color: var(--text2);
  cursor: pointer;
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
.settings-list {
  display: grid;
  gap: 8px;
}
.settings-item {
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 12px;
  text-align: left;
}
.settings-item.on {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.settings-item-name {
  font-size: 14px;
  font-weight: 700;
}
.settings-item-sub {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text2);
  font-weight: 500;
}
.auth-screen {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(circle at top, rgba(232,92,58,0.16), transparent 36%),
    linear-gradient(180deg, #fcfaf7 0%, #f3efe8 100%);
}
.auth-card {
  width: min(100%, 420px);
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(231,229,223,0.9);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 24px 60px rgba(28,25,23,0.12);
  backdrop-filter: blur(12px);
}
.auth-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}
.auth-title {
  margin-top: 16px;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}
.auth-copy {
  margin-top: 10px;
  color: var(--text2);
  font-size: 13px;
  line-height: 1.7;
}
.auth-form {
  margin-top: 22px;
  display: grid;
  gap: 12px;
}
.auth-field {
  display: grid;
  gap: 6px;
}
.auth-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text2);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.auth-input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  color: var(--text);
  padding: 13px 14px;
  font: inherit;
}
.auth-input:focus {
  outline: 2px solid rgba(232,92,58,0.18);
  border-color: rgba(232,92,58,0.45);
}
.auth-submit,
.auth-google,
.auth-toggle {
  width: 100%;
  border: none;
  border-radius: 14px;
  font: inherit;
  cursor: pointer;
}
.auth-submit,
.auth-google {
  padding: 13px 14px;
  font-weight: 700;
}
.auth-submit {
  background: var(--accent);
  color: #fff;
}
.auth-google {
  background: #fff;
  color: var(--text);
  border: 1px solid var(--border);
}
.auth-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 2px 0;
  color: var(--text2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}
.auth-toggle {
  background: transparent;
  color: var(--accent);
  padding: 4px 0 0;
  text-align: left;
  font-weight: 700;
}
.auth-error {
  min-height: 18px;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 600;
}
.auth-note {
  margin-top: 18px;
  color: var(--text2);
  font-size: 11px;
  line-height: 1.6;
  display: none;
}
.settings-account {
  display: grid;
  gap: 8px;
}
.settings-account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
}
.settings-account-main {
  min-width: 0;
}
.settings-account-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.settings-account-sub {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text2);
  font-weight: 500;
}
`;

function EditorApp() {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selId, setSelId] = useState("jigokuMushi");
  const [sheet, setSheet] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editorMode, setEditorMode] = useState(null);
  const [draft, setDraft] = useState(() => createStopDraftFixed());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [pendingCreatePlanId, setPendingCreatePlanId] = useState(null);
  const [planDraft, setPlanDraft] = useState(() => createPlanDraft());
  const [geoState, setGeoState] = useState({ loading: false, message: "" });
  const [searchResults, setSearchResults] = useState([]);
  const [authUser, setAuthUser] = useState(null);
  const [authReady, setAuthReady] = useState(!firebaseEnabled);
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState("");
  const [firebaseStatus, setFirebaseStatus] = useState(() => ({
    loading: firebaseEnabled,
    error: "",
  }));
  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) || plans[0];
  const stopsData = selectedPlan?.stops || [];
  const spotMap = useMemo(() => Object.fromEntries(stopsData.map(s => [s.id, s])), [stopsData]);
  useBodyScrollLock(Boolean(sheet || editorMode || settingsOpen || planEditorOpen));
  const geocodeCache = React.useRef(new Map());
  const plansRef = React.useRef(plans);
  const authUserRef = React.useRef(authUser);
  React.useEffect(() => { plansRef.current = plans; }, [plans]);
  React.useEffect(() => { authUserRef.current = authUser; }, [authUser]);

  React.useEffect(() => {
    registerTravelPlannerTools({
      getPlans: () => plansRef.current,
      isLoggedIn: () => Boolean(authUserRef.current),
      createPlan: async ({ name, description, startDate, endDate, icon }) => {
        const normalizedPlan = {
          ...normalizePlanDraft({
            icon: (icon || "🧳"),
            name: name || "",
            description: description || "",
            startDate: startDate || "",
            endDate: endDate || "",
          }),
          ownerEmail: (authUserRef.current?.email || "").toLowerCase(),
          editorEmails: [],
        };
        setPlans((prev) => [...prev, normalizedPlan]);
        setSelectedPlanId(normalizedPlan.id);
        setPendingCreatePlanId(normalizedPlan.id);
        return normalizedPlan;
      },
      addStop: async (planId, args) => {
        const plan = plansRef.current.find((item) => item.id === planId);
        if (!plan) return null;
        let lat = "";
        let lng = "";
        try {
          const results = await geocodePlace(args.placeQuery || args.name, 1);
          if (results && results[0]) {
            lat = String(results[0].lat);
            lng = String(results[0].lng);
          }
        } catch (error) {
          // 座標が取れなくても座標なしで登録する
        }
        const draft = {
          ...createStopDraftFixed(),
          name: args.name || "",
          day: String(args.day || 1),
          time: args.time || "10:00",
          category: args.category || "観光",
          short: args.short || "",
          detail: args.detail || "",
          lat,
          lng,
        };
        const normalized = normalizeStopDraftFixed(draft);
        setPlans((prev) => prev.map((item) => item.id !== planId ? item : { ...item, stops: sortStops([...(item.stops || []), normalized]) }));
        return normalized;
      },
      addMemo: async (planId, stopId, text) => {
        const plan = plansRef.current.find((item) => item.id === planId);
        const stop = plan?.stops?.find((item) => item.id === stopId);
        if (!plan || !stop) return null;
        const memo = {
          id: `memo-${Math.random().toString(36).slice(2, 9)}`,
          text,
          authorEmail: authUserRef.current?.email || "",
          createdAt: new Date().toISOString(),
        };
        setPlans((prev) => prev.map((item) => item.id !== planId ? item : {
          ...item,
          stops: item.stops.map((target) => target.id !== stopId ? target : { ...target, memos: [...(Array.isArray(target.memos) ? target.memos : []), memo] }),
        }));
        return memo;
      },
      updatePlan: async (planId, args) => {
        const plan = plansRef.current.find((item) => item.id === planId);
        if (!plan) return null;
        const next = { ...plan };
        if (typeof args.name === "string" && args.name.trim()) next.name = args.name.trim();
        if (typeof args.icon === "string" && args.icon.trim()) next.icon = args.icon.trim();
        if (typeof args.description === "string") next.description = args.description;
        if (typeof args.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(args.startDate)) next.startDate = args.startDate;
        if (typeof args.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(args.endDate)) next.endDate = args.endDate;
        if (typeof args.published === "boolean") next.published = args.published;
        setPlans((prev) => prev.map((item) => (item.id === planId ? next : item)));
        return next;
      },
      deletePlan: async (planId) => {
        const plan = plansRef.current.find((item) => item.id === planId);
        if (!plan) return null;
        const user = authUserRef.current;
        const isOwner = Boolean(user) && (plan.ownerUid === user.uid
          || (plan.ownerEmail || "").toLowerCase() === (user.email || "").toLowerCase());
        if (!isOwner) return null;
        await deleteTravelPlan(planId);
        setPlans((prev) => prev.filter((item) => item.id !== planId));
        setSelectedPlanId((prev) => (prev === planId ? "" : prev));
        return plan;
      },
      updateStop: async (planId, stopId, args) => {
        const plan = plansRef.current.find((item) => item.id === planId);
        const existing = plan?.stops?.find((item) => item.id === stopId);
        if (!plan || !existing) return null;
        const draft = { ...createStopDraftFixed(existing) };
        if (typeof args.name === "string") draft.name = args.name;
        if (Number.isInteger(args.day) && args.day >= 1) draft.day = String(args.day);
        if (typeof args.time === "string") draft.time = args.time;
        if (typeof args.category === "string") {
          draft.category = args.category;
          if (typeof args.emoji !== "string") draft.emoji = "";
        }
        if (typeof args.emoji === "string") draft.emoji = args.emoji;
        if (typeof args.short === "string") draft.short = args.short;
        if (typeof args.detail === "string") draft.detail = args.detail;
        if (typeof args.mapUrl === "string") draft.mapUrl = args.mapUrl;
        if (typeof args.photoUrl === "string") draft.photoUrl = args.photoUrl;
        if (args.clearCoordinates === true) {
          draft.lat = "";
          draft.lng = "";
        } else {
          if (Number.isFinite(args.lat)) draft.lat = String(args.lat);
          if (Number.isFinite(args.lng)) draft.lng = String(args.lng);
        }
        const normalized = normalizeStopDraftFixed(draft, existing);
        setPlans((prev) => prev.map((item) => (item.id !== planId ? item : {
          ...item,
          stops: sortStops((item.stops || []).map((target) => (target.id === stopId ? normalized : target))),
        })));
        return normalized;
      },
      deleteStop: async (planId, stopId) => {
        const plan = plansRef.current.find((item) => item.id === planId);
        const existing = plan?.stops?.find((item) => item.id === stopId);
        if (!plan || !existing) return null;
        setPlans((prev) => prev.map((item) => (item.id !== planId ? item : {
          ...item,
          stops: (item.stops || []).filter((target) => target.id !== stopId),
        })));
        return existing;
      },
    });
  }, []);
  const hasSyncedInitialSelection = React.useRef(false);
  const hasLoadedRemotePlans = React.useRef(!firebaseEnabled);
  const lastSyncedPlansJson = React.useRef("");
  const scrollRef = React.useRef(null);
  const now = useNowClock();
  const currentStopId = useMemo(() => getCurrentStopId(now, stopsData, selectedPlan?.startDate), [now, stopsData, selectedPlan?.startDate]);
  const currentStop = currentStopId ? spotMap[currentStopId] : null;
  const sel = spotMap[selId] || stopsData[0] || null;
  const tripDateLabel = useMemo(() => formatTripDateRange(selectedPlan), [selectedPlan]);

  useEffect(() => {
    if (!firebaseEnabled) {
      return undefined;
    }

    return subscribeToAuthState((user) => {
      setAuthUser(user);
      setAuthReady(true);
      setAuthPending(false);
      setAuthError("");
    });
  }, []);

  useEffect(() => {
    if (!firebaseEnabled || !authUser) {
      hasLoadedRemotePlans.current = !firebaseEnabled;
      lastSyncedPlansJson.current = "";
      setPlans([]);
      setSelectedPlanId("");
      setFirebaseStatus({
        loading: firebaseEnabled && authReady && !authUser,
        error: "",
      });
      return undefined;
    }

    const unsubscribe = subscribeToPlans(
      authUser.uid,
      authUser.email || "",
      (remotePlans) => {
        hasLoadedRemotePlans.current = true;
        const hydratedPlans = Array.isArray(remotePlans) && remotePlans.length > 0
          ? remotePlans.map(hydratePlanDataFixed)
          : [];
        const remoteJson = JSON.stringify(hydratedPlans);
        lastSyncedPlansJson.current = remoteJson;
        setPlans((prev) => {
          if (!pendingCreatePlanId) {
            return hydratedPlans;
          }

          const pendingPlan = prev.find((plan) => plan.id === pendingCreatePlanId);
          const alreadySynced = hydratedPlans.some((plan) => plan.id === pendingCreatePlanId);
          if (!pendingPlan || alreadySynced) {
            return hydratedPlans;
          }

          return [...hydratedPlans, pendingPlan];
        });
        setSelectedPlanId((prev) => {
          if (pendingCreatePlanId) {
            return pendingCreatePlanId;
          }
          return hydratedPlans.some((plan) => plan.id === prev) ? prev : (hydratedPlans[0]?.id || "");
        });

        setFirebaseStatus({ loading: false, error: "" });
      },
      () => {
        hasLoadedRemotePlans.current = true;
        setFirebaseStatus({ loading: false, error: "Firebase sync failed" });
      },
    );

    return unsubscribe;
  }, [authReady, authUser, pendingCreatePlanId]);

  useEffect(() => {
    if (!firebaseEnabled || !authUser || !hasLoadedRemotePlans.current) {
      return undefined;
    }

    const currentJson = JSON.stringify(plans);
    if (currentJson === lastSyncedPlansJson.current) {
      return undefined;
    }

    let active = true;

    savePlans(authUser.uid, plans)
      .then(() => {
        if (!active) return;
        lastSyncedPlansJson.current = currentJson;
        setFirebaseStatus((prev) => ({ ...prev, error: "" }));
      })
      .catch(() => {
        if (!active) return;
        setFirebaseStatus((prev) => ({ ...prev, error: "Firebase sync failed" }));
      });

    return () => {
      active = false;
    };
  }, [authUser, plans]);

  React.useEffect(() => {
    if (!stopsData.find((stop) => stop.id === selId) && stopsData[0]) {
      setSelId(stopsData[0].id);
      hasSyncedInitialSelection.current = false;
    }
  }, [selId, stopsData]);

  React.useEffect(() => {
    if (hasSyncedInitialSelection.current) return;
    if (currentStopId && spotMap[currentStopId]) {
      setSelId(currentStopId);
      hasSyncedInitialSelection.current = true;
      return;
    }
    if (stopsData[0]) {
      hasSyncedInitialSelection.current = true;
    }
  }, [currentStopId, spotMap, stopsData]);

  React.useEffect(() => {
    hasSyncedInitialSelection.current = false;
  }, [selectedPlanId]);

  React.useEffect(() => {
    if (!pendingCreatePlanId || pendingCreatePlanId !== selectedPlanId) return;

    setDraft({
      ...createStopDraftFixed(null, 1),
      category: "蜃ｺ逋ｺ",
      emoji: getCategoryEmojiFixed("\u51fa\u767a"),
      time: "09:00",
    });
    setDraft((prev) => ({ ...prev, category: "\u51fa\u767a", emoji: getCategoryEmojiFixed("\u51fa\u767a") }));
    setSelId("");
    setDraft((prev) => ({ ...prev, category: "\u51fa\u767a", emoji: getCategoryEmojiFixed("\u51fa\u767a") }));
    setEditorMode("create");
    setPendingCreatePlanId(null);
  }, [pendingCreatePlanId, selectedPlanId]);

  function handleAuthInput(key, value) {
    setAuthForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleEmailAuth(event) {
    event.preventDefault();
    if (!firebaseEnabled) {
      setAuthError("Firebase is not configured");
      return;
    }

    const email = authForm.email.trim();
    const password = authForm.password;
    if (!email || !password) {
      setAuthError("メールアドレスとパスワードを入力してください");
      return;
    }

    try {
      setAuthPending(true);
      setAuthError("");
      if (authMode === "signup") {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      setAuthPending(false);
      setAuthError(mapAuthError(error));
    }
  }

  async function handleGoogleAuth() {
    try {
      setAuthPending(true);
      setAuthError("");
      await signInWithGoogle();
    } catch (error) {
      setAuthPending(false);
      setAuthError(mapAuthError(error));
    }
  }

  async function handlePasswordReset() {
    const email = authForm.email.trim();
    if (!email) {
      setAuthError("パスワード再設定メールを送るためにメールアドレスを入力してください");
      return;
    }

    try {
      setAuthPending(true);
      setAuthError("");
      await resetPassword(email);
      setAuthError("パスワード再設定メールを送信しました。受信トレイを確認してください。");
    } catch (error) {
      setAuthError(mapAuthError(error));
    } finally {
      setAuthPending(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOutUser();
    } catch (_error) {
      setFirebaseStatus((prev) => ({ ...prev, error: "Sign out failed" }));
    }
  }

  function switchPlan(planId) {
    const nextPlan = plans.find((plan) => plan.id === planId);
    if (!nextPlan) return;

    const nextCurrentStopId = getCurrentStopId(now, nextPlan.stops, nextPlan.startDate);
    setSelectedPlanId(planId);
    setSelId(nextCurrentStopId || nextPlan.stops[0]?.id || "");
    setSheet(false);
    setSettingsOpen(false);
    hasSyncedInitialSelection.current = false;
  }

  function open(id) {
    if (!id) return;
    setSelId(id);
    setSheet(true);
  }
  function focusOnMap(id) {
    setSelId(id);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
  /*
  function openCreate() {
    setSheet(false);
    setPendingCreatePlanId(normalizedPlan.id);
      category: "出発",
      emoji: getCategoryEmoji("出発"),
      time: "09:00",
    });
    setPendingCreatePlanId(normalizedPlan.id);
  }
  */
  function openCreate() {
    setSheet(false);
    const base = spotMap[selId] || stopsData[stopsData.length - 1];
    setGeoState({ loading: false, message: "" });
    setSearchResults([]);
    setDraft({
      ...createStopDraftFixed(null, base?.day ?? 1),
      category: "蜃ｺ逋ｺ",
      emoji: getCategoryEmojiFixed("\u51fa\u767a"),
      time: "09:00",
    });
    setEditorMode("create");
  }
  function openPlanCreate() {
    setSettingsOpen(false);
    setPlanDraft(createPlanDraft());
    setPlanEditorOpen(true);
  }
  function openCreateAtPlace(spot) {
    if (!spot || !hasCoords(spot)) return;
    setSheet(false);
    setGeoState({ loading: false, message: "" });
    setSearchResults([]);
    setDraft(createStopDraftFixed({ day: spot.day, lat: spot.lat, lng: spot.lng, category: "観光" }));
    setEditorMode("create");
  }
  function openEdit(id) {
    const stop = spotMap[id];
    if (!stop) return;
    setSheet(false);
    setGeoState({ loading: false, message: "" });
    setSearchResults([]);
    setDraft(createStopDraftFixed(stop));
    setEditorMode("edit");
  }
  function closeEditor() {
    setEditorMode(null);
    setGeoState({ loading: false, message: "" });
    setSearchResults([]);
  }
  function closePlanEditor() {
    setPlanEditorOpen(false);
  }
  function handleDraftChange(key, value) {
    setDraft((prev) => {
      if (key === "category") {
        return {
          ...prev,
          category: value,
          emoji: prev.emojiAuto ? getCategoryEmojiFixed(value) : prev.emoji,
        };
      }
      if (key === "emoji") {
        return {
          ...prev,
          emoji: value,
          emojiAuto: false,
        };
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
  function handlePlanDraftChange(key, value) {
    setPlanDraft((prev) => ({ ...prev, [key]: value }));
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
    const normalized = normalizeStopDraftFixed(draft, editorMode === "edit" ? spotMap[draft.id] : null);
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id !== selectedPlanId
          ? plan
          : {
              ...plan,
              stops: sortStops(
                editorMode === "edit"
                  ? plan.stops.map((stop) => (stop.id === normalized.id ? normalized : stop))
                  : [...plan.stops, normalized],
              ),
            },
      ),
    );
    setSelId(normalized.id);
    setSheet(false);
    setEditorMode(null);
  }
  function deleteDraft() {
    if (editorMode !== "edit" || stopsData.length <= 1) return;
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id !== selectedPlanId
          ? plan
          : { ...plan, stops: plan.stops.filter((stop) => stop.id !== draft.id) },
      ),
    );
    setSheet(false);
    setEditorMode(null);
  }
  /*
  function savePlanDraft() {
    const normalizedPlan = {
      ...normalizePlanDraft(planDraft),
      ownerEmail: (authUser?.email || "").toLowerCase(),
      editorEmails: [],
    };
    setPlans((prev) => [...prev, normalizedPlan]);
    setSelectedPlanId(normalizedPlan.id);
    setPlanEditorOpen(false);
    setPendingCreatePlanId(normalizedPlan.id);
      category: "出発",
      emoji: getCategoryEmoji("出発"),
      time: "09:00",
    //
  }

  */
  function savePlanDraft() {
    const normalizedPlan = {
      ...normalizePlanDraft(planDraft),
      ownerEmail: (authUser?.email || "").toLowerCase(),
      editorEmails: [],
    };
    setPlans((prev) => [...prev, normalizedPlan]);
    setSelectedPlanId(normalizedPlan.id);
    setPlanEditorOpen(false);
    setPendingCreatePlanId(normalizedPlan.id);
  }

  if (!firebaseEnabled) {
    return (
      <>
        <style>{css}</style>
        <AuthScreen
          authMode={authMode}
          authForm={authForm}
          authPending={authPending}
          authError="Firebase 設定が見つかりません。.env.local を確認してください。"
          onChangeMode={setAuthMode}
          onChangeField={handleAuthInput}
          onSubmit={handleEmailAuth}
          onGoogle={handleGoogleAuth}
          onResetPassword={handlePasswordReset}
        />
      </>
    );
  }

  if (!authReady) {
    return (
      <>
        <style>{css}</style>
        <div className="auth-screen">
          <div className="auth-card">
            <div className="auth-badge">TravelPlanner</div>
            <div className="auth-title">認証状態を確認中です</div>
            <div className="auth-copy">Firebase Authentication の初期化が終わるまで少し待ってください。</div>
            </div>
        </div>
      </>
    );
  }

  if (!authUser) {
    return (
      <>
        <style>{css}</style>
        <AuthScreen
          authMode={authMode}
          authForm={authForm}
          authPending={authPending}
          authError={authError}
          onChangeMode={setAuthMode}
          onChangeField={handleAuthInput}
          onSubmit={handleEmailAuth}
          onGoogle={handleGoogleAuth}
          onResetPassword={handlePasswordReset}
        />
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="hdr">
          <div className="hdr-icon">{selectedPlan?.icon || "🧳"}</div>
          <div>
            <div className="hdr-title">{selectedPlan?.name || "旅行プラン"}</div>
            <div className="hdr-sub">{selectedPlan?.description || "説明未設定"}</div>
            <div className="hdr-live">
              {currentStop
                ? `今の想定位置: ${formatStopDay(currentStop)} ${currentStop.time} ${currentStop.name}`
                : "現在時刻は旅程外です"}
            </div>
          </div>
          <div className="hdr-side">
            <div className="hdr-pill">{tripDateLabel}</div>
            <button className="hdr-settings" onClick={() => setSettingsOpen(true)}>⚙️</button>
          </div>
        </div>

        <div className="scroll" ref={scrollRef}>
          {plans.length === 0 && !firebaseStatus.loading ? (
            <div className="list-empty" style={{ margin: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>プランがまだありません</div>
              <div style={{ marginBottom: 10 }}>最初の旅行プランを作って、予定を追加していきましょう。</div>
              <button className="btn-a primary" onClick={openPlanCreate}>＋ 最初のプランを作る</button>
            </div>
          ) : null}
          <MapView
            planId={selectedPlanId}
            stopsData={stopsData}
            spotMap={spotMap}
            selId={selId}
            currentStopId={currentStopId}
            onPick={setSelId}
            onOpen={open}
            onFocusStop={focusOnMap}
            onCreateStop={openCreate}
            onToggleSchedule={() => setScheduleOpen((prev) => !prev)}
            scheduleOpen={scheduleOpen}
            sel={sel}
          />
        </div>
      </div>

      {sheet && (
        <Sheet
          spot={sel}
          onClose={() => setSheet(false)}
          onEdit={() => openEdit(sel.id)}
          onAddAtPlace={hasCoords(sel) ? () => openCreateAtPlace(sel) : null}
          onAddMemo={authUser ? (text) => {
            const memo = { id: `memo-${Math.random().toString(36).slice(2, 9)}`, text, authorEmail: authUser.email || "", createdAt: new Date().toISOString() };
            setPlans((prev) => prev.map((plan) => plan.id !== selectedPlan.id ? plan : {
              ...plan,
              stops: plan.stops.map((stop) => stop.id !== sel.id ? stop : { ...stop, memos: [...(Array.isArray(stop.memos) ? stop.memos : []), memo] }),
            }));
          } : null}
        />
      )}
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
      {planEditorOpen && (
        <PlanEditorSheet
          draft={planDraft}
          onChange={handlePlanDraftChange}
          onClose={closePlanEditor}
          onSave={savePlanDraft}
        />
      )}
      {settingsOpen && (
        <PlannerSettingsSheet
          plans={plans}
          selectedPlan={selectedPlan}
          selectedPlanId={selectedPlanId}
          authUser={authUser}
          firebaseStatus={firebaseStatus}
          publicShareUrl={selectedPlan?.shareId ? `${window.location.origin}${window.location.pathname}#/share/${selectedPlan.shareId}` : ""}
          onClose={() => setSettingsOpen(false)}
          onSelectPlan={switchPlan}
          onCreatePlan={openPlanCreate}
          onSignOut={handleSignOut}
          onPublishedChange={(nextPublished) => setPlans((prev) => prev.map((plan) => plan.id !== selectedPlanId ? plan : { ...plan, published: nextPublished }))}
          onRegenerateShareLink={() => setPlans((prev) => prev.map((plan) => plan.id !== selectedPlanId ? plan : { ...plan, shareId: createShareId() }))}
          onAddEditorEmail={(editorEmail) => setPlans((prev) => prev.map((plan) => plan.id !== selectedPlanId ? plan : { ...plan, editorEmails: [...new Set([...(plan.editorEmails || []), editorEmail.trim().toLowerCase()])] }))}
          onRemoveEditorEmail={(editorEmail) => setPlans((prev) => prev.map((plan) => plan.id !== selectedPlanId ? plan : { ...plan, editorEmails: (plan.editorEmails || []).filter((email) => email !== editorEmail) }))}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorApp />} />
      <Route path="/share/:shareId" element={<ShareApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ShareApp() {
  const { shareId = "" } = useParams();
  const [plan, setPlan] = useState(null);
  const [shareAuthUser, setShareAuthUser] = useState(null);
  const [memoError, setMemoError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selId, setSelId] = useState("");
  const [sheet, setSheet] = useState(false);
  const [editHelpOpen, setEditHelpOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  useBodyScrollLock(Boolean(sheet || editHelpOpen));
  const scrollRef = React.useRef(null);
  const hasSyncedInitialSelection = React.useRef(false);
  const now = useNowClock();
  const stopsData = plan?.stops || [];
  const spotMap = useMemo(() => Object.fromEntries(stopsData.map((stop) => [stop.id, stop])), [stopsData]);
  const currentStopId = useMemo(() => getCurrentStopId(now, stopsData, plan?.startDate), [now, stopsData, plan?.startDate]);
  const currentStop = currentStopId ? spotMap[currentStopId] : null;
  const sel = spotMap[selId] || stopsData[0] || null;
  const tripDateLabel = useMemo(() => formatTripDateRange(plan), [plan]);

  useEffect(() => subscribeToAuthState((user) => setShareAuthUser(user)), []);

  useEffect(() => {
    setLoading(true);
    setError("");

    return subscribeToPublicPlanByShareId(
      shareId,
      (nextPlan) => {
        setPlan(nextPlan ? hydratePlanDataFixed(nextPlan) : null);
        setLoading(false);
      },
      () => {
        setError("公開プランの読み込みに失敗しました");
        setLoading(false);
      },
    );
  }, [shareId]);

  useEffect(() => {
    if (!stopsData.find((stop) => stop.id === selId) && stopsData[0]) {
      setSelId(stopsData[0].id);
      hasSyncedInitialSelection.current = false;
    }
  }, [selId, stopsData]);

  useEffect(() => {
    if (hasSyncedInitialSelection.current) return;
    if (currentStopId && spotMap[currentStopId]) {
      setSelId(currentStopId);
      hasSyncedInitialSelection.current = true;
      return;
    }
    if (stopsData[0]) {
      hasSyncedInitialSelection.current = true;
    }
  }, [currentStopId, spotMap, stopsData]);

  function open(id) {
    if (!id) return;
    setSelId(id);
    setSheet(true);
  }

  function focusOnMap(id) {
    setSelId(id);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  if (loading) {
    return <StatusScreen title="公開プランを読み込んでいます" copy="共有リンクから旅程データを取得しています。" />;
  }

  if (error) {
    return <StatusScreen title="公開プランを読み込めません" copy={error} />;
  }

  if (!plan) {
    return <StatusScreen title="公開プランが見つかりません" copy="リンクが無効か、公開設定がオフになっています。" />;
  }

  return (
    <>
      <style>{css}</style>
      <div className="shell">
        <div className="hdr">
          <div className="hdr-icon">{plan?.icon || "🗺️"}</div>
          <div>
            <div className="hdr-title">{plan?.name || "旅行プラン"}</div>
            <div className="hdr-sub">{plan?.description || "公開中の旅行プランです"}</div>
            <div className="hdr-live">
              {currentStop
                ? `現在時刻の予定: ${formatStopDay(currentStop)} ${currentStop.time} ${currentStop.name}`
                : "現在時刻に該当する予定はありません"}
            </div>
          </div>
          <div className="hdr-side">
            <div className="hdr-pill">{tripDateLabel || "--/--"}</div>
          </div>
        </div>

        <div className="scroll" ref={scrollRef}>
          <MapView
            planId={plan.id}
            stopsData={stopsData}
            spotMap={spotMap}
            selId={selId}
            currentStopId={currentStopId}
            onPick={setSelId}
            onOpen={open}
            onFocusStop={focusOnMap}
            onCreateStop={() => {}}
            onToggleSchedule={() => setScheduleOpen((prev) => !prev)}
            scheduleOpen={scheduleOpen}
            sel={sel}
            canEdit={false}
          />
        </div>
      </div>

      {sheet && sel ? (
        <Sheet
          spot={sel}
          onClose={() => setSheet(false)}
          onEdit={() => setEditHelpOpen(true)}
          canEdit={true}
          memoError={memoError}
          memoNote={!shareAuthUser ? "メモの追加はログインすると使えます（編集者のみ）" : "メモの追加は編集者のみできます"}
          onAddMemo={shareAuthUser && plan && ((plan.ownerEmail || "").toLowerCase() === (shareAuthUser.email || "").toLowerCase() || (plan.editorEmails || []).map((e) => e.toLowerCase()).includes((shareAuthUser.email || "").toLowerCase())) ? async (text) => {
            const memo = { id: `memo-${Math.random().toString(36).slice(2, 9)}`, text, authorEmail: shareAuthUser.email || "", createdAt: new Date().toISOString() };
            const nextPlan = {
              ...plan,
              stops: plan.stops.map((stop) => stop.id !== sel.id ? stop : { ...stop, memos: [...(Array.isArray(stop.memos) ? stop.memos : []), memo] }),
            };
            try {
              setMemoError("");
              await savePlan(plan.id, nextPlan);
              setPlan(nextPlan);
              return true;
            } catch (error) {
              setMemoError("メモを保存できませんでした（このプランへの書き込み権限がない可能性があります）");
              return false;
            }
          } : null}
        />
      ) : null}
      {editHelpOpen ? (
        <ShareEditHelpSheet
          ownerEmail={plan?.ownerEmail || ""}
          onClose={() => setEditHelpOpen(false)}
        />
      ) : null}
    </>
  );
}

function StatusScreen({ title, copy }) {
  return (
    <>
      <style>{css}</style>
      <div className="auth-screen">
        <div className="auth-card">
          <div className="auth-badge">TravelPlanner</div>
          <div className="auth-title">{title}</div>
          <div className="auth-copy">{copy}</div>
        </div>
      </div>
    </>
  );
}

function MapView({ planId, stopsData, spotMap, selId, currentStopId, onPick, onOpen, onFocusStop, onCreateStop, onToggleSchedule, scheduleOpen, sel, canEdit = true }) {
  const [mapLocked, setMapLocked] = useState(false);
  const lockedRef = React.useRef(false);
  const mapInstanceRef = React.useRef(null);
  if (!sel || stopsData.length === 0) {
    return (
      <div className="map-wrap">
        <div className="sel-card">
          <div className="sel-icon" style={{ background: "#fff2ee" }}>📍</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sel-name">最初の予定を追加してください</div>
            <div className="sel-short">旅行プランを作成したので、まずは出発地点を登録します。</div>
          </div>
          {canEdit ? <button className="sel-open" onClick={onCreateStop}>追加</button> : null}
        </div>
      </div>
    );
  }

  const route = useMemo(() => stopsData.filter((stop) => hasCoords(stop)).map(s => s.id), [stopsData]);
  const positions = useMemo(() => route.map(id => [spotMap[id].lat, spotMap[id].lng]), [route, spotMap]);
  const currentSpot = currentStopId ? spotMap[currentStopId] : null;
  const focusSpot = [currentSpot, sel, ...stopsData].find((stop) => hasCoords(stop)) || null;
  const mapCenter = focusSpot ? [focusSpot.lat, focusSpot.lng] : [35.6812, 139.7671];

  return (
    <div className="map-wrap">
      <div className="map-canvas">
        <MapContainer key={planId} center={mapCenter} zoom={11} scrollWheelZoom className="leaflet-shell">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline
            positions={positions}
            pathOptions={{ color: "#e85c3a", weight: 4, opacity: 0.7, dashArray: "7 8" }}
          />
          {route.map((id, i) => {
            const s = spotMap[id];
            return (
              <AutoPopupMarker
                key={id}
                markerId={id}
                selectedId={selId}
                position={[s.lat, s.lng]}
                icon={createMapIcon(s, selId === id, currentStopId === id, route.indexOf(id) + 1)}
                zIndexOffset={selId === id ? 1000 : 0}
                eventHandlers={{
                  click: () => onPick(id),
                  dblclick: () => onOpen(id),
                }}
              >
                <Popup autoPan={false}>
                  <div style={{ minWidth: 170 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#78716c", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {s.time} · {s.category}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 14, fontWeight: 700, color: "#1c1917" }}>{s.name}</div>
                    <div style={{ marginTop: 3, fontSize: 12, color: "#78716c", fontWeight: 500 }}>{s.short}</div>
                    {samePlaceStops(stopsData, s).length > 1 ? (
                      <div style={{ marginTop: 8, borderTop: "1px solid #e7e5e0", paddingTop: 6 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#78716c" }}>この場所の予定</div>
                        {samePlaceStops(stopsData, s).map((placeStop) => (
                          <button
                            key={placeStop.id}
                            type="button"
                            onClick={() => onOpen(placeStop.id)}
                            style={{ display: "block", width: "100%", textAlign: "left", border: "none", background: "transparent", padding: "3px 0", fontSize: 12, color: "#1c1917", cursor: "pointer", fontFamily: "var(--font)" }}
                          >
                            {placeStop.day}日目 {placeStop.time} {placeStop.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
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
              </AutoPopupMarker>
            );
          })}
          <MapSelectionSync
            spot={sel}
            currentSpot={hasCoords(currentSpot) ? currentSpot : null}
            positions={positions}
            routeKey={route.join(",")}
            lockedRef={lockedRef}
            onLockChange={setMapLocked}
            mapRef={mapInstanceRef}
          />
        </MapContainer>
        {mapLocked ? (
          <button
            type="button"
            className="map-fit-btn"
            onClick={() => {
              lockedRef.current = false;
              setMapLocked(false);
              if (mapInstanceRef.current && positions.length > 0) {
                mapInstanceRef.current.fitBounds(positions, { padding: [30, 30] });
              }
            }}
          >
            全体を表示
          </button>
        ) : null}
      </div>

      <div className="sel-card">
        <div className={`sel-icon${currentStopId === selId ? " now-ring" : ""}`} style={{ background: sel.chip + "55" }}>{sel.emoji}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="sel-name">{sel.name}</div>
        </div>
        {currentStopId === selId ? <div className="now-badge">NOW</div> : null}
        <button className="sel-open" onClick={() => onOpen(selId)}>詳細</button>
      </div>

      <div className="schedule-panel">
        <div className="schedule-head">
          <div className="schedule-toggle-title">予定一覧</div>
          {canEdit ? (
            <button className="schedule-action primary" style={{ padding: "8px 12px" }} onClick={onCreateStop}>
              ＋予定を追加
            </button>
          ) : null}
        </div>
        <div className="schedule-list-scroll">
          <div className="schedule-body" style={{ borderTop: "none", paddingTop: 0 }}>
            <ListView stopsData={stopsData} selId={selId} currentStopId={currentStopId} onOpen={onOpen} onSelect={onFocusStop} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function ListView({ stopsData, selId, currentStopId, onOpen, onSelect, compact = false }) {
  return (
    <div className={compact ? "" : "list-wrap"}>
      {stopsData.map((s, i) => (
        <button key={s.id} className={`li${selId === s.id ? " sel" : ""}${currentStopId === s.id ? " now" : ""}`} onClick={() => (compact && onSelect ? onSelect(s.id) : onOpen(s.id))} onDoubleClick={() => onOpen(s.id)}>
          <div className="li-icon" style={{ background: s.chip + "66" }}>{s.emoji}</div>
          <div className="li-main">
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

function Sheet({ spot, onClose, onEdit, canEdit = true, onAddMemo = null, memoError = "", memoNote = "", onAddAtPlace = null }) {
  const [memoText, setMemoText] = useState("");
  const [memoFormOpen, setMemoFormOpen] = useState(false);
  const memos = Array.isArray(spot.memos) ? spot.memos : [];
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
          <button className="btn-a secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={onEdit}>✏️ 編集</button>
          <button className="sheet-x" onClick={onClose}>✕</button>
        </div>
        <a href={spot.mapUrl} target="_blank" rel="noreferrer" className="btn-a primary" style={{ display: "block", textAlign: "center", marginTop: 10 }}>
          🗺 Googleマップで開く
        </a>
        <div className="sheet-box">
          <div className="sheet-box-lbl">詳細メモ（作成者）</div>
          <div className="sheet-short">{spot.short}</div>
          <div className="sheet-detail">{spot.detail}</div>
          {spot.photoUrl ? (
            <a href={spot.photoUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
              🔗 参考リンク（写真など）
            </a>
          ) : null}
        </div>
        {onAddAtPlace ? (
          <button className="btn-a" style={{ width: "100%", marginTop: 2, marginBottom: 12, background: "var(--surface)", border: "1.5px solid var(--accent)", color: "var(--accent)" }} onClick={onAddAtPlace}>
            📍 この場所の予定を追加
          </button>
        ) : null}
        <div className="sheet-box">
          <div className="sheet-box-lbl">みんなのメモ（ログインで追記可）</div>
          {memos.length === 0 ? <div className="sheet-detail">まだメモはありません</div> : null}
          <div style={{ maxHeight: 180, overflowY: "auto" }}>
            {memos.map((memo) => (
              <div key={memo.id} style={{ marginTop: 6 }}>
                <div className="sheet-detail" style={{ whiteSpace: "pre-wrap" }}>{memo.text}</div>
                <div style={{ fontSize: 11, color: "#a8a29e" }}>
                  {memo.authorEmail || "unknown"} · {memo.createdAt ? new Date(memo.createdAt).toLocaleString("ja-JP") : ""}
                </div>
              </div>
            ))}
          </div>
          {onAddMemo ? (
            memoFormOpen ? (
              <div style={{ marginTop: 8 }}>
                <textarea
                  className="editor-textarea"
                  placeholder="メモを書く（電車の時刻など）"
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  autoFocus
                />
                {memoError ? <div style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{memoError}</div> : null}
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button
                    className="btn-a primary"
                    onClick={async () => {
                      if (!memoText.trim()) return;
                      const result = await onAddMemo(memoText.trim());
                      if (result === false) return;
                      setMemoText("");
                      setMemoFormOpen(false);
                    }}
                  >
                    追加する
                  </button>
                  <button className="btn-a secondary" onClick={() => { setMemoFormOpen(false); setMemoText(""); }}>
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn-a secondary" style={{ marginTop: 8 }} onClick={() => setMemoFormOpen(true)}>
                ＋メモを追加
              </button>
            )
          ) : (
            <div className="sheet-detail" style={{ marginTop: 6 }}>{memoNote || "メモの追加はログインすると使えます"}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShareEditHelpSheet({ ownerEmail, onClose }) {
  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-top">
          <div className="sheet-icon" style={{ background: "#fff2ee" }}>✏️</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="sheet-tag">編集するには</div>
            <div className="sheet-name">編集権限が必要です</div>
          </div>
          <button className="sheet-x" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-box">
          <div className="sheet-box-lbl">手順</div>
          <div className="sheet-detail">
            1. このアプリでサインインしてください。
            <br />
            2. サインイン後のメールアドレスを製作者に伝えてください。
            <br />
            3. 製作者がそのメールアドレスを編集者として追加すると、編集できるようになります。
          </div>
        </div>
        <div className="sheet-btns">
          <Link className="btn-a primary" to="/">サインイン</Link>
          <button className="btn-a secondary" onClick={onClose}>閉じる</button>
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
          <div className="editor-group-lbl">基本</div>
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
              <input className="editor-input" value={draft.emoji} onChange={(e) => onChange("emoji", e.target.value)} />
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
                {stableCategoryOptions.map((option) => (
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
          <div className="editor-group-lbl">場所</div>
          <details className="editor-details">
            <summary>座標・URLを手で直す（通常は不要）</summary>
            <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
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
            </div>
          </details>
        </div>

        <div className="editor-actions">
          <button className="editor-btn secondary" onClick={onClose}>キャンセル</button>
          <button className="editor-btn primary" onClick={onSave}>保存</button>
        </div>
        {mode === "edit" ? (
          <button
            onClick={onDelete}
            disabled={!canDelete}
            style={{ width: "100%", marginTop: 10, border: "none", background: "transparent", color: canDelete ? "#dc2626" : "#a8a29e", fontSize: 12, fontWeight: 700, padding: "8px 0", cursor: canDelete ? "pointer" : "default", fontFamily: "var(--font)" }}
          >
            {canDelete ? "この予定を削除" : "最後の1件は削除できません"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PlanEditorSheet({ draft, onChange, onClose, onSave }) {
  return (
    <div className="editor-backdrop settings-backdrop" onClick={onClose}>
      <div className="editor overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="editor-head">
          <div className="editor-title">旅行プランを追加</div>
          <button className="editor-close" onClick={onClose}>✕</button>
        </div>
        <div className="editor-grid">
          <div className="editor-row2">
            <div className="editor-field">
              <label>旅行名</label>
              <input className="editor-input" value={draft.name} onChange={(e) => onChange("name", e.target.value)} />
            </div>
            <div className="editor-field">
              <label>アイコン</label>
              <input className="editor-input" value={draft.icon} onChange={(e) => onChange("icon", e.target.value)} />
            </div>
          </div>
          <div className="editor-field">
            <label>説明</label>
            <input className="editor-input" value={draft.description} onChange={(e) => onChange("description", e.target.value)} />
          </div>
          <div className="editor-row2">
            <div className="editor-field">
              <label>開始日</label>
              <input className="editor-input" type="date" value={draft.startDate} onChange={(e) => onChange("startDate", e.target.value)} />
            </div>
            <div className="editor-field">
              <label>終了日</label>
              <input className="editor-input" type="date" value={draft.endDate} onChange={(e) => onChange("endDate", e.target.value)} />
            </div>
          </div>
          <div className="editor-note">まず旅行プランを作成し、その中に予定を追加していく流れです。</div>
        </div>
        <div className="editor-actions">
          <button className="editor-btn secondary" onClick={onClose}>キャンセル</button>
          <button className="editor-btn primary" onClick={onSave}>保存</button>
          <div />
        </div>
      </div>
    </div>
  );
}

function SettingsSheet({ plans, selectedPlanId, authUser, firebaseStatus, onClose, onSelectPlan, onCreatePlan, onSignOut }) {
  return (
    <div className="editor-backdrop settings-backdrop" onClick={onClose}>
      <div className="editor overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="editor-head">
          <div className="editor-title">設定</div>
          <button className="editor-close" onClick={onClose}>✕</button>
        </div>
        <div className="editor-grid">
          <div className="editor-field">
            <label>アカウント</label>
            <div className="settings-account">
              <div className="settings-account-row">
                <div className="settings-account-main">
                  <div className="settings-account-name">{authUser?.email || "Signed in"}</div>
                  <div className="settings-account-sub">
                    {firebaseStatus.loading
                      ? "Firebase connecting..."
                      : firebaseStatus.error || "Firebase connected"}
                  </div>
                </div>
                <button className="editor-btn secondary" onClick={onSignOut}>Sign out</button>
              </div>
            </div>
          </div>
          <div className="editor-field">
            <label>旅行プラン</label>
            <div className="settings-list">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  className={`settings-item${plan.id === selectedPlanId ? " on" : ""}`}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  <div className="settings-item-name">{plan.icon} {plan.name}</div>
                  <div className="settings-item-sub">{plan.description}</div>
                  <div className="settings-item-sub">{formatTripDateRange(plan)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="editor-actions">
          <button className="editor-btn secondary" onClick={onClose}>閉じる</button>
          <button className="editor-btn primary" onClick={onCreatePlan}>新規旅行を追加</button>
          <div />
        </div>
      </div>
    </div>
  );
}

function PlannerSettingsSheet({
  plans,
  selectedPlan,
  selectedPlanId,
  authUser,
  firebaseStatus,
  publicShareUrl,
  onClose,
  onSelectPlan,
  onCreatePlan,
  onSignOut,
  onPublishedChange,
  onRegenerateShareLink,
  onAddEditorEmail,
  onRemoveEditorEmail,
}) {
  const [editorEmail, setEditorEmail] = useState("");
  const [shareLinkFeedback, setShareLinkFeedback] = useState("");

  async function handleCopyShareLink() {
    if (!publicShareUrl || typeof navigator === "undefined" || !navigator.clipboard) {
      setShareLinkFeedback("リンクをコピーできませんでした");
      return;
    }

    try {
      await navigator.clipboard.writeText(publicShareUrl);
      setShareLinkFeedback("コピーしました");
    } catch (_error) {
      setShareLinkFeedback("リンクをコピーできませんでした");
      return;
    }

    window.clearTimeout(handleCopyShareLink.timeoutId);
    handleCopyShareLink.timeoutId = window.setTimeout(() => {
      setShareLinkFeedback("");
    }, 2000);
  }

  function handleAddEditor() {
    const trimmed = editorEmail.trim().toLowerCase();
    if (!trimmed) {
      return;
    }
    onAddEditorEmail(trimmed);
    setEditorEmail("");
  }

  return (
    <div className="editor-backdrop settings-backdrop" onClick={onClose}>
      <div className="editor overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="editor-head">
          <div className="editor-title">設定</div>
          <button className="editor-close" onClick={onClose}>×</button>
        </div>
        <div className="editor-grid">
          <div className="editor-field">
            <label>アカウント</label>
            <div className="settings-account">
              <div className="settings-account-row">
                <div className="settings-account-main">
                  <div className="settings-account-name">{authUser?.email || "Signed in"}</div>
                  <div className="settings-account-sub">
                    {firebaseStatus.loading
                      ? "Firebase connecting..."
                      : firebaseStatus.error || "Firebase connected"}
                  </div>
                </div>
                <button className="editor-btn secondary" onClick={onSignOut}>Sign out</button>
              </div>
            </div>
          </div>

          {selectedPlan ? (
            <>
              <div className="editor-field">
                <label>共有公開</label>
                <div className="settings-account-row">
                  <div className="settings-account-main">
                    <div className="settings-account-name">{selectedPlan.published ? "公開中" : "非公開"}</div>
                    <div className="settings-account-sub">
                      リンクを知っている人は {selectedPlan.published ? "閲覧できます" : "閲覧できません"}
                    </div>
                  </div>
                  <button className="editor-btn secondary" onClick={() => onPublishedChange(!selectedPlan.published)}>
                    {selectedPlan.published ? "非公開にする" : "公開する"}
                  </button>
                </div>
              </div>

              <div className="editor-field">
                <label>共有リンク</label>
                <input className="editor-input" value={publicShareUrl} readOnly />
                {shareLinkFeedback ? <div className="settings-account-sub">{shareLinkFeedback}</div> : null}
                <div className="editor-actions">
                  <button className="editor-btn secondary" onClick={handleCopyShareLink}>コピー</button>
                  <button className="editor-btn secondary" onClick={onRegenerateShareLink}>再生成</button>
                  <div />
                </div>
              </div>

              <div className="editor-field">
                <label>編集者メール</label>
                <div className="editor-inline">
                  <input
                    className="editor-input"
                    type="email"
                    value={editorEmail}
                    onChange={(event) => setEditorEmail(event.target.value)}
                    placeholder="name@example.com"
                  />
                  <button className="editor-fetch" onClick={handleAddEditor}>追加</button>
                </div>
                <div className="settings-list">
                  {(selectedPlan.editorEmails || []).map((email) => (
                    <div className="settings-account-row" key={email}>
                      <div className="settings-account-main">
                        <div className="settings-account-name">{email}</div>
                      </div>
                      <button className="editor-btn secondary" onClick={() => onRemoveEditorEmail(email)}>削除</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          <div className="editor-field">
            <label>旅行プラン</label>
            <div className="settings-list">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  className={`settings-item${plan.id === selectedPlanId ? " on" : ""}`}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  <div className="settings-item-name">{plan.icon} {plan.name}</div>
                  <div className="settings-item-sub">{plan.description}</div>
                  <div className="settings-item-sub">{formatTripDateRange(plan)}</div>
                </button>
              ))}
            </div>
            </div>
        </div>
        <div className="editor-actions">
          <button className="editor-btn secondary" onClick={onClose}>閉じる</button>
          <button className="editor-btn primary" onClick={onCreatePlan}>新規旅行を追加</button>
          <div />
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ authMode, authForm, authPending, authError, onChangeMode, onChangeField, onSubmit, onGoogle, onResetPassword }) {
  const isSignup = authMode === "signup";

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-badge">TravelPlanner Secure Sync</div>
        <div className="auth-title">旅程を Firebase に保存します</div>
        <div className="auth-copy">
          メールアドレスまたは Google アカウントでログインすると、旅程をユーザーごとに同期できます。
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              type="email"
              value={authForm.email}
              onChange={(event) => onChangeField("email", event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              disabled={authPending}
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              value={authForm.password}
              onChange={(event) => onChangeField("password", event.target.value)}
              placeholder="6文字以上"
              autoComplete={isSignup ? "new-password" : "current-password"}
              disabled={authPending}
            />
          </div>
          <div className="auth-error">{authError}</div>
          <button className="auth-submit" type="submit" disabled={authPending}>
            {authPending ? "処理中..." : isSignup ? "メールで登録" : "メールでログイン"}
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button className="auth-google" type="button" onClick={onGoogle} disabled={authPending}>
          {authPending ? "処理中..." : "Google でログイン"}
        </button>

        {!isSignup ? (
          <button className="auth-toggle" type="button" onClick={onResetPassword} disabled={authPending}>
            パスワードを忘れた場合
          </button>
        ) : null}

        <button
          className="auth-toggle"
          type="button"
          onClick={() => onChangeMode(isSignup ? "signin" : "signup")}
          disabled={authPending}
        >
          {isSignup ? "既存アカウントでログインする" : "メールアカウントを新規作成する"}
        </button>

        <div className="auth-note">
          Firebase Authentication 側で「メール/パスワード」と「Google」を有効化しておく必要があります。
        </div>
      </div>
    </div>
  );
}

function MapSelectionSync({ spot, currentSpot, positions, routeKey, lockedRef, onLockChange, mapRef }) {
  const map = useMap();
  const hasInitialized = React.useRef(false);
  const fittedRouteKey = React.useRef("");
  const suppressRef = React.useRef(false);

  React.useEffect(() => {
    if (mapRef) mapRef.current = map;
    const lock = () => {
      if (lockedRef && !lockedRef.current) {
        lockedRef.current = true;
        if (onLockChange) onLockChange(true);
      }
    };
    const onZoomStart = () => {
      if (!suppressRef.current) lock();
    };
    const onMoveEnd = () => {
      suppressRef.current = false;
    };
    map.on("dragstart", lock);
    map.on("zoomstart", onZoomStart);
    map.on("moveend", onMoveEnd);
    return () => {
      map.off("dragstart", lock);
      map.off("zoomstart", onZoomStart);
      map.off("moveend", onMoveEnd);
    };
  }, [map, lockedRef, onLockChange, mapRef]);

  React.useEffect(() => {
    const syncSize = () => {
      map.invalidateSize();
    };

    syncSize();
    const t1 = window.setTimeout(syncSize, 120);
    const t2 = window.setTimeout(syncSize, 360);

    window.addEventListener("resize", syncSize);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", syncSize);
    };
  }, [map]);

  React.useEffect(() => {
    if (!hasInitialized.current) {
      // 初期表示は1回だけ、レイアウト確定後に決める。
      // いまの予定があればそこを中心に、無ければ全体が入る表示にする（全体フィットとセンタリングを同時にやらない）
      const timer = window.setTimeout(() => {
        map.invalidateSize();
        if (lockedRef && lockedRef.current) {
          // 手動で固定された表示範囲を優先し、初期移動をしない
        } else if (hasCoords(currentSpot)) {
          suppressRef.current = true;
          map.setView(getOffsetCenter(map, currentSpot, 90, 13), 13, { animate: false });
        } else if (positions.length > 0) {
          suppressRef.current = true;
          map.fitBounds(positions, { padding: [30, 30] });
        }
        fittedRouteKey.current = routeKey;
        hasInitialized.current = true;
        lastFlownId.current = (hasCoords(currentSpot) ? currentSpot : spot)?.id || "";
      }, 180);
      return () => window.clearTimeout(timer);
    }

    // 予定の並び（ID列）が変わったときだけ全体表示する。メモ追加や文言編集では地図を動かさない
    // 手動で固定されている間は全体表示もしない（表示範囲を維持する）
    if (positions.length > 0 && fittedRouteKey.current !== routeKey) {
      fittedRouteKey.current = routeKey;
      if (!(lockedRef && lockedRef.current)) {
        suppressRef.current = true;
        map.fitBounds(positions, { padding: [30, 30] });
      }
    }
    return undefined;
  }, [map, positions, routeKey]);

  const lastFlownId = React.useRef("");
  React.useEffect(() => {
    if (!hasInitialized.current) return;

    // 座標のない予定を選んだときは地図を動かさない。現在時刻の予定が変わっても勝手に飛ばない
    if (!hasCoords(spot)) return;
    if (lastFlownId.current === spot.id) return;
    lastFlownId.current = spot.id;

    // 手動で固定されている間は選択しても飛ばない
    if (lockedRef && lockedRef.current) return;

    const zoom = map.getZoom() < 12 ? 12 : map.getZoom();
    suppressRef.current = true;
    map.flyTo(getOffsetCenter(map, spot, 100, zoom), zoom, {
      animate: true,
      duration: 0.8,
    });
  }, [map, spot]);

  return null;
}

function AutoPopupMarker({ markerId, selectedId, children, ...props }) {
  const markerRef = React.useRef(null);

  React.useEffect(() => {
    if (selectedId === markerId && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [markerId, selectedId]);

  return (
    <Marker ref={markerRef} {...props}>
      {children}
    </Marker>
  );
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

function getOffsetCenter(map, spot, offsetY, zoom = map.getZoom()) {
  const point = map.project([spot.lat, spot.lng], zoom);
  const shifted = L.point(point.x, point.y - offsetY);
  const latLng = map.unproject(shifted, zoom);
  return [latLng.lat, latLng.lng];
}

function useBodyScrollLock(locked) {
  React.useEffect(() => {
    if (!locked) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
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

function getCurrentStopId(now, stopsData, startDate) {
  const todayStart = new Date(`${startDate || new Date().toLocaleDateString("sv-SE")}T00:00:00`);

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

function formatTripDateRange(plan) {
  if (!plan) return "";
  const start = new Date(`${plan.startDate}T00:00:00`);
  const explicitEnd = plan.endDate ? new Date(`${plan.endDate}T00:00:00`) : null;
  const maxDay = plan.stops.reduce((max, stop) => Math.max(max, stop.day || 1), 1);
  const end = explicitEnd || new Date(start);
  if (!explicitEnd) {
    end.setDate(start.getDate() + maxDay - 1);
  }
  return `${formatMonthDay(start)}~${formatMonthDay(end)}`;
}

function formatMonthDay(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function normalizeCategoryValue(category) {
  const normalized = String(category || "").trim();
  return categoryAliases[normalized] || normalized || "観光";
}

function createStopDraft(base, forcedDay) {
  const category = base?.category || "観光";
  return {
    id: base?.id || "",
    name: base?.name || "",
    emoji: base?.emoji || getCategoryEmoji(category),
    emojiAuto: base ? false : true,
    day: String(forcedDay || base?.day || 1),
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

function createPlanDraft() {
  return {
    icon: "🧳",
    name: "",
    description: "",
    startDate: "2026-01-10",
    endDate: "2026-03-29",
  };
}

function normalizePlanDraft(draft) {
  const name = draft.name.trim() || "新しい旅行";
  const startDate = draft.startDate || "2026-01-10";
  const endDate = draft.endDate || startDate;

  return {
    id: createStopId(`${name}-plan`),
    icon: draft.icon.trim() || "🧳",
    name,
    description: draft.description.trim() || "新しい旅行プラン",
    startDate,
    endDate,
    stops: [],
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
    emoji: draft.emoji.trim() || getCategoryEmoji(draft.category),
    day: Math.max(1, Number.parseInt(draft.day, 10) || 1),
    time: isValidTime(draft.time) ? draft.time : "10:00",
    category: draft.category.trim() || "観光",
    short: draft.short.trim() || safeName,
    detail: draft.detail.trim() || "詳細未設定",
    mapUrl: draft.mapUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeName)}`,
    photoUrl: draft.photoUrl.trim() || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(safeName)}`,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    memos: Array.isArray(existingStop?.memos) ? existingStop.memos : [],
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

function createShareId() {
  return Math.random().toString(36).slice(2, 10);
}

function hydratePlanData(plan) {
  return {
    ...plan,
    published: plan?.published ?? true,
    shareId: plan?.shareId || createShareId(),
    ownerEmail: plan?.ownerEmail || "",
    editorEmails: Array.isArray(plan?.editorEmails) ? plan.editorEmails.map((email) => String(email).toLowerCase()) : [],
    stops: Array.isArray(plan?.stops) ? sortStops(plan.stops) : [],
  };
}

function normalizeCategoryValueFixed(category) {
  const normalized = String(category || "").trim();
  return stableCategoryAliases[normalized] || normalized || "\u89b3\u5149";
}

function getCategoryEmojiFixed(category) {
  return stableCategoryOptions.find((option) => option.value === normalizeCategoryValueFixed(category))?.emoji || "\ud83d\udccd";
}

function createStopDraftFixed(base, forcedDay) {
  const category = normalizeCategoryValueFixed(base?.category || "\u89b3\u5149");
  return {
    id: base?.id || "",
    name: base?.name || "",
    emoji: base?.emoji || getCategoryEmojiFixed(category),
    emojiAuto: base ? false : true,
    day: String(forcedDay || base?.day || 1),
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

function normalizeStopDraftFixed(draft, existingStop) {
  const lat = Number.parseFloat(draft.lat);
  const lng = Number.parseFloat(draft.lng);
  const safeName = draft.name.trim() || "New stop";
  const id = existingStop?.id || createStopId(safeName);
  const [chip, chipText] = existingStop ? [existingStop.chip, existingStop.chipText] : pickChipPair(id);
  const category = normalizeCategoryValueFixed(draft.category);

  return {
    id,
    name: safeName,
    emoji: draft.emoji.trim() || getCategoryEmojiFixed(category),
    day: Math.max(1, Number.parseInt(draft.day, 10) || 1),
    time: isValidTime(draft.time) ? draft.time : "10:00",
    category,
    short: draft.short.trim() || safeName,
    detail: draft.detail.trim() || "",
    mapUrl: draft.mapUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(safeName)}`,
    photoUrl: draft.photoUrl.trim() || `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(safeName)}`,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    memos: Array.isArray(existingStop?.memos) ? existingStop.memos : [],
    chip,
    chipText,
  };
}

function hasCoords(stop) {
  return Number.isFinite(stop?.lat) && Number.isFinite(stop?.lng);
}

function samePlaceStops(stopsData, target) {
  if (!hasCoords(target)) return [];
  return stopsData.filter(
    (stop) => hasCoords(stop) && Math.abs(stop.lat - target.lat) < 0.0005 && Math.abs(stop.lng - target.lng) < 0.0005,
  );
}

function hydratePlanDataFixed(plan) {
  return {
    ...plan,
    published: plan?.published ?? true,
    shareId: plan?.shareId || createShareId(),
    ownerEmail: plan?.ownerEmail || "",
    editorEmails: Array.isArray(plan?.editorEmails) ? plan.editorEmails.map((email) => String(email).toLowerCase()) : [],
    stops: Array.isArray(plan?.stops)
      ? sortStops(plan.stops.map((stop) => ({
          ...stop,
          category: normalizeCategoryValueFixed(stop?.category),
          lat: Number.isFinite(stop?.lat) ? stop.lat : null,
          lng: Number.isFinite(stop?.lng) ? stop.lng : null,
          memos: Array.isArray(stop?.memos) ? stop.memos : [],
        })))
      : [],
  };
}

function mapAuthError(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "メールアドレスまたはパスワードが正しくありません";
    case "auth/popup-closed-by-user":
      return "Google ログインがキャンセルされました";
    case "auth/email-already-in-use":
      return "このメールアドレスは既に使われています";
    case "auth/weak-password":
      return "パスワードは6文字以上にしてください";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。少し待って再試行してください";
    case "auth/network-request-failed":
      return "ネットワークエラーが発生しました";
    default:
      return error?.message || "認証に失敗しました";
  }
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
