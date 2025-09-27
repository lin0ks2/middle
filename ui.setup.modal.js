/*!
 * ui.setup.modal.js — Lexitron
 * Version: 1.6.2‑fixed
 * Date: 2025‑09‑27
 *
 * Добавлена шапка «Начальная настройка» + отступ футера
 * Логика и тело мастера остались без изменений.
 */
(function(){
  'use strict';

  const LS = {
    uiLang: 'lexitron.uiLang',
    studyLang: 'lexitron.studyLang',
    setupDone: 'lexitron.setupDone'
  };

  function get(k){ try{return localStorage.getItem(k);}catch(_){return null;} }
  function set(k,v){ try{localStorage.setItem(k,v);}catch(_){ } }

  function render(){
    // если уже пройден — не показываем
    if(get(LS.setupDone)) return;

    // находим или создаём контейнер модалки
    let modal = document.getElementById('setupModal');
    if(!modal){
      modal = document.createElement('div');
      modal.id = 'setupModal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    // --- разметка мастера ---
    modal.innerHTML = `
      <div class="dialog">
        <div class="modalHeader">
          <h2 class="modalTitle">Начальная настройка</h2>
        </div>
        <div class="modalBody" style="padding:16px 18px;">
          <p>Выберите язык интерфейса:</p>
          <div class="langFlags" id="uiLangFlags"></div>
          <p style="margin-top:12px;">Выберите язык тренировки:</p>
          <div class="langFlags" id="studyLangFlags"></div>
        </div>
        <div class="modalActions" style="padding:14px 16px 20px;">
          <button id="okBtn" class="primary">OK</button>
        </div>
      </div>
      <div class="backdrop"></div>
    `;

    // заполняем флаги (примерный набор)
    const langs = [
      {code:'ru', flag:'🇷🇺'},
      {code:'uk', flag:'🇺🇦'},
      {code:'en', flag:'🇬🇧'},
      {code:'de', flag:'🇩🇪'}
    ];
    const uiBox = modal.querySelector('#uiLangFlags');
    const stBox = modal.querySelector('#studyLangFlags');
    langs.forEach(l=>{
      const b1 = document.createElement('button');
      b1.className = 'flagBtn';
      b1.textContent = l.flag;
      b1.onclick = ()=>{
        uiBox.querySelectorAll('.flagBtn').forEach(b=>b.classList.remove('active'));
        b1.classList.add('active');
        set(LS.uiLang,l.code);
      };
      uiBox.appendChild(b1);

      const b2 = document.createElement('button');
      b2.className = 'flagBtn';
      b2.textContent = l.flag;
      b2.onclick = ()=>{
        stBox.querySelectorAll('.flagBtn').forEach(b=>b.classList.remove('active'));
        b2.classList.add('active');
        set(LS.studyLang,l.code);
      };
      stBox.appendChild(b2);
    });

    modal.querySelector('#okBtn').onclick = ()=>{
      set(LS.setupDone,'1');
      modal.remove();
      window.location.reload();
    };
  }

  document.addEventListener('DOMContentLoaded',render);
})();