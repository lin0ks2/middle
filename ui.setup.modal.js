/*!
 * ui.setup.modal.js — Lexitron
 * Version: 1.6.2
 * Date: 2025-09-27
 *
 * Единый стиль модалки мастера:
 *  - .modalHeader: заголовок + крестик
 *  - .modalBody: флажки выбора языков
 *  - .modalActions: кнопка "Начнём!" (локализовано через I18N.startBtn)
 */
(function(){
  'use strict';

  const LS = {
    uiLang: 'lexitron.uiLang',
    studyLang: 'lexitron.studyLang',
    deckKey: 'lexitron.deckKey',
    setupDone: 'lexitron.setupDone',
    legacyActiveKey: 'lexitron.activeKey',
  };

  function get(k){ try{ return localStorage.getItem(k)||''; }catch(_){ return ''; } }
  function set(k,v){ try{ localStorage.setItem(k, String(v)); }catch(_){ } }

  function effLang(){
    try{
      const saved = get(LS.uiLang);
      if (saved) return saved;
      const nav = (navigator.language||'ru').slice(0,2).toLowerCase();
      return (nav==='uk'?'uk':'ru');
    }catch(_){ return 'ru'; }
  }
  function L(lang){
    try{ return (window.I18N && I18N[lang||effLang()]) || I18N.ru || {}; }catch(_){ return {}; }
  }
  function T(key, fallback){
    const lang = effLang();
    const bag = L(lang);
    return (bag && bag[key]) || fallback || '';
  }

  function builtinKeys(){
    try{
      if (window.App && App.Decks && typeof App.Decks.builtinKeys==='function') return App.Decks.builtinKeys();
      return Object.keys(window.decks||{});
    }catch(_){ return []; }
  }
  function firstDeckForLang(lang){
    const pref = (lang||'').toLowerCase() + '_';
    const keys = builtinKeys().filter(k => String(k).startsWith(pref));
    const preferred = pref + 'verbs';
    if (keys.includes(preferred)) return preferred;
    return keys[0] || null;
  }

  function build(){
    let modal = document.getElementById('setupModal');
    if (!modal){
      modal = document.createElement('div');
      modal.id = 'setupModal';
      modal.className = 'modal hidden';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');

      const ttl   = T('setupTitle', T('modalTitle','Настройка'));
      const start = T('startBtn',  T('ok','Начнём!'));   // ← берём "Начнём!" из i18n

      modal.innerHTML = [
        '<div class="backdrop"></div>',
        '<div class="dialog">',
          '<div class="modalHeader">',
            '<h2 class="modalTitle" id="setupTitle">'+ttl+'</h2>',
            '<button id="setupClose" class="iconBtn small" aria-label="Close">✖️</button>',
          '</div>',
          '<div class="modalBody" id="setupBody">',
            '<div id="langFlags">',
              '<div class="field">',
                '<div class="label">'+(T('uiLanguage','Язык интерфейса'))+'</div>',
                '<div class="langFlags flagsRow" id="setupUiFlags"></div>',
              '</div>',
              '<div class="field" style="margin-top:8px">',
                '<div class="label">'+(T('studyLanguage','Язык изучения'))+'</div>',
                '<div class="langFlags flagsRow" id="setupStudyFlags"></div>',
              '</div>',
            '</div>',
          '</div>',
          '<div class="modalActions" style="text-align:center">',
            '<button id="setupOk" class="primary">'+start+'</button>',
          '</div>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);
    }

    const uiFlagsEl    = modal.querySelector('#setupUiFlags');
    const studyFlagsEl = modal.querySelector('#setupStudyFlags');
    const okBtn        = modal.querySelector('#setupOk');
    const closeBtn     = modal.querySelector('#setupClose');

    const activeUi    = () => (get(LS.uiLang)||'').toLowerCase();
    const setActiveUi = v  => set(LS.uiLang, v);
    const activeStudy = () => (get(LS.studyLang)||'').toLowerCase();
    const setActiveStudy = v => set(LS.studyLang, v);

    function renderUiFlags(){
      uiFlagsEl.innerHTML = '';
      ['ru','uk'].forEach(function(code){
        const btn = document.createElement('button');
        btn.className = 'flagBtn';
        btn.textContent = code==='ru' ? '🇷🇺' : '🇺🇦';
        btn.title = code==='ru' ? 'Русский' : 'Українська';
        if (activeUi()===code) btn.classList.add('active');
        btn.addEventListener('click', function(){
          setActiveUi(code);
          try{ if (window.App && App.settings){ App.settings.lang = code; App.saveSettings && App.saveSettings(App.settings); } }catch(_){}
          renderUiFlags();
        });
        uiFlagsEl.appendChild(btn);
      });
    }

    function renderStudyFlags(){
      studyFlagsEl.innerHTML = '';
      const langs = Array.from(new Set(builtinKeys().map(k=>k.split('_')[0]))).filter(Boolean);
      let cur = activeStudy();
      if (!cur){
        const dk = get(LS.deckKey);
        if (dk) cur = String(dk).split('_')[0] || '';
      }
      langs.forEach(function(code){
        const btn = document.createElement('button');
        btn.className = 'flagBtn';
        btn.textContent = (code==='uk'?'🇺🇦': code==='ru'?'🇷🇺':'🏷️');
        btn.title = code.toUpperCase();
        if (cur===code) btn.classList.add('active');
        btn.addEventListener('click', function(){
          setActiveStudy(code);
          renderStudyFlags();
        });
        studyFlagsEl.appendChild(btn);
      });
    }

    function close(){ modal.classList.add('hidden'); }

    okBtn.addEventListener('click', function(){
      const ui = activeUi() || effLang();
      const st = activeStudy() || get(LS.studyLang) || '';
      let dk = get(LS.deckKey);

      if (!dk && st){ dk = firstDeckForLang(st); if (dk) set(LS.deckKey, dk); }
      if (!dk) return;

      set(LS.uiLang, ui);
      set(LS.studyLang, st);
      set(LS.deckKey, dk);
      set(LS.setupDone, 'true');
      set(LS.legacyActiveKey, dk);

      if (window.App && App.settings){
        App.settings.lang = ui;
        try{ App.saveSettings && App.saveSettings(App.settings); }catch(_){}
      }

      close();
      try{ document.dispatchEvent(new Event('i18n:lang-changed')); }catch(_){}
    });

    closeBtn.addEventListener('click', close);
    modal.querySelector('.backdrop').addEventListener('click', close);

    renderUiFlags();
    renderStudyFlags();
  }

  function shouldShow(){
    try{ if (/(?:\?|&)setup=1(?:&|$)/.test(location.search)) return true; }catch(_){}
    try{
      var dk = localStorage.getItem('lexitron.deckKey') || localStorage.getItem('lexitron.activeKey');
      if (!dk) return true;
      if (!window.decks || !Array.isArray(window.decks[dk]) || window.decks[dk].length < 4) return true;
    }catch(_){ return true; }
    return localStorage.getItem(LS.setupDone) !== 'true';
  }

  window.SetupModal = { build, shouldShow, LS };
})();