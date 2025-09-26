/*!
 * ui.setup.modal.js — Lexitron
 * Version: 1.6.2
 * Date: 2025-09-27
 *
 * Unified Setup Wizard modal:
 *  - Header with title (#setupTitle) and close button (#setupClose)
 *  - Body content with flags
 *  - Footer with OK (#setupOk)
 * Behavior:
 *  - Localizes title/OK using i18n
 *  - Persists choices to LS and App.settings
 *  - Closes on OK/X
 */
(function(){
  const LS = {
    uiLang: 'lexitron.uiLang',
    studyLang: 'lexitron.studyLang',
    deckKey: 'lexitron.deckKey',
    setupDone: 'lexitron.setupDone',
    legacyActiveKey: 'lexitron.activeKey',
  };

  function get(k){ try{ return localStorage.getItem(k)||''; }catch(_){ return ''; } }
  function set(k,v){ try{ localStorage.setItem(k, String(v)); }catch(_){ } }

  function L(lang){
    try{ return (window.I18N && I18N[lang]) ? I18N[lang] : (I18N && I18N.ru) || {}; }catch(_){ return {}; }
  }
  function effectiveLang(){
    try{
      var q = get(LS.uiLang); if (q) return q;
      var nav = (navigator.language||'ru').slice(0,2).toLowerCase();
      return (nav==='uk'?'uk':'ru');
    }catch(_){ return 'ru'; }
  }
  function T(key, fallback, lang){
    try{ return (L(lang||effectiveLang())[key]) || fallback || ''; }catch(_){ return fallback || ''; }
  }

  function builtinKeys(){
    try{
      if (window.App && App.Decks && typeof App.Decks.builtinKeys==='function') return App.Decks.builtinKeys();
      return Object.keys(window.decks||{});
    }catch(_){ return []; }
  }

  function build(){
    // pick language
    const eff = effectiveLang();
    if (!get(LS.uiLang)) set(LS.uiLang, eff);
    if (window.App && App.settings) {
      App.settings.lang = eff;
      try{ App.saveSettings && App.saveSettings(App.settings); }catch(_){}
    }

    const labelSetup = T('setupTitle', L(eff).setupTitle, eff) || 'Настройка';
    const labelUi = T('uiLanguage', L(eff).uiLanguage, eff) || 'Язык интерфейса';
    const labelStudy = T('studyLanguage', L(eff).studyLanguage, eff) || 'Язык изучения';
    const labelOk = T('ok', L(eff).ok, eff) || 'OK';

    const m = document.createElement('div');
    m.id = 'setupModal';
    m.className = 'modal hidden';
    m.setAttribute('role','dialog');
    m.setAttribute('aria-modal','true');
    m.innerHTML = [
      '<div class="backdrop"></div>',
      '<div class="dialog">',
        '<div class="modalHeader">',
          '<h2 class="modalTitle" id="setupTitle">'+labelSetup+'</h2>',
          '<button id="setupClose" class="iconBtn small" aria-label="Close">✖️</button>',
        '</div>',
        '<div class="modalBody">',
          '<div id="langFlags">',
            '<div class="field">',
              '<div class="label">'+labelUi+'</div>',
              '<div class="langFlags flagsRow" id="setupUiFlags"></div>',
            '</div>',
            '<div class="field">',
              '<div class="label">'+labelStudy+'</div>',
              '<div class="langFlags flagsRow" id="setupStudyFlags"></div>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="modalActions" style="text-align:center">',
          '<button id="setupOk" class="primary">'+labelOk+'</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(m);

    // Elements
    const uiFlagsEl = m.querySelector('#setupUiFlags');
    const studyFlagsEl = m.querySelector('#setupStudyFlags');
    const okBtn = m.querySelector('#setupOk');
    const closeBtn = m.querySelector('#setupClose');
    const titleEl = m.querySelector('#setupTitle');

    // flag render helpers
    function activeUi(){ return (get(LS.uiLang)||'').toLowerCase(); }
    function setActiveUi(v){ set(LS.uiLang, v); }
    function activeStudy(){ return (get(LS.studyLang)||'').toLowerCase(); }
    function setActiveStudy(v){ set(LS.studyLang, v); }

    function renderUiFlags(){
      uiFlagsEl.innerHTML='';
      ['ru','uk'].forEach(function(code){
        const btn = document.createElement('button');
        btn.className = 'iconBtn';
        btn.textContent = code==='ru' ? '🇷🇺' : '🇺🇦';
        btn.title = code==='ru' ? 'Русский' : 'Українська';
        if (activeUi()===code) btn.classList.add('active');
        btn.addEventListener('click', function(){ setActiveUi(code); renderUiFlags(); });
        uiFlagsEl.appendChild(btn);
      });
    }

    function renderStudyFlags(){
      studyFlagsEl.innerHTML='';
      const langs = Array.from(new Set(builtinKeys().map(k=>k.split('_')[0]))).filter(Boolean);
      let cur = (get(LS.studyLang) || '').toLowerCase();
      if (!cur){
        const dk = get(LS.deckKey);
        if (dk) cur = String(dk).split('_')[0] || '';
      }
      langs.forEach(function(code){
        const btn = document.createElement('button');
        btn.className = 'iconBtn';
        btn.textContent = (code==='uk'?'🇺🇦': code==='ru'?'🇷🇺':'🏷️');
        btn.title = code.toUpperCase();
        if (cur===code) btn.classList.add('active');
        btn.addEventListener('click', function(){ set(LS.studyLang, code); renderStudyFlags(); /* deck pick deferred */ });
        studyFlagsEl.appendChild(btn);
      });
    }

    function firstDeckForLang(lang){
      const pref = (lang||'').toLowerCase() + '_';
      const keys = builtinKeys().filter(k => String(k).startsWith(pref));
      const preferred = pref + 'verbs';
      if (keys.includes(preferred)) return preferred;
      return keys[0] || null;
    }

    function close(){ m.classList.add('hidden'); }

    okBtn.addEventListener('click', function(){
      const ui = activeUi() || effectiveLang();
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
    m.querySelector('.backdrop').addEventListener('click', close);

    renderUiFlags();
    renderStudyFlags();
  }

  function shouldShow(){
    try{
      var force = /(?:\?|&)setup=1(?:&|$)/.test(location.search);
      if (force) return true;
    }catch(_){}
    try{
      var dk = localStorage.getItem('lexitron.deckKey') || localStorage.getItem('lexitron.activeKey');
      if (!dk) return true;
      if (!window.decks || !Array.isArray(window.decks[dk]) || window.decks[dk].length < 4) return true;
    }catch(_){ return true; }
    return localStorage.getItem(LS.setupDone) !== 'true';
  }

  window.SetupModal = { build, shouldShow, LS };
})();