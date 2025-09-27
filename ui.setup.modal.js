/*!
 * ui.setup.modal.js — мастер начальной настройки
 * Версия: 1.6.2-uiheaderfix
 *
 * Логика не изменялась: только внешний вид
 *  1. Добавлена шапка .modalHeader с заголовком .modalTitle
 *  2. Перенесён текст «Начальная настройка» в эту шапку
 *  3. В rerenderStaticLabels обновлён селектор заголовка
 */

(function(){
  'use strict';

  const D = document;
  const W = window;
  const KEY = 'Lexitron.SetupDone';

  // локализация по умолчанию (fallback)
  const lab = {
    setupTitle: 'Начальная настройка',
    ok: 'OK'
  };

  // ----------------------------------------------------------
  // Создание верстки модалки
  // ----------------------------------------------------------
  function build(){
    const code = (App?.state?.lang) || 'ru';
    const I = W.I18N?.[code] || {};

    const labelSetup = I.setupTitle || lab.setupTitle;
    const labelOk    = I.ok || lab.ok;

    const m = D.createElement('div');
    m.id = 'setupModal';
    m.className = 'modal hidden';
    m.innerHTML = `
      <div class="backdrop"></div>
      <div class="dialog">
        <div class="modalHeader">
          <h3 class="modalTitle">${labelSetup}</h3>
        </div>
        <div class="langFlags" id="setupLangFlags">
          <!-- сюда вставятся кнопки флагов -->
        </div>
        <div class="modalActions">
          <button id="setupOkBtn" class="btn primary">${labelOk}</button>
        </div>
      </div>
    `;
    D.body.appendChild(m);
    return m;
  }

  // ----------------------------------------------------------
  // Перестраивает подписи при смене языка интерфейса
  // ----------------------------------------------------------
  function rerenderStaticLabels(code){
    const m = D.getElementById('setupModal');
    if(!m) return;
    m.querySelector('.modalTitle').textContent =
      (W.I18N?.[code]?.setupTitle) || lab.setupTitle;
    m.querySelector('#setupOkBtn').textContent =
      (W.I18N?.[code]?.ok) || lab.ok;
  }

  // ----------------------------------------------------------
  // Инициализация мастера
  // ----------------------------------------------------------
  function init(){
    if(localStorage.getItem(KEY)) return;     // мастер уже проходили
    const modal = build();

    const flags = modal.querySelector('#setupLangFlags');
    if(App.locales){
      Object.keys(App.locales).forEach(lang=>{
        const btn = D.createElement('button');
        btn.className = 'flagBtn';
        btn.textContent = App.locales[lang].flag || '🏳️';
        btn.title = App.locales[lang].name || lang;
        btn.addEventListener('click',()=>{
          App.saveSettings({ lang });
          rerenderStaticLabels(lang);
        });
        flags.appendChild(btn);
      });
    }

    modal.classList.remove('hidden');
    const okBtn = modal.querySelector('#setupOkBtn');
    okBtn.addEventListener('click',()=>{
      localStorage.setItem(KEY,'1');
      modal.classList.add('hidden');
      App.startup?.();
    });

    // глобальное событие для смены языка в реальном времени
    D.addEventListener('lexitron:lang-changed', e=>{
      rerenderStaticLabels(e.detail?.lang);
    });
  }

  if(D.readyState === 'loading') {
    D.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }

})();