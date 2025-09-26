/*!
 * dicts.js — Lexitron
 * Version: 1.6.2
 * Date: 2025-09-27
 *
 * Что делает:
 *  - Формирует корректную шапку модалки «Словари»:
 *    .modalHeader с #modalTitle (слева) и #modalClose (справа).
 *  - Оставляет под шапкой существующее тело (флаги, список) и футер с OK.
 *  - Локализует заголовок и текст OK.
 *  - Закрывает по OK, по крестику и по клику на фон.
 */
(function(){
  'use strict';

  // Заглушки колод — как было в прежних сборках
  window.decks = window.decks || {};
  if (!Array.isArray(window.decks.de_verbs)) window.decks.de_verbs = [];
  if (!Array.isArray(window.decks.de_nouns)) window.decks.de_nouns = [];

  function T(){
    try { return (window.App && typeof App.i18n === 'function') ? (App.i18n()||{}) : {}; }
    catch(_) { return {}; }
  }

  function ensureHeaderStructure(modal){
    var dialog = modal && modal.querySelector('.dialog');
    if (!dialog) return;

    // 1) Найти/создать .modalHeader
    var header = dialog.querySelector('.modalHeader');
    if (!header){
      header = document.createElement('div');
      header.className = 'modalHeader';
      dialog.insertBefore(header, dialog.firstChild);
    }

    // 2) Найти/создать #modalTitle и поместить в шапку (слева)
    var titleEl = dialog.querySelector('#modalTitle');
    if (!titleEl){
      titleEl = document.createElement('h2');
      titleEl.id = 'modalTitle';
      titleEl.textContent = 'Словари';
    } else if (titleEl.parentElement) {
      titleEl.parentElement.removeChild(titleEl);
    }
    if (!titleEl.classList.contains('modalTitle')) titleEl.classList.add('modalTitle');
    header.insertBefore(titleEl, header.firstChild);

    // 3) Найти/создать крестик и поместить в шапку (справа)
    var xBtn = dialog.querySelector('#modalClose') || modal.querySelector('#modalClose');
    if (!xBtn){
      xBtn = document.createElement('button');
      xBtn.id = 'modalClose';
      xBtn.className = 'iconBtn small';
      xBtn.setAttribute('aria-label','Close');
      xBtn.textContent = '✖️';
    } else if (xBtn.parentElement) {
      xBtn.parentElement.removeChild(xBtn);
    }
    header.appendChild(xBtn);
  }

  function bindDictsModal(){
    var modal = document.getElementById('modal');
    if (!modal) return;

    // Нормализуем шапку (заголовок + крестик внутри .modalHeader)
    ensureHeaderStructure(modal);

    // Получить элементы после нормализации
    var titleEl  = modal.querySelector('#modalTitle');
    var okBtn    = modal.querySelector('#okBtn');
    var xBtn     = modal.querySelector('#modalClose');
    var backdrop = modal.querySelector('#backdrop');

    // Локализация заголовка/ОК
    function fill(){
      var t = T();
      if (titleEl && t.modalTitle) titleEl.textContent = t.modalTitle;
      if (okBtn) okBtn.textContent = t.ok || 'OK';
    }

    // Закрытие
    function close(){ modal.classList.add('hidden'); }

    if (okBtn)    okBtn.addEventListener('click', close);
    if (xBtn)     xBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fill, {once:true});
    } else {
      fill();
    }
  }

  // Инициализация
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindDictsModal, {once:true});
  } else {
    bindDictsModal();
  }
})();