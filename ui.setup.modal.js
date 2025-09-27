/*!
 * ui.setup.modal.js — Lexitron
 * Version: 1.6.2-2 (visual unify + robust fallbacks + boot)
 * Date: 2025-09-27
 *
 * Visual only, but adds:
 *  - Localized fallbacks (ru/uk) if i18n keys are missing
 *  - After OK: dispatch 'lexitron:setup-done' and try App.bootstrap()
 *  - Keeps original ids and logic; shows close (X) and closes on backdrop
 */
(function(){
  const LS = {
    uiLang: 'lexitron.uiLang',
    studyLang: 'lexitron.studyLang',
    deckKey: 'lexitron.deckKey',
    setupDone: 'lexitron.setupDone',
    legacyActiveKey: 'lexitron.activeKey'
  };

  // Built-in fallbacks in case i18n keys are absent
  const FB = {
    ru: {
      setupTitle: 'Мастер настроек',
      uiLanguage: 'Язык интерфейса',
      studyLanguage: 'Язык изучения',
      startBtn: 'Начнём!'
    },
    uk: {
      setupTitle: 'Майстер налаштувань',
      uiLanguage: 'Мова інтерфейсу',
      studyLanguage: 'Мова вивчення',
      startBtn: 'Почнемо!'
    }
  };

  function get(k){ try{ const v = localStorage.getItem(k); return v===null? '' : v; }catch(_){ return ''; } }
  function set(k,d){ try{ localStorage.setItem(k, String(d)); }catch(_){ } }
  function bag(lang){ try{ return (window.I18N && I18N[lang]) || {}; }catch(_){ return {}; } }
  function devLang(){
    try{ return String((navigator.language||'ru').slice(0,2)).toLowerCase(); }catch(_){ return 'ru'; }
  }
  function effectiveUiLang(){
    const ls = (get(LS.uiLang)||'').toLowerCase();
    if (ls) return ls;
    const app = (window.App && App.settings && App.settings.lang) ? String(App.settings.lang).toLowerCase() : '';
    return app || (devLang()==='uk'?'uk':'ru');
  }
  function tr(lang, key){
    const main = bag(lang)[key];
    if (main) return main;
    const f = (FB[lang] && FB[lang][key]) || null;
    if (f) return f;
    // last resort
    return key;
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

  function shouldShow(){
    try{ if (/(?:\?|&)setup=1(?:&|$)/.test(location.search)) return true; }catch(_){}
    const done = get(LS.setupDone)==='true';
    const dk = get(LS.deckKey) || get(LS.legacyActiveKey);
    if (!dk) return true;
    try{ if (!window.decks || !Array.isArray(window.decks[dk]) || window.decks[dk].length < 4) return true; }catch(_){}
    return !done;
  }

  function build(){
    const eff = effectiveUiLang();
    if (!get(LS.uiLang)) set(LS.uiLang, eff);

    let m = document.getElementById('setupModal');
    if (m){ m.classList.remove('hidden'); return; }

    m = document.createElement('div');
    m.id = 'setupModal';
    m.className = 'modal hidden';
    m.setAttribute('role','dialog');
    m.setAttribute('aria-modal','true');

    const labelSetup = tr(eff, 'setupTitle');
    const labelUi    = tr(eff, 'uiLanguage');
    const labelStudy = tr(eff, 'studyLanguage');
    const labelOk    = tr(eff, 'startBtn') || tr(eff, 'ok');

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

    // Controls
    const uiFlagsEl    = m.querySelector('#setupUiFlags');
    const studyFlagsEl = m.querySelector('#setupStudyFlags');
    const okBtn        = m.querySelector('#setupConfirm');
    const closeBtn     = m.querySelector('#setupClose');

    function activeUi(){ return (get(LS.uiLang)||'').toLowerCase(); }
    function setActiveUi(v){ set(LS.uiLang, String(v||'').toLowerCase()); }
    function activeStudy(){ return (get(LS.studyLang)||'').toLowerCase(); }
    function setActiveStudy(v){ set(LS.studyLang, String(v||'').toLowerCase()); }

    function rerenderStaticLabels(code){
      const lang = code || effectiveUiLang();
      m.querySelector('#setupTitle').textContent = tr(lang,'setupTitle');
      okBtn.textContent = tr(lang,'startBtn') || tr(lang,'ok');
      const labs = m.querySelectorAll('.field .label');
      if (labs[0]) labs[0].textContent = tr(lang,'uiLanguage');
      if (labs[1]) labs[1].textContent = tr(lang,'studyLanguage');
    }

    // UI language flags
    (function renderUiFlags(){
      uiFlagsEl.innerHTML='';
      const cur = effectiveUiLang();
      const candidates = Object.keys(window.I18N||{});
      const allowed = ['ru','uk'].filter(x=>candidates.includes(x));
      (allowed.length?allowed:['ru','uk']).forEach(code=>{
        const b=document.createElement('button');
        b.className='flagBtn'+(code===cur?' active':''); b.dataset.code=code;
        b.title=code.toUpperCase();
        b.textContent = (code==='ru'?'🇷🇺':code==='uk'?'🇺🇦':code.toUpperCase());
        b.addEventListener('click',()=>{
          uiFlagsEl.querySelectorAll('.flagBtn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          setActiveUi(code);
          if (window.App && App.settings){ App.settings.lang = code; try{ App.saveSettings && App.saveSettings(App.settings); }catch(_){ } }
          rerenderStaticLabels(code);
        });
        uiFlagsEl.appendChild(b);
      });
    })();

    // Study language flags
    (function renderStudyFlags(){
      studyFlagsEl.innerHTML='';
      const langs = Array.from(new Set(builtinKeys().map(k=>k.split('_')[0]))).filter(Boolean);
      let cur = activeStudy() || (get(LS.deckKey)||'').split('_')[0] || langs[0] || '';
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
      const first = firstDeckForLang(cur);
      if (first){ set(LS.deckKey, first); okBtn.disabled=false; }
    })();

    // show
    m.classList.remove('hidden');

    function close(){ m.classList.add('hidden'); }

    okBtn.addEventListener('click', ()=>{
      const ui = activeUi() || effectiveUiLang();
      const st = activeStudy();
      let dk = get(LS.deckKey);
      if (!dk && st){ dk = firstDeckForLang(st); if (dk) set(LS.deckKey, dk); }
      if (!dk) return;

      set(LS.uiLang, ui);
      set(LS.studyLang, st);
      set(LS.deckKey, dk);
      set(LS.setupDone, 'true');
      set(LS.legacyActiveKey, dk);

      if (window.App && App.settings){ App.settings.lang = ui; try{ App.saveSettings && App.saveSettings(App.settings); }catch(_){ } }

      // Notify and boot
      try{ document.dispatchEvent(new CustomEvent('lexitron:setup-done', {detail:{ui, st, dk}})); }catch(_){}
      try{ App.bootstrap && App.bootstrap(); }catch(_){}
      close();
    });

    if (closeBtn) closeBtn.addEventListener('click', close);
    const backdrop = m.querySelector('.backdrop');
    if (backdrop) backdrop.addEventListener('click', (e)=>{ if (e.target===backdrop) close(); });
  }

  window.SetupModal = { build, shouldShow };
})();
