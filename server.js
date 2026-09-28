const express = require('express');
const app = express();
app.use(express.json());

// =====================
// AYARLAR
// =====================
const PORT = process.env.PORT || 3000;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = process.env.MODEL || '@cf/openai/gpt-oss-120b';

const API_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/v1/chat/completions`;

// =====================
// FRONTEND
// =====================
const HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Nova AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --bg-elev: #111119;
    --sidebar: #0d0d14;
    --surface: #16161f;
    --surface-hover: #1c1c28;
    --border: #23232f;
    --border-soft: #1a1a24;
    --text: #ececf1;
    --text-dim: #a1a1b3;
    --muted: #6b6b80;
    --accent: #7c5cff;
    --accent-2: #a78bfa;
    --accent-glow: rgba(124, 92, 255, 0.35);
    --grad-1: linear-gradient(135deg, #7c5cff 0%, #a78bfa 100%);
    --grad-2: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    --user-bubble: linear-gradient(135deg, #7c5cff 0%, #6366f1 100%);
    --ai-bubble: #16161f;
    --danger: #ef4444;
    --success: #22c55e;
  }

  [data-theme="light"] {
    --bg: #f7f7fb;
    --bg-elev: #ffffff;
    --sidebar: #f0f0f7;
    --surface: #ffffff;
    --surface-hover: #f0f0f7;
    --border: #e2e2ec;
    --border-soft: #ebebf2;
    --text: #16161f;
    --text-dim: #55556a;
    --muted: #8b8b9e;
    --ai-bubble: #ffffff;
    --accent-glow: rgba(124, 92, 255, 0.18);
  }

  html, body {
    height: 100%;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
  }

  /* arka plan efekti */
  body::before {
    content: '';
    position: fixed;
    top: -40%; left: -20%;
    width: 80%; height: 80%;
    background: radial-gradient(circle, var(--accent-glow) 0%, transparent 60%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }
  body::after {
    content: '';
    position: fixed;
    bottom: -40%; right: -20%;
    width: 70%; height: 70%;
    background: radial-gradient(circle, rgba(217, 70, 239, 0.18) 0%, transparent 60%);
    filter: blur(80px);
    z-index: 0;
    pointer-events: none;
  }

  .app {
    display: flex;
    height: 100vh;
    position: relative;
    z-index: 1;
  }

  /* ============ SIDEBAR ============ */
  .sidebar {
    width: 280px;
    background: var(--sidebar);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    transition: margin-left .3s cubic-bezier(.4,0,.2,1);
    flex-shrink: 0;
  }
  .sidebar.collapsed { margin-left: -280px; }

  .sidebar-header {
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .logo {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: var(--grad-2);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 16px;
    color: #fff;
    box-shadow: 0 4px 20px var(--accent-glow);
  }
  .brand {
    font-weight: 600;
    font-size: 15px;
    letter-spacing: -.01em;
  }
  .brand small {
    display: block;
    font-size: 11px;
    color: var(--muted);
    font-weight: 400;
  }

  .new-chat {
    margin: 0 14px 12px;
    padding: 12px 14px;
    background: var(--grad-1);
    color: #fff;
    border: none;
    border-radius: 12px;
    font-family: inherit;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform .15s, box-shadow .2s;
    box-shadow: 0 4px 16px var(--accent-glow);
  }
  .new-chat:hover { transform: translateY(-1px); box-shadow: 0 6px 24px var(--accent-glow); }
  .new-chat:active { transform: scale(.98); }

  .history-label {
    padding: 8px 20px 6px;
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: .08em;
    font-weight: 600;
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 12px;
  }
  .chat-list::-webkit-scrollbar { width: 4px; }
  .chat-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .chat-item {
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    color: var(--text-dim);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 2px;
    transition: background .15s, color .15s;
    position: relative;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chat-item:hover { background: var(--surface-hover); color: var(--text); }
  .chat-item.active { background: var(--surface); color: var(--text); }
  .chat-item.active::before {
    content: '';
    position: absolute;
    left: 0; top: 20%; bottom: 20%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--accent);
  }
  .chat-item .del {
    margin-left: auto;
    opacity: 0;
    color: var(--muted);
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 4px;
  }
  .chat-item:hover .del { opacity: 1; }
  .chat-item .del:hover { color: var(--danger); }

  .sidebar-footer {
    padding: 12px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 8px;
  }
  .icon-btn {
    flex: 1;
    padding: 10px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text-dim);
    cursor: pointer;
    font-size: 16px;
    display: grid;
    place-items: center;
    transition: all .15s;
  }
  .icon-btn:hover { background: var(--surface-hover); color: var(--text); border-color: var(--accent); }

  /* ============ MAIN ============ */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    position: relative;
  }

  .topbar {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(10, 10, 15, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  [data-theme="light"] .topbar { background: rgba(255, 255, 255, 0.7); }

  .menu-btn {
    background: none;
    border: none;
    color: var(--text-dim);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    transition: background .15s, color .15s;
  }
  .menu-btn:hover { background: var(--surface); color: var(--text); }
  .menu-btn svg { width: 20px; height: 20px; }

  .model-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-dim);
    padding: 6px 12px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
  }
  .model-badge .dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .4; }
  }

  .status-txt {
    margin-left: auto;
    font-size: 12px;
    color: var(--muted);
  }

  /* ============ CHAT AREA ============ */
  .chat {
    flex: 1;
    overflow-y: auto;
    padding: 32px 24px 24px;
    scroll-behavior: smooth;
  }
  .chat::-webkit-scrollbar { width: 6px; }
  .chat::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .chat::-webkit-scrollbar-track { background: transparent; }

  .msg-wrap {
    max-width: 820px;
    margin: 0 auto 28px;
    display: flex;
    gap: 14px;
    animation: slideIn .4s cubic-bezier(.2,.8,.2,1);
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-wrap.user { flex-direction: row-reverse; }

  .avatar {
    width: 34px; height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 15px;
    flex-shrink: 0;
    font-weight: 600;
  }
  .avatar.user-av {
    background: var(--grad-1);
    color: #fff;
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .avatar.ai-av {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--accent-2);
  }
  [data-theme="light"] .avatar.ai-av { color: var(--accent); }

  .bubble {
    padding: 14px 18px;
    border-radius: 16px;
    line-height: 1.7;
    font-size: 15px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
    min-width: 0;
  }
  .msg-wrap.user .bubble {
    background: var(--user-bubble);
    color: #fff;
    border-top-right-radius: 4px;
    box-shadow: 0 8px 24px var(--accent-glow);
  }
  .msg-wrap.ai .bubble {
    background: var(--ai-bubble);
    border: 1px solid var(--border);
    border-top-left-radius: 4px;
  }

  /* Markdown stilleri */
  .bubble p { margin-bottom: 10px; }
  .bubble p:last-child { margin-bottom: 0; }
  .bubble h1, .bubble h2, .bubble h3 {
    margin: 16px 0 8px;
    font-weight: 600;
    line-height: 1.3;
  }
  .bubble h1 { font-size: 20px; }
  .bubble h2 { font-size: 17px; }
  .bubble h3 { font-size: 15px; }
  .bubble ul, .bubble ol { margin: 10px 0; padding-left: 22px; }
  .bubble li { margin-bottom: 4px; }
  .bubble a { color: var(--accent-2); text-decoration: none; }
  .bubble a:hover { text-decoration: underline; }
  .bubble blockquote {
    border-left: 3px solid var(--accent);
    padding-left: 12px;
    margin: 10px 0;
    color: var(--text-dim);
    font-style: italic;
  }
  .bubble code {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    background: rgba(124, 92, 255, 0.12);
    padding: 2px 6px;
    border-radius: 5px;
    color: var(--accent-2);
  }
  [data-theme="light"] .bubble code { color: var(--accent); }
  .bubble pre {
    background: #0d0d14;
    border: 1px solid var(--border);
    padding: 14px 16px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 12px 0;
    position: relative;
  }
  [data-theme="light"] .bubble pre { background: #f4f4f8; }
  .bubble pre code {
    background: none;
    padding: 0;
    color: #e4e4ed;
    font-size: 13px;
    line-height: 1.6;
  }
  [data-theme="light"] .bubble pre code { color: #16161f; }

  .msg-actions {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    opacity: 0;
    transition: opacity .2s;
  }
  .msg-wrap:hover .msg-actions { opacity: 1; }
  .msg-actions button {
    background: none;
    border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 5px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-family: inherit;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background .15s, color .15s;
  }
  .msg-actions button:hover { background: var(--surface); color: var(--text); }

  /* typing */
  .typing-dots {
    display: flex;
    gap: 5px;
    padding: 4px 0;
  }
  .typing-dots span {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--accent-2);
    animation: bounce 1.4s infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: .15s; }
  .typing-dots span:nth-child(3) { animation-delay: .3s; }
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); opacity: .5; }
    30% { transform: translateY(-7px); opacity: 1; }
  }

  /* ============ WELCOME ============ */
  .welcome {
    max-width: 720px;
    margin: auto;
    text-align: center;
    padding: 40px 20px;
    animation: slideIn .5s;
  }
  .welcome-logo {
    width: 68px; height: 68px;
    margin: 0 auto 22px;
    border-radius: 20px;
    background: var(--grad-2);
    display: grid;
    place-items: center;
    font-size: 32px;
    box-shadow: 0 12px 40px var(--accent-glow);
  }
  .welcome h1 {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -.02em;
    margin-bottom: 10px;
    background: var(--grad-2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .welcome p { color: var(--text-dim); font-size: 15px; margin-bottom: 30px; }

  .suggestions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 10px;
    text-align: left;
  }
  .sugg {
    padding: 14px 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    cursor: pointer;
    transition: all .2s;
    font-size: 13px;
    color: var(--text-dim);
    line-height: 1.5;
  }
  .sugg:hover {
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px var(--accent-glow);
    color: var(--text);
  }
  .sugg strong { display: block; color: var(--text); font-weight: 600; margin-bottom: 4px; font-size: 13px; }

  /* ============ INPUT ============ */
  .input-area {
    padding: 16px 24px 20px;
    background: linear-gradient(to top, var(--bg) 60%, transparent);
  }
  .input-wrap {
    max-width: 820px;
    margin: 0 auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 6px 6px 6px 18px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    transition: border-color .2s, box-shadow .2s;
  }
  .input-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-glow);
  }
  textarea {
    flex: 1;
    resize: none;
    border: none;
    background: none;
    color: var(--text);
    font-family: inherit;
    font-size: 15px;
    line-height: 1.6;
    outline: none;
    padding: 12px 0;
    max-height: 200px;
  }
  textarea::placeholder { color: var(--muted); }

  .send-btn {
    width: 42px; height: 42px;
    border: none;
    border-radius: 14px;
    background: var(--grad-1);
    color: #fff;
    cursor: pointer;
    display: grid;
    place-items: center;
    transition: transform .15s, opacity .2s;
    flex-shrink: 0;
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .send-btn:hover { transform: scale(1.05); }
  .send-btn:active { transform: scale(.95); }
  .send-btn:disabled { opacity: .35; cursor: not-allowed; transform: none; box-shadow: none; }
  .send-btn svg { width: 18px; height: 18px; }

  .hint {
    max-width: 820px;
    margin: 10px auto 0;
    font-size: 11px;
    color: var(--muted);
    text-align: center;
  }

  /* mobile */
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 0; bottom: 0; left: 0;
      z-index: 100;
      box-shadow: 0 0 40px rgba(0,0,0,.5);
    }
    .sidebar.collapsed { margin-left: -280px; }
    .chat { padding: 20px 14px; }
    .input-area { padding: 12px 14px 16px; }
    .msg-wrap { margin-bottom: 22px; }
    .bubble { font-size: 14px; padding: 12px 14px; }
    .welcome h1 { font-size: 24px; }
    .suggestions { grid-template-columns: 1fr; }
  }

  .overlay {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.5);
    z-index: 99;
  }
  .overlay.show { display: block; }
</style>
</head>
<body data-theme="dark">

<div class="app">
  <!-- SIDEBAR -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
      <div class="logo">N</div>
      <div class="brand">Nova AI<small>Modern sohbet</small></div>
    </div>
    <button class="new-chat" onclick="newChat()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      Yeni sohbet
    </button>
    <div class="history-label">Geçmiş</div>
    <div class="chat-list" id="chatList"></div>
    <div class="sidebar-footer">
      <button class="icon-btn" id="themeBtn" title="Tema değiştir">🌙</button>
      <button class="icon-btn" onclick="clearAll()" title="Tümünü sil">🗑️</button>
    </div>
  </aside>

  <div class="overlay" id="overlay" onclick="toggleSidebar()"></div>

  <!-- MAIN -->
  <main class="main">
    <div class="topbar">
      <button class="menu-btn" onclick="toggleSidebar()" title="Menü">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <div class="model-badge">
        <span class="dot"></span>
        <span id="modelName">GPT-OSS 120B</span>
      </div>
      <div class="status-txt" id="status">Hazır</div>
    </div>

    <div class="chat" id="chat"></div>

    <div class="input-area">
      <div class="input-wrap">
        <textarea id="msg" rows="1" placeholder="Nova'ya bir şey sor..."></textarea>
        <button class="send-btn" id="send" title="Gönder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </div>
      <div class="hint">Enter ile gönder · Shift+Enter ile yeni satır</div>
    </div>
  </main>
</div>

<script>
  const chatEl    = document.getElementById('chat');
  const msgEl     = document.getElementById('msg');
  const sendBtn   = document.getElementById('send');
  const chatList  = document.getElementById('chatList');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');
  const statusEl  = document.getElementById('status');
  const themeBtn  = document.getElementById('themeBtn');

  const STORAGE_KEY = 'nova_chats';
  const THEME_KEY   = 'nova_theme';

  let chats = [];         // [{id, title, messages: [{role, content}], createdAt}]
  let currentId = null;
  let isStreaming = false;

  // ============ STORAGE ============
  function loadChats() {
    try { chats = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { chats = []; }
    if (chats.length === 0) createChat();
    else { currentId = chats[0].id; render(); }
    renderSidebar();
  }
  function saveChats() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }
  function createChat() {
    const c = { id: Date.now().toString(36) + Math.random().toString(36).slice(2,6), title: 'Yeni sohbet', messages: [], createdAt: Date.now() };
    chats.unshift(c);
    currentId = c.id;
    saveChats();
    renderSidebar();
    render();
    return c;
  }
  function currentChat() { return chats.find(c => c.id === currentId); }

  function newChat() {
    const existingEmpty = chats.find(c => c.messages.length === 0);
    if (existingEmpty) { currentId = existingEmpty.id; }
    else { createChat(); }
    renderSidebar();
    render();
    if (window.innerWidth <= 768) toggleSidebar();
  }

  function deleteChat(id, e) {
    e.stopPropagation();
    chats = chats.filter(c => c.id !== id);
    if (chats.length === 0) { createChat(); }
    else if (currentId === id) { currentId = chats[0].id; }
    saveChats();
    renderSidebar();
    render();
  }

  function clearAll() {
    if (!confirm('Tüm sohbetler silinsin mi?')) return;
    chats = [];
    createChat();
  }

  function renderSidebar() {
    chatList.innerHTML = '';
    chats.forEach(c => {
      const item = document.createElement('div');
      item.className = 'chat-item' + (c.id === currentId ? ' active' : '');
      item.textContent = c.title;
      item.onclick = () => { currentId = c.id; renderSidebar(); render(); if (window.innerWidth <= 768) toggleSidebar(); };
      const del = document.createElement('button');
      del.className = 'del';
      del.innerHTML = '✕';
      del.onclick = (e) => deleteChat(c.id, e);
      item.appendChild(del);
      chatList.appendChild(item);
    });
  }

  // ============ RENDER ============
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
    w.innerHTML = '<div class="welcome-logo">✨</div>' +
      '<h1>Merhaba, ben Nova</h1>' +
      '<p>Sana nasıl yardımcı olabilirim?</p>' +
      '<div class="suggestions">' +
        sugg('💡 Bir fikir ver', 'Bana yeni bir iş fikri öner ve neden tutacağını açıkla.') +
        sugg('📝 Metin yaz', 'Kısa ve etkileyici bir tanıtım yazısı yaz.') +
        sugg('🧠 Açıkla', 'Kuantum bilgisayarları basitçe açıkla.') +
        sugg('💻 Kod yaz', 'JavaScript ile bir sayaç fonksiyonu yaz.') +
      '</div>';
    chatEl.appendChild(w);
    chatEl.querySelectorAll('.sugg').forEach(el => {
      el.onclick = () => {
        const t = el.getAttribute('data-prompt');
        msgEl.value = t;
        autoResize();
        send();
      };
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
    av.textContent = role === 'user' ? 'Sen' : '✨';
    av.style.fontSize = role === 'user' ? '11px' : '15px';

    const body = document.createElement('div');
    body.style.minWidth = '0';
    body.style.maxWidth = '100%';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (role === 'user') {
      bubble.textContent = content;
    } else {
      bubble.innerHTML = renderMarkdown(content);
    }
    body.appendChild(bubble);

    // action butonları (sadece AI)
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

    wrap.appendChild(av);
    wrap.appendChild(body);
    chatEl.appendChild(wrap);
  }

  function renderMarkdown(text) {
    try {
      if (window.marked) {
        marked.setOptions({ breaks: true, gfm: true });
        return marked.parse(text);
      }
    } catch {}
    return escapeHtml(text).replace(/\\n/g, '<br>');
  }

  function addTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap ai';
    wrap.id = 'typingMsg';
    wrap.innerHTML = '<div class="avatar ai-av">✨</div>' +
      '<div><div class="bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div></div>';
    chatEl.appendChild(wrap);
    scrollBottom();
  }

  function scrollBottom() {
    requestAnimationFrame(() => { chatEl.scrollTop = chatEl.scrollHeight; });
  }

  // ============ SEND ============
  async function send() {
    const text = msgEl.value.trim();
    if (!text || isStreaming) return;

    const c = currentChat();
    if (!c) return;

    // ilk mesajsa başlık ata
    if (c.messages.length === 0) {
      c.title = text.slice(0, 40) + (text.length > 40 ? '...' : '');
      renderSidebar();
    }

    if (c.messages.length === 0) chatEl.innerHTML = '';

    c.messages.push({ role: 'user', content: text });
    appendMessage('user', text, false);
    msgEl.value = '';
    autoResize();
    saveChats();

    isStreaming = true;
    sendBtn.disabled = true;
    statusEl.textContent = 'Yazıyor...';
    addTyping();

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
      saveChats();
      statusEl.textContent = 'Hazır';
    } catch (e) {
      document.getElementById('typingMsg')?.remove();
      const wrap = document.createElement('div');
      wrap.className = 'msg-wrap ai';
      wrap.innerHTML = '<div class="avatar ai-av">⚠️</div>' +
        '<div><div class="bubble" style="background:#7f1d1d;color:#fecaca;border-color:#991b1b">Hata: ' + escapeHtml(e.message) + '</div></div>';
      chatEl.appendChild(wrap);
      c.messages.pop();
      saveChats();
      statusEl.textContent = 'Hata';
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      msgEl.focus();
      scrollBottom();
    }
  }

  async function regenerate() {
    const c = currentChat();
    if (!c || c.messages.length < 2) return;
    // son AI mesajını sil
    if (c.messages[c.messages.length - 1].role === 'assistant') {
      c.messages.pop();
    }
    saveChats();
    render();

    isStreaming = true;
    sendBtn.disabled = true;
    statusEl.textContent = 'Yazıyor...';
    addTyping();
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
      saveChats();
      statusEl.textContent = 'Hazır';
    } catch (e) {
      document.getElementById('typingMsg')?.remove();
      statusEl.textContent = 'Hata';
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      scrollBottom();
    }
  }

  // ============ UI HELPERS ============
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

  // ============ EVENTS ============
  sendBtn.onclick = send;
  msgEl.addEventListener('input', autoResize);
  msgEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  themeBtn.onclick = () => {
    const cur = document.body.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  };

  // ============ INIT ============
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  loadChats();
  msgEl.focus();
  autoResize();
</script>
</body>
</html>`;

// =====================
// ROTALAR
// =====================
app.get('/', (req, res) => res.send(HTML));
app.get('/health', (req, res) => res.send('OK'));

app.post('/chat', async (req, res) => {
  try {
    const { history } = req.body;
    if (!Array.isArray(history)) return res.status(400).json({ error: 'Geçersiz istek' });
    if (!CF_API_TOKEN || !CF_ACCOUNT_ID) return res.status(500).json({ error: 'Sunucu yapılandırması eksik' });

    const systemPrompt = {
      role: 'system',
      content: 'Sen Nova adlı yardımcı bir Türkçe AI asistanısın. Net, doğru ve kısa cevap ver. Markdown kullanabilirsin.'
    };

    const aiRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + CF_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [systemPrompt, ...history],
        temperature: 0.7
      })
    });

    const data = await aiRes.json();
    if (!aiRes.ok) {
      const errMsg = data.errors?.[0]?.message || data.error?.message || 'AI servisi hata verdi';
      return res.status(aiRes.status).json({ error: errMsg });
    }
    const reply = data.choices?.[0]?.message?.content || data.result?.response || '(boş cevap)';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('Sunucu ' + PORT + ' portunda çalışıyor');
  console.log('Model: ' + MODEL);
});
