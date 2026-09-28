const express = require('express');
const app = express();
app.use(express.json());

// =====================
// SABİT AYARLAR
// =====================
const PORT = process.env.PORT || 3000;
const CF_ACCOUNT_ID = 'b4c0063d5774f085266860ba3ca18043';
const CF_API_TOKEN  = 'cfut_solnD6nrAMOhwHICkzgniKW6GlKflvmDOHC1gj3F90c17659';
const MODEL = '@cf/meta/llama-3.1-8b-instruct';

// Native Workers AI uç noktası
const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${MODEL}`;

// =====================
// FRONTEND
// =====================
const HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>BD AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #08080d;
    --sidebar: rgba(15, 15, 22, 0.85);
    --surface: rgba(24, 24, 34, 0.65);
    --surface-solid: #181822;
    --surface-hover: rgba(35, 35, 50, 0.7);
    --border: rgba(255, 255, 255, 0.07);
    --border-strong: rgba(255, 255, 255, 0.12);
    --text: #f0f0f5;
    --text-dim: #9a9aad;
    --muted: #5a5a70;
    --accent: #8b5cf6;
    --accent-2: #c084fc;
    --accent-glow: rgba(139, 92, 246, 0.4);
    --grad-1: linear-gradient(135deg, #8b5cf6 0%, #c084fc 50%, #f472b6 100%);
    --grad-2: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
    --user-bubble: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    --ai-bubble: rgba(24, 24, 34, 0.8);
    --danger: #ef4444;
    --success: #22c55e;
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.5);
    --shadow-accent: 0 8px 32px rgba(139, 92, 246, 0.35);
  }
  [data-theme="light"] {
    --bg: #f5f5fa;
    --sidebar: rgba(255, 255, 255, 0.85);
    --surface: rgba(255, 255, 255, 0.75);
    --surface-solid: #ffffff;
    --surface-hover: rgba(245, 245, 250, 0.9);
    --border: rgba(0, 0, 0, 0.06);
    --border-strong: rgba(0, 0, 0, 0.1);
    --text: #0d0d15;
    --text-dim: #55556a;
    --muted: #8b8b9e;
    --ai-bubble: rgba(255, 255, 255, 0.9);
    --accent-glow: rgba(139, 92, 246, 0.22);
    --shadow-lg: 0 20px 60px rgba(0,0,0,0.1);
    --shadow-accent: 0 8px 32px rgba(139, 92, 246, 0.22);
  }
  html, body {
    height: 100%;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }
  .bg-blobs { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
  .blob { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.55; animation: float 20s ease-in-out infinite; }
  .blob-1 { width: 500px; height: 500px; background: radial-gradient(circle, #8b5cf6 0%, transparent 70%); top: -10%; left: -10%; }
  .blob-2 { width: 450px; height: 450px; background: radial-gradient(circle, #ec4899 0%, transparent 70%); bottom: -15%; right: -10%; animation-delay: -7s; }
  .blob-3 { width: 400px; height: 400px; background: radial-gradient(circle, #6366f1 0%, transparent 70%); top: 40%; right: 30%; animation-delay: -14s; opacity: 0.35; }
  [data-theme="light"] .blob { opacity: 0.35; }
  @keyframes float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(50px, -50px) scale(1.1); }
    66% { transform: translate(-50px, 50px) scale(0.9); }
  }
  .app { display: flex; height: 100vh; position: relative; z-index: 1; }
  .sidebar {
    width: 290px; background: var(--sidebar);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-right: 1px solid var(--border); display: flex;
    flex-direction: column; transition: margin-left .35s cubic-bezier(.4,0,.2,1);
    flex-shrink: 0;
  }
  .sidebar.collapsed { margin-left: -290px; }
  .sidebar-header { padding: 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); }
  .logo {
    width: 40px; height: 40px; border-radius: 12px;
    background: var(--grad-2); display: grid; place-items: center;
    font-weight: 800; font-size: 14px; color: #fff;
    letter-spacing: -0.5px; box-shadow: var(--shadow-accent); position: relative;
  }
  .brand { font-weight: 700; font-size: 16px; letter-spacing: -0.02em; }
  .brand small { display: block; font-size: 11px; color: var(--muted); font-weight: 500; margin-top: 1px; }
  .new-chat {
    margin: 16px 14px 12px; padding: 13px 16px;
    background: var(--grad-1); background-size: 200% 200%;
    color: #fff; border: none; border-radius: 14px;
    font-family: inherit; font-weight: 700; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    gap: 8px; transition: all .3s; box-shadow: var(--shadow-accent);
  }
  .new-chat:hover { background-position: 100% 0; transform: translateY(-2px); box-shadow: 0 12px 40px var(--accent-glow); }
  .history-label { padding: 12px 22px 8px; font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; }
  .chat-list { flex: 1; overflow-y: auto; padding: 0 10px 12px; }
  .chat-item {
    padding: 11px 14px; border-radius: 11px; font-size: 13px; font-weight: 500;
    color: var(--text-dim); cursor: pointer; display: flex; align-items: center;
    gap: 10px; margin-bottom: 2px; transition: all .2s; position: relative;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .chat-item:hover { background: var(--surface-hover); color: var(--text); }
  .chat-item.active { background: var(--surface-solid); color: var(--text); }
  .chat-item .del {
    margin-left: auto; opacity: 0; color: var(--muted); background: none;
    border: none; cursor: pointer; font-size: 13px; padding: 3px 5px;
    border-radius: 5px; transition: all .15s;
  }
  .chat-item:hover .del { opacity: 1; }
  .chat-item .del:hover { color: var(--danger); }
  .sidebar-footer { padding: 12px 14px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
  .icon-btn {
    flex: 1; padding: 11px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 11px;
    color: var(--text-dim); cursor: pointer; font-size: 16px;
    display: grid; place-items: center; transition: all .2s;
  }
  .icon-btn:hover { background: var(--surface-hover); color: var(--text); border-color: var(--border-strong); }
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .topbar {
    padding: 14px 22px; display: flex; align-items: center; gap: 14px;
    background: var(--sidebar); backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px); border-bottom: 1px solid var(--border);
  }
  .menu-btn {
    background: none; border: none; color: var(--text-dim); cursor: pointer;
    padding: 8px; border-radius: 9px; display: grid; place-items: center; transition: all .15s;
  }
  .menu-btn:hover { background: var(--surface-hover); color: var(--text); }
  .menu-btn svg { width: 20px; height: 20px; }
  .model-badge {
    display: flex; align-items: center; gap: 9px; font-size: 13px;
    font-weight: 600; color: var(--text-dim); padding: 7px 14px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 22px;
  }
  .model-badge .dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--success); box-shadow: 0 0 10px var(--success);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
  }
  .status-txt {
    margin-left: auto; font-size: 12px; font-weight: 500; color: var(--muted);
    display: flex; align-items: center; gap: 6px;
  }
  .status-txt::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--success); }
  .status-txt.busy::before { background: var(--accent-2); animation: pulse 1s infinite; }
  .status-txt.error::before { background: var(--danger); }
  .chat { flex: 1; overflow-y: auto; padding: 36px 24px 24px; scroll-behavior: smooth; }
  .chat::-webkit-scrollbar { width: 8px; }
  .chat::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }
  .msg-wrap {
    max-width: 860px; margin: 0 auto 30px; display: flex; gap: 15px;
    animation: slideIn .45s cubic-bezier(.2,.8,.2,1);
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-wrap.user { flex-direction: row-reverse; }
  .avatar {
    width: 36px; height: 36px; border-radius: 11px; display: grid;
    place-items: center; font-size: 15px; flex-shrink: 0; font-weight: 700;
    letter-spacing: -0.5px;
  }
  .avatar.user-av { background: var(--grad-1); color: #fff; box-shadow: var(--shadow-accent); font-size: 11px; }
  .avatar.ai-av {
    background: var(--surface-solid); border: 1px solid var(--border-strong);
    color: var(--accent-2); font-size: 12px;
  }
  [data-theme="light"] .avatar.ai-av { color: var(--accent); }
  .bubble {
    padding: 15px 19px; border-radius: 18px; line-height: 1.75; font-size: 15px;
    word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; min-width: 0;
  }
  .msg-wrap.user .bubble {
    background: var(--user-bubble); color: #fff;
    border-top-right-radius: 5px; box-shadow: var(--shadow-accent);
  }
  .msg-wrap.ai .bubble {
    background: var(--ai-bubble); backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border-strong);
    border-top-left-radius: 5px;
  }
  .bubble p { margin-bottom: 10px; }
  .bubble p:last-child { margin-bottom: 0; }
  .bubble h1, .bubble h2, .bubble h3 { margin: 18px 0 10px; font-weight: 700; line-height: 1.3; }
  .bubble h1 { font-size: 21px; }
  .bubble h2 { font-size: 18px; }
  .bubble h3 { font-size: 16px; }
  .bubble ul, .bubble ol { margin: 10px 0; padding-left: 24px; }
  .bubble li { margin-bottom: 5px; }
  .bubble a { color: var(--accent-2); text-decoration: none; border-bottom: 1px dashed var(--accent-2); }
  .bubble blockquote {
    border-left: 3px solid var(--accent); padding: 6px 0 6px 14px; margin: 12px 0;
    color: var(--text-dim); font-style: italic; background: rgba(139, 92, 246, 0.05);
    border-radius: 0 8px 8px 0;
  }
  .bubble code {
    font-family: 'JetBrains Mono', monospace; font-size: 13px;
    background: rgba(139, 92, 246, 0.14); padding: 2px 7px; border-radius: 6px;
    color: var(--accent-2); font-weight: 500;
  }
  .bubble pre {
    background: #0a0a12; border: 1px solid var(--border-strong);
    padding: 15px 18px; border-radius: 12px; overflow-x: auto; margin: 12px 0;
  }
  .bubble pre code { background: none; padding: 0; color: #e4e4ed; font-size: 13px; }
  .msg-actions { display: flex; gap: 4px; margin-top: 8px; opacity: 0; transition: opacity .2s; }
  .msg-wrap:hover .msg-actions { opacity: 1; }
  .msg-actions button {
    background: var(--surface); border: 1px solid var(--border);
    color: var(--muted); cursor: pointer; padding: 6px 10px;
    border-radius: 8px; font-size: 11px; font-weight: 600;
    font-family: inherit; transition: all .15s;
  }
  .msg-actions button:hover { background: var(--surface-hover); color: var(--text); }
  .typing-dots { display: flex; gap: 6px; padding: 6px 2px; }
  .typing-dots span {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--grad-1); animation: bounce 1.4s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: .15s; }
  .typing-dots span:nth-child(3) { animation-delay: .3s; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0) scale(1); opacity: .5; }
    30% { transform: translateY(-8px) scale(1.1); opacity: 1; }
  }
  .welcome { max-width: 740px; margin: auto; text-align: center; padding: 40px 20px; }
  .welcome-logo {
    width: 84px; height: 84px; margin: 0 auto 26px; border-radius: 24px;
    background: var(--grad-2); display: grid; place-items: center;
    font-size: 26px; font-weight: 800; color: #fff;
    letter-spacing: -1px; box-shadow: 0 20px 60px var(--accent-glow);
  }
  .welcome h1 {
    font-size: 38px; font-weight: 800; letter-spacing: -0.03em;
    margin-bottom: 12px; background: var(--grad-2);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .welcome p { color: var(--text-dim); font-size: 16px; margin-bottom: 36px; font-weight: 500; }
  .suggestions { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; text-align: left; }
  .sugg {
    padding: 16px 18px; background: var(--surface);
    backdrop-filter: blur(20px); border: 1px solid var(--border);
    border-radius: 16px; cursor: pointer; transition: all .25s;
    font-size: 13px; color: var(--text-dim); line-height: 1.55;
  }
  .sugg:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 12px 32px var(--accent-glow); color: var(--text); }
  .sugg strong { display: block; color: var(--text); font-weight: 700; margin-bottom: 5px; font-size: 14px; }
  .input-area { padding: 18px 24px 22px; position: relative; }
  .input-wrap {
    max-width: 860px; margin: 0 auto; background: var(--surface);
    backdrop-filter: blur(24px); border: 1px solid var(--border-strong);
    border-radius: 22px; padding: 8px 8px 8px 20px;
    display: flex; align-items: flex-end; gap: 10px;
    transition: all .25s; box-shadow: var(--shadow-lg);
  }
  .input-wrap:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-glow), var(--shadow-lg); }
  textarea {
    flex: 1; resize: none; border: none; background: none; color: var(--text);
    font-family: inherit; font-size: 15px; font-weight: 500; line-height: 1.6;
    outline: none; padding: 13px 0; max-height: 200px;
  }
  textarea::placeholder { color: var(--muted); }
  .send-btn {
    width: 44px; height: 44px; border: none; border-radius: 15px;
    background: var(--grad-1); color: #fff; cursor: pointer;
    display: grid; place-items: center; transition: all .25s;
    flex-shrink: 0; box-shadow: var(--shadow-accent);
  }
  .send-btn:hover:not(:disabled) { transform: scale(1.06); box-shadow: 0 10px 30px var(--accent-glow); }
  .send-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
  .send-btn svg { width: 19px; height: 19px; }
  .hint { max-width: 860px; margin: 11px auto 0; font-size: 11px; color: var(--muted); text-align: center; }
  .hint kbd {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 5px; padding: 1px 6px;
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
  }
  @media (max-width: 768px) {
    .sidebar { position: fixed; top: 0; bottom: 0; left: 0; z-index: 100; }
    .sidebar.collapsed { margin-left: -290px; }
    .chat { padding: 22px 14px; }
    .input-area { padding: 12px 14px 16px; }
    .welcome h1 { font-size: 28px; }
    .suggestions { grid-template-columns: 1fr; }
  }
  .overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,.55); backdrop-filter: blur(4px); z-index: 99;
  }
  .overlay.show { display: block; }
</style>
</head>
<body data-theme="dark">
<div class="bg-blobs">
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>
</div>
<div class="app">
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="logo">BD</div>
      <div class="brand">BD AI<small>Akıllı sohbet asistanı</small></div>
    </div>
    <button class="new-chat" onclick="newChat()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      Yeni sohbet
    </button>
    <div class="history-label">Geçmiş</div>
    <div class="chat-list" id="chatList"></div>
    <div class="sidebar-footer">
      <button class="icon-btn" id="themeBtn" title="Tema">🌙</button>
      <button class="icon-btn" onclick="clearAll()" title="Tümünü sil">🗑️</button>
    </div>
  </aside>
  <div class="overlay" id="overlay" onclick="toggleSidebar()"></div>
  <main class="main">
    <div class="topbar">
      <button class="menu-btn" onclick="toggleSidebar()" title="Menü">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="model-badge">
        <span class="dot"></span>
        <span>Llama 3.1 8B</span>
      </div>
      <div class="status-txt" id="status">Hazır</div>
    </div>
    <div class="chat" id="chat"></div>
    <div class="input-area">
      <div class="input-wrap">
        <textarea id="msg" rows="1" placeholder="BD AI'ya bir şey sor..."></textarea>
        <button class="send-btn" id="send" title="Gönder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      <div class="hint"><kbd>Enter</kbd> gönder · <kbd>Shift</kbd>+<kbd>Enter</kbd> yeni satır</div>
    </div>
  </main>
</div>
<script>
  const chatEl = document.getElementById('chat');
  const msgEl = document.getElementById('msg');
  const sendBtn = document.getElementById('send');
  const chatList = document.getElementById('chatList');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  const statusEl = document.getElementById('status');
  const themeBtn = document.getElementById('themeBtn');
  const STORAGE_KEY = 'bdai_chats_v6';
  const THEME_KEY = 'bdai_theme_v6';
  let chats = [], currentId = null, isStreaming = false;
  function loadChats() {
    try { chats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { chats = []; }
    if (chats.length === 0) createChat();
    else { currentId = chats[0].id; render(); }
    renderSidebar();
  }
  function saveChats() { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)); }
  function createChat() {
    const c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), title: 'Yeni sohbet', messages: [], createdAt: Date.now() };
    chats.unshift(c); currentId = c.id;
    saveChats(); renderSidebar(); render();
    return c;
  }
  function currentChat() { return chats.find(c => c.id === currentId); }
  function newChat() {
    const existingEmpty = chats.find(c => c.messages.length === 0);
    if (existingEmpty) { currentId = existingEmpty.id; } else { createChat(); }
    renderSidebar(); render();
    if (window.innerWidth <= 768) toggleSidebar();
  }
  function deleteChat(id, e) {
    e.stopPropagation();
    chats = chats.filter(c => c.id !== id);
    if (chats.length === 0) { createChat(); }
    else if (currentId === id) { currentId = chats[0].id; }
    saveChats(); renderSidebar(); render();
  }
  function clearAll() {
    if (!confirm('Tüm sohbetler silinsin mi?')) return;
    chats = []; createChat();
  }
  function renderSidebar() {
    chatList.innerHTML = '';
    chats.forEach(c => {
      const item = document.createElement('div');
      item.className = 'chat-item' + (c.id === currentId ? ' active' : '');
      item.textContent = c.title;
      item.onclick = () => { currentId = c.id; renderSidebar(); render(); if (window.innerWidth <= 768) toggleSidebar(); };
      const del = document.createElement('button');
      del.className = 'del'; del.innerHTML = '✕';
      del.onclick = (e) => deleteChat(c.id, e);
      item.appendChild(del); chatList.appendChild(item);
    });
  }
  function render() {
    const c = currentChat();
    chatEl.innerHTML = '';
    if (!c || c.messages.length === 0) { renderWelcome(); return; }
    c.messages.forEach((m, i) => appendMessage(m.role, m.content, i === c.messages.length - 1));
    scrollBottom();
  }
  function renderWelcome() {
    const w = document.createElement('div');
    w.className = 'welcome';
    w.innerHTML = '<div class="welcome-logo">BD</div>' +
      '<h1>Merhaba, ben BD AI</h1>' +
      '<p>Sana nasıl yardımcı olabilirim?</p>' +
      '<div class="suggestions">' +
        sugg('💡 Bir fikir ver', 'Bana yeni bir iş fikri öner ve neden tutacağını açıkla.') +
        sugg('📝 Metin yaz', 'Kısa ve etkileyici bir tanıtım yazısı yaz.') +
        sugg('🧠 Açıkla', 'Kuantum bilgisayarları basitçe açıkla.') +
        sugg('💻 Kod yaz', 'JavaScript ile bir sayaç fonksiyonu yaz.') +
      '</div>';
    chatEl.appendChild(w);
    chatEl.querySelectorAll('.sugg').forEach(el => {
      el.onclick = () => { msgEl.value = el.getAttribute('data-prompt'); autoResize(); send(); };
    });
  }
  function sugg(title, prompt) {
    return '<div class="sugg" data-prompt="' + prompt.replace(/"/g, '&quot;') + '"><strong>' + title + '</strong>' + prompt + '</div>';
  }
  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function appendMessage(role, content, isLast) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap ' + (role === 'user' ? 'user' : 'ai');
    const av = document.createElement('div');
    av.className = 'avatar ' + (role === 'user' ? 'user-av' : 'ai-av');
    av.textContent = role === 'user' ? 'Sen' : 'BD';
    const body = document.createElement('div');
    body.style.minWidth = '0'; body.style.maxWidth = '100%';
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (role === 'user') { bubble.textContent = content; }
    else { bubble.innerHTML = renderMarkdown(content); }
    body.appendChild(bubble);
    if (role === 'assistant') {
      const actions = document.createElement('div');
      actions.className = 'msg-actions';
      const copyBtn = document.createElement('button');
      copyBtn.innerHTML = '📋 Kopyala';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(content);
        copyBtn.innerHTML = '✓ Kopyalandı';
        setTimeout(() => copyBtn.innerHTML = '📋 Kopyala', 1500);
      };
      actions.appendChild(copyBtn);
      if (isLast) {
        const reBtn = document.createElement('button');
        reBtn.innerHTML = '🔄 Yenile';
        reBtn.onclick = regenerate;
        actions.appendChild(reBtn);
      }
      body.appendChild(actions);
    }
    wrap.appendChild(av); wrap.appendChild(body);
    chatEl.appendChild(wrap);
  }
  function renderMarkdown(text) {
    try {
      if (window.marked) { marked.setOptions({ breaks: true, gfm: true }); return marked.parse(text); }
    } catch {}
    return escapeHtml(text).replace(/\\n/g, '<br>');
  }
  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap ai'; wrap.id = 'typingMsg';
    wrap.innerHTML = '<div class="avatar ai-av">BD</div>' +
      '<div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>';
    chatEl.appendChild(wrap); scrollBottom();
  }
  function scrollBottom() { requestAnimationFrame(() => { chatEl.scrollTop = chatEl.scrollHeight; }); }
  function setStatus(txt, cls) {
    statusEl.textContent = txt;
    statusEl.className = 'status-txt' + (cls ? ' ' + cls : '');
  }
  async function send() {
    const text = msgEl.value.trim();
    if (!text || isStreaming) return;
    const c = currentChat();
    if (!c) return;
    if (c.messages.length === 0) {
      c.title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      renderSidebar(); chatEl.innerHTML = '';
    }
    c.messages.push({ role: 'user', content: text });
    appendMessage('user', text, false);
    msgEl.value = ''; autoResize(); saveChats();
    isStreaming = true; sendBtn.disabled = true;
    setStatus('Yazıyor...', 'busy'); addTyping();
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: c.messages })
      });
      const data = await res.json();
      document.getElementById('typingMsg')?.remove();
      if (!res.ok) throw new Error(data.error || 'Sunucu hatası');
      c.messages.push({ role: 'assistant', content: data.reply });
      appendMessage('assistant', data.reply, true);
      saveChats(); setStatus('Hazır');
    } catch (e) {
      document.getElementById('typingMsg')?.remove();
      const wrap = document.createElement('div');
      wrap.className = 'msg-wrap ai';
      wrap.innerHTML = '<div class="avatar ai-av">⚠️</div>' +
        '<div><div class="bubble" style="background:#7f1d1d;color:#fecaca">Hata: ' + escapeHtml(e.message) + '</div></div>';
      chatEl.appendChild(wrap);
      c.messages.pop(); saveChats(); setStatus('Hata', 'error');
    } finally {
      isStreaming = false; sendBtn.disabled = false;
      msgEl.focus(); scrollBottom();
    }
  }
  async function regenerate() {
    const c = currentChat();
    if (!c || c.messages.length < 2) return;
    if (c.messages[c.messages.length - 1].role === 'assistant') c.messages.pop();
    saveChats(); render();
    isStreaming = true; sendBtn.disabled = true;
    setStatus('Yazıyor...', 'busy'); addTyping();
    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: c.messages })
      });
      const data = await res.json();
      document.getElementById('typingMsg')?.remove();
      if (!res.ok) throw new Error(data.error || 'Sunucu hatası');
      c.messages.push({ role: 'assistant', content: data.reply });
      appendMessage('assistant', data.reply, true);
      saveChats(); setStatus('Hazır');
    } catch (e) {
      document.getElementById('typingMsg')?.remove();
      setStatus('Hata', 'error');
    } finally {
      isStreaming = false; sendBtn.disabled = false; scrollBottom();
    }
  }
  function autoResize() {
    msgEl.style.height = 'auto';
    msgEl.style.height = Math.min(msgEl.scrollHeight, 200) + 'px';
  }
  function toggleSidebar() {
    sidebar.classList.toggle('collapsed');
    overlay.classList.toggle('show', !sidebar.classList.contains('collapsed') && window.innerWidth <= 768);
  }
  function applyTheme(t) {
    document.body.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
    localStorage.setItem(THEME_KEY, t);
  }
  sendBtn.onclick = send;
  msgEl.addEventListener('input', autoResize);
  msgEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  themeBtn.onclick = () => {
    const cur = document.body.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  };
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  loadChats(); msgEl.focus(); autoResize();
</script>
</body>
</html>`;

