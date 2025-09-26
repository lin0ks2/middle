/*!
 * setup.modal.patch.js — Master Setup modal unified header/footer
 * Version: 1.6.2
 * - Header title + close X + footer OK
 * - Localized title and OK label
 * - Safe to include after ui.setup.modal.js (re-binds handlers if needed)
 */
(function(){
  'use strict';
  var modal   = document.getElementById('setupModal');
  var titleEl = document.getElementById('setupTitle');
  var okEl    = document.getElementById('setupOk');
  var closeEl = document.getElementById('setupClose');

  function t(){ try{ return (typeof App!=='undefined' && typeof App.i18n==='function') ? (App.i18n()||{}) : {}; }catch(_){ return {}; } }

  function fill(){
    var tr = t();
    if (titleEl) titleEl.textContent = tr.modalTitle || tr.dictsHeader || 'Настройка';
    if (okEl)    okEl.textContent    = tr.ok || 'OK';
  }
  function open(){ if (!modal) return; fill(); modal.classList.remove('hidden'); }
  function close(){ if (!modal) return; modal.classList.add('hidden'); }

  if (okEl)    okEl.addEventListener('click', close);
  if (closeEl) closeEl.addEventListener('click', close);
  // export helper
  if (typeof window.App==='object') window.App.openSetupWizard = open;

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fill, {once:true});
  else fill();
})();