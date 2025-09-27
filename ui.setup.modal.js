/*!
 * ui.setup.modal.js — Lexitron
 * Version: 1.6.2 (visual unification only)
 * Date: 2025-09-27
 *
 * - Keeps existing logic (shouldShow/gate, LS keys, enable/disable OK)
 * - Switches markup to modalFrame + modalHeader/modalBody/modalActions (like Info)
 * - Keeps the ❌ close button
 * - Adds backdrop click-to-close
 * - OK label prefers i18n 'startBtn' if present, falls back to 'ok'
 */
(function(){
  const LS = {
    uiLang: 'lexitron.uiLang',
    studyLang: 'lexitron.studyLang',
    deckKey: 'lexitron.deckKey',
    setupDone: 'lexitron.setupDone',
    legacyActiveKey: 'lexitron.activeKey'
  };
  function get(k){ try{ const v = localStorage.getItem(k); return v===null? '' : v; }catch(_){ return ''; } }
  function set(k,d){ try{ localStorage.setItem(k, String(d)); }catch(_){ } }
  function L(lang){ try{ return (window.I18N && I18N[lang]) || (I18N && I18N.uk) || {}; }catch(_){ return {}; } }
  function T(key, def, lang){
    try{
      const bag = lang ? ((window.I18N && I18N[lang]) || {}) : ((window.I18N && I18N[(get(LS.uiLang)||'').toLowerCase()]) || {});
      return bag[key] || def || key;
    }catch(_){ return def || key; }
  }
  function deviceLang(){
    try{
      const nav = (navigator.language || navigator.userLanguage || 'ru').slice(0,2).toLowerCase();
      return (nav==='uk'?'uk':'ru');
    }catch(_){ return 'ru'; }
  }
  function effectiveLang(){
    const ls = get(LS.uiLang);
    if (ls) return String(ls).toLowerCase();
    const appLang = (window.App&&App.settings&&App.settings.lang) ? String(App.settings.lang).toLowerCase() : '';
    return (appLang || deviceLang());
  }

  function build(){
    // pin current effective UI lang to LS (so flags match)
    const eff = effectiveLang();
    if (!get(LS.uiLang)) set(LS.uiLang, eff);

    // build modal only once
    let m = document.getElementById('setupModal');
    if (m){
      m.classList.remove('hidden');
      return;
    }
    m = document.createElement('div');
    m.id = 'setupModal';
    m.className = 'modal hidden';
    m.setAttribute('role','dialog');
    m.setAttribute('aria-modal','true');

    const labelSetup = T('setupTitle', L(eff).setupTitle, eff) || T('modalTitle','Словари', eff);
    const labelUi    = T('uiLanguage', L(eff).uiLanguage, eff);
    const labelStudy = T('studyLanguage', L(eff).studyLanguage, eff);
    // prefer startBtn if exists; fallback to ok/confirm
    const okI18n = T('startBtn', null, eff);
    const labelOk = okI18n || T('ok', L(eff).ok, eff) || T('confirm', L(eff).ok, eff) || 'OK';

    m.innerHTML = [
      '<div class="backdrop"></div>',
      '<div class="modalFrame">',
        '<div class="modalHeader">',
          '<div class="modalTitle" id="setupTitle">', labelSetup, '</div>',
          '<button id="setupClose" class="iconBtn small" aria-label="Close">✖️</button>',
        '</div>',
        '<div class="modalBody" id="setupBody">',
          '<div id="langFlags">',
            '<div class="field">',
              '<div class="label">', labelUi, '</div>',
              '<div class="langFlags flagsRow" id="setupUiFlags"></div>',
            '</div>',
            '<div class="field" style="margin-top:8px">',
              '<div class="label">', labelStudy, '</div>',
              '<div class="langFlags flagsRow" id="setupStudyFlags"></div>',
            '</div>',
          '</div>',
        '</div>',
        '<div class="modalActions">',
          '<button id="setupConfirm" class="primary" disabled>', labelOk, '</button>',
        '</div>',
      '</div>'
    ].join('');

    document.body.appendChild(m);

    // Theme bootstrap (non-invasive)
    try{
      const body=document.body;
      if (!body.getAttribute('data-theme')){
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      }
    }catch(_){}

    const uiFlagsEl    = m.querySelector('#setupUiFlags');
    const studyFlagsEl = m.querySelector('#setupStudyFlags');
    const okBtn        = m.querySelector('#setupConfirm');
    const closeBtn     = m.querySelector('#setupClose');

    function activeUi(){ return (get(LS.uiLang)||'').toLowerCase(); }
    function setActiveUi(v){ set(LS.uiLang, String(v||'').toLowerCase()); }
    function activeStudy(){ return (get(LS.studyLang)||'').toLowerCase(); }
    function setActiveStudy(v){ set(LS.studyLang, String(v||'').toLowerCase()); }

    function rerenderStaticLabels(code){
      const lab = L(code);
      m.querySelector('#setupTitle').textContent = lab.setupTitle || labelSetup;
      // prefer startBtn if exists
      okBtn.textContent = (lab.startBtn || lab.ok || lab.confirm || labelOk);
      const labels = m.querySelectorAll('.field .label');
      if (labels[0]) labels[0].textContent = lab.uiLanguage || labelUi;
      if (labels[1]) labels[1].textContent = lab.studyLanguage || labelStudy;
    }

    function renderUiFlags(){
      uiFlagsEl.innerHTML='';
      const current = effectiveLang();
      const candidates = Object.keys(window.I18N||{}).filter(x=>['ru','uk','en'].includes(x));
      (candidates.length?candidates:['ru','uk']).forEach(code=>{
        const b=document.createElement('button');
        b.className='flagBtn'+(code===current?' active':''); b.dataset.code=code;
        b.title=code.toUpperCase();
        b.textContent = (window.FLAG_EMOJI && window.FLAG_EMOJI[code]) || (code==='ru'?'🇷🇺':code==='uk'?'🇺🇦':code.toUpperCase());
        b.addEventListener('click',()=>{
          uiFlagsEl.querySelectorAll('.flagBtn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          setActiveUi(code);
          if (window.App && App.settings){ App.settings.lang = code; try{ App.saveSettings && App.saveSettings(App.settings); }catch(_){ } }
          rerenderStaticLabels(code);
        });
        uiFlagsEl.appendChild(b);
      });
    }

    function builtinKeys(){
      try{
        if (window.App && App.Decks && typeof App.Decks.builtinKeys==='function') return App.Decks.builtinKeys();
        return Object.keys(window.decks||{});
      }catch(_){ return []; }
    }
    function firstDeckForLang(lang){
      const pref=(lang||'').toLowerCase()+'_';
      const keys=builtinKeys().filter(k=>String(k).startsWith(pref));
      const preferred=pref+'verbs';
      if (keys.includes(preferred)) return preferred;
      return keys[0]||'';
    }

    function activeStudyOrGuess(){
      let cur = activeStudy();
      if (!cur){
        const dk = get(LS.deckKey);
        if (dk) cur = String(dk).split('_')[0]||'';
      }
      return cur;
    }

    function renderStudyFlags(){
      studyFlagsEl.innerHTML='';
      const langs = Array.from(new Set(builtinKeys().map(k=>k.split('_')[0]))).filter(Boolean);
      let cur = activeStudyOrGuess();
      langs.forEach(code=>{
        const b=document.createElement('button');
        b.className='flagBtn'+(cur===code?' active':''); b.dataset.code=code;
        b.title = code.toUpperCase();
        b.textContent = (code==='uk'?'🇺🇦':code==='ru'?'🇷🇺':'🏷️');
        b.addEventListener('click',()=>{
          studyFlagsEl.querySelectorAll('.flagBtn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          setActiveStudy(code);
          const first = firstDeckForLang(code);
          if (first){ set(LS.deckKey, first); okBtn.disabled=false; }
        });
        studyFlagsEl.appendChild(b);
      });
      const cur2 = activeStudyOrGuess();
      if (cur2){
        const first = firstDeckForLang(cur2);
        if (first){ set(LS.deckKey, first); okBtn.disabled=false; }
      }
    }

    renderUiFlags();
    renderStudyFlags();
    okBtn.disabled = !get(LS.deckKey);

    // open modal
    m.classList.remove('hidden');

    function close(){
      m.classList.add('hidden');
    }
    okBtn.addEventListener('click', ()=>{
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
      try{ document.dispatchEvent(new Event('i18n:lang-changed')); }catch(_){}
      close();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    const backdrop = m.querySelector('.backdrop');
    if (backdrop) backdrop.addEventListener('click', (e)=>{ if (e.target===backdrop) close(); });
  }

  function shouldShow(initial){
    try{
      var force = /(?:\?|&)setup=1(?:&|$)/.test(location.search);
      if (force) return true;
    }catch(_){}
    try{
      var dk = localStorage.getItem('lexitron.deckKey') || localStorage.getItem('lexitron.activeKey');
      if (!dk) return true;
      if (!window.decks || !Array.isArray(window.decks[dk]) || window.decks[dk].length < 4) return true;
    }catch(_){ return true; }
    return get(LS.setupDone) !== 'true';
  }

  window.SetupModal = { build, shouldShow, LS };
})();