// =====================
// ROTALAR
// =====================
app.get('/', (req, res) => res.send(HTML));
app.get('/health', (req, res) => res.send('OK'));

// Token'ı test etmek için: tarayıcıdan /test aç
app.get('/test', async (req, res) => {
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + CF_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Merhaba' }] })
    });
    const text = await r.text();
    res.status(r.status).send(text);
  } catch (e) {
    res.status(500).send(String(e));
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history)) return res.status(400).json({ error: 'Geçersiz istek' });

    const messages = [
      { role: 'system', content: 'Sen BD AI adlı yardımcı bir Türkçe AI asistanısın. Net, doğru ve kısa cevap ver. Markdown kullanabilirsin.' },
      ...history
    ];

    console.log('[BD AI] İstek gönderiliyor, mesaj sayısı:', messages.length);

    const aiRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + CF_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });

    const raw = await aiRes.text();
    console.log('[BD AI] CF yanıtı:', aiRes.status, raw.slice(0, 500));

    let data;
    try { data = JSON.parse(raw); } catch { data = { raw }; }

    if (!aiRes.ok || data.success === false) {
      const errMsg = data?.errors?.[0]?.message
                  || data?.error?.message
                  || data?.error
                  || data?.messages?.[0]
                  || ('HTTP ' + aiRes.status);
      console.error('[BD AI] Hata:', aiRes.status, errMsg);
      return res.status(aiRes.status === 200 ? 500 : aiRes.status).json({ error: errMsg });
    }

    const reply = data?.result?.response
               || data?.result?.choices?.[0]?.message?.content
               || data?.choices?.[0]?.message?.content
               || data?.response
               || '(boş cevap)';

    res.json({ reply });
  } catch (err) {
    console.error('[BD AI] Sunucu hatası:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('BD AI sunucusu ' + PORT + ' portunda çalışıyor');
  console.log('Model: ' + MODEL);
  console.log('Endpoint: ' + API_URL);
});
