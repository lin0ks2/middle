/*!
 * dicts.js — Lexitron
 * Version: 1.6.2
 * Date: 2025-09-27
 *
 * Что делает:
 *  - Приводит модалку «Словари» к единому виду:
 *    .modalHeader (заголовок слева + крестик справа), ниже остаётся тело и OK.
 *  - Локализует заголовок и текст OK.
 *  - Закрывает по OK, по крестику и по клику на фон.
 */

(function(){
  'use strict';

  // Заглушки колод (как в предыдущих сборках)
  window.decks = window.decks || {};
  if (!Array.isArray(window.decks.de_verbs)) window.decks.de_verbs = [];
  if (!Array.isArray(window.decks.de_nouns)) window.decks.de_nouns = [];

  function T(){
    try { return (window.App && typeof App.i18n === 'function') ? (App.i18n()||{}) : {}; }
    catch(_) { return {}; }
  }

  function ensureHeaderStructure(modal){
    // Ищем .dialog
    var dialog = modal && modal.querySelector('.dialog');
    if (!dialog) return;

    // Находим существующий заголовок
    var titleEl = dialog.querySelector('#modalTitle');
    if (!titleEl){
      titleEl = document.createElement('h2');
      titleEl.id = 'modalTitle';
      titleEl.textContent = 'Словари';
      dialog.insertBefore(titleEl, dialog.firstChild);
    }
    // Класс заголовка
    if (!titleEl.classList.contains('modalTitle')) titleEl.classList.add('modalTitle');

    // Ищем/создаём .modalHeader
    var header = dialog.querySelector('.modalHeader');
    if (!header){
      header = document.createElement('div');
      header.className = 'modalHeader';
      dialog.insertBefore(header, dialog.firstChild);
    }

    // Переносим заголовок в шапку (влево)
    if (titleEl.parentElement !== header){
      header.insertBefore(titleEl, header.firstChild);
    }

    // Ищем крестик; если был не там — переносим в шапку; если не было — создаём
    var xBtn = modal.querySelector('#modalClose');
    if (!xBtn){
      xBtn = document.createElement('button');
      xBtn.id = 'modalClose';
      xBtn.className = 'iconBtn small';
      xBtn.setAttribute('aria-label','Close');
      xBtn.textContent = '✖️';
    } else {
      // если уже существовал и висел внизу — отсоединяем
      if (xBtn.parentElement !== header) xBtn.parentElement.removeChild(xBtn);
    }
    header.appendChild(xBtn);
  }

  function bindDictsModal(){
    var modal = document.getElement
