/*!
 * ui.setup.modal.js — Lexitron
 * Version: 1.6.2-4 (blocking wizard, no close)
 * Date: 2025-09-27
 *
 * - Крестик удалён. Backdrop не закрывает модалку.
 * - Мастер ждёт выбора пользователя; кнопка ОК активируется
 *   только при наличии корректного deckKey.
 * - Фолбэки локализаций (RU/UK), вызов App.bootstrap() после ОК.
 */
(function(){
  const LS = {
    uiLang: 'lexitron.uiLang',
    studyLang: 'lexitron.studyLang',
    deckKey: 'lexitron.deckKey',
    setupDone: 'lexitron.setupDone',
    legacyActiveKey: 'lexitron.activeKey'
  };

  const FB = {
    ru: { setupTitle:'Мастер настроек', uiLanguage:'Язык интерфейса', studyLanguage:'Язык изучения', startBtn:'Начнём!' },
    uk: { setupTitle:'Майстер налаштувань', uiLanguage:'Мова інтерфейсу', studyLanguage:'Мова вивчення', startBtn:'Почнемо!' }
  };

  function get(k){ try{ const v=localStorage.getItem(k); return v===null? '' : v; }catch(_){ return ''; } }
  function set(k,v){ try{ localStorage.setItem(k, String(v)); }catch(_){ } }
  const bag = lang => (window.I18N && I18N[lang]) || {};
  const devLang = () => { try{ return String((navigator.language||'ru').slice(0,2)).toLowerCase(); }catch(_){ return 'ru'; } };
  function effectiveUiLang(){
    const ls=(get(LS.uiLang)||'').toLowerCase();
    if (ls) return ls;
    const app=(window.App && App.settings && App.settings.lang)? String(App.settings.lang).toLowerCase() : '';
    return app || (devLang()==='uk'?'uk':'ru');
  }
  const tr = (lang,key) => (bag(lang)[key]) || (FB[lang] && FB[lang][key]) || key;

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
    const eff=effectiveUiLang();
    if (!get(LS.uiLang)) set(LS.uiLang, eff);

    let m=document.getElementById('setupModal');
    if (m){ m.classList.remove('hidden'); return; }

    const labelSetup=tr(eff,'setupTitle');
    const labelUi=tr(eff,'uiLanguage');
    const labelStudy=tr(eff,'studyLanguage');
    const labelOk=tr(eff,'startBtn') || tr(eff,'ok');

    m=document.createElement('div');
    m.id='setupModal';
    m.className='modal hidden';
    m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
    m.innerHTML=[
      '<div class="backdrop"></div>',
      '<div class="modalFrame">',
        '<div class="modalHeader">',
          '<div class="modalTitle" id="setupTitle">', labelSetup, '</div>',
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

    const uiFlagsEl=m.querySelector('#setupUiFlags');
    const studyFlagsEl=m.querySelector('#setupStudyFlags');
    const okBtn=m.querySelector('#setupConfirm');
    const backdrop=m.querySelector('.backdrop');

    function activeUi(){ return (get(LS.uiLang)||'').toLowerCase(); }
    function setActiveUi(v){ set(LS.uiLang, String(v||'').toLowerCase()); }
    function activeStudy(){ return (get(LS.studyLang)||'').toLowerCase(); }
    function setActiveStudy(v){ set(LS.studyLang, String(v||'').toLowerCase()); }

    function rerenderStaticLabels(code){
      const lang=code||effectiveUiLang();
      m.querySelector('#setupTitle').textContent=tr(lang,'setupTitle');
      okBtn.textContent=tr(lang,'startBtn')||tr(lang,'ok');
      const labs=m.querySelectorAll('.field .label');
      if (labs[0]) labs[0].textContent=tr(lang,'uiLanguage');
      if (labs[1]) labs[1].textContent=tr(lang,'studyLanguage');
    }

    // UI lang flags
    (function(){
      uiFlagsEl.innerHTML='';
      const cur=effectiveUiLang();
      const candidates=Object.keys(window.I18N||{});
      const allowed=['ru','uk'].filter(x=>candidates.includes(x));
      (allowed.length?allowed:['ru','uk']).forEach(code=>{
        const b=document.createElement('button');
        b.className='flagBtn'+(code===cur?' active':''); b.dataset.code=code;
        b.title=code.toUpperCase();
        b.textContent=(code==='ru'?'🇷🇺':code==='uk'?'🇺🇦':code.toUpperCase());
        b.addEventListener('click',()=>{
          uiFlagsEl.querySelectorAll('.flagBtn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          setActiveUi(code);
          if (window.App && App.settings){ App.settings.lang=code; try{ App.saveSettings && App.saveSettings(App.settings);}catch(_){ } }
          rerenderStaticLabels(code);
        });
        uiFlagsEl.appendChild(b);
      });
    })();

    // Study lang flags
    (function(){
      studyFlagsEl.innerHTML='';
      const langs=Array.from(new Set(builtinKeys().map(k=>k.split('_')[0]))).filter(Boolean);
      let cur=activeStudy() || (get(LS.deckKey)||'').split('_')[0] || langs[0] || '';
      langs.forEach(code=>{
        const b=document.createElement('button');
        b.className='flagBtn'+(cur===code?' active':''); b.dataset.code=code;
        b.title=code.toUpperCase();
        b.textContent=(code==='uk'?'🇺🇦':code==='ru'?'🇷🇺':'🏷️');
        b.addEventListener('click',()=>{
          studyFlagsEl.querySelectorAll('.flagBtn').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
          setActiveStudy(code);
          const first=firstDeckForLang(code);
          if (first){ set(LS.deckKey, first); okBtn.disabled=false; }
        });
        studyFlagsEl.appendChild(b);
      });
      const first=firstDeckForLang(cur);
      if (first){ set(LS.deckKey, first); okBtn.disabled=false; }
    })();

    // показать
    m.classList.remove('hidden');

    // Backdrop — просто блокируем клики, пока не будет подтверждения
    if (backdrop) backdrop.addEventListener('click', (e)=>{
      if (e.target!==backdrop) return;
      okBtn.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:180});
    });

    okBtn.addEventListener('click', ()=>{
      const ui=activeUi() || effectiveUiLang();
      const st=activeStudy();
      let dk=get(LS.deckKey);
      if (!dk && st){ dk=firstDeckForLang(st); if (dk) set(LS.deckKey, dk); }
      if (!dk){ okBtn.animate([{transform:'scale(1)'},{transform:'scale(0.98)'},{transform:'scale(1)'}],{duration:180}); return; }

      set(LS.uiLang, ui);
      set(LS.studyLang, st);
      set(LS.deckKey, dk);
      set(LS.setupDone, 'true');
      set(LS.legacyActiveKey, dk);

      if (window.App && App.settings){ App.settings.lang=ui; try{ App.saveSettings && App.saveSettings(App.settings);}catch(_){ } }

      try{ document.dispatchEvent(new CustomEvent('lexitron:setup-done',{detail:{ui,st,dk}})); }catch(_){}
      try{ App.bootstrap && App.bootstrap(); }catch(_){}
      m.classList.add('hidden');
    });
  }

  window.SetupModal={ build, shouldShow };
})();
