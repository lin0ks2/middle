/*!
 * info.modal.patch.js — Modal "Инструкция" unified header/footer
 * Version: 1.6.2
 * - Adds OK button handling
 * - Localizes tooltip on Info button as "Инструкция"/"Інструкція"
 * - Keeps list rendering from i18n.infoSteps
 */
(function(){
  'use strict';
  var infoBtn   = document.getElementById('btnInfo');
  var modal     = document.getElementById('infoModal');
  var titleEl   = document.getElementById('infoTitle');
  var contentEl = document.getElementById('infoContent');
  var closeEl   = document.getElementById('infoClose');
  var okEl      = document.getElementById('infoOk');

  function t(){ try{ return (typeof App!=='undefined' && typeof App.i18n==='function') ? (App.i18n()||{}) : {}; }catch(_){ return {}; } }

  function fillFromI18n(){
    var tr = t();
    if (titleEl && tr.infoTitle) titleEl.textContent = tr.infoTitle;
    if (okEl) okEl.textContent = tr.ok || 'OK';
    if (infoBtn && tr.infoTitle) infoBtn.title = tr.infoTitle;

    if (Array.isArray(tr.infoSteps) && contentEl){
      contentEl.innerHTML = '';
      var ul = document.createElement('ul');
      tr.infoSteps.forEach(function(s){
        var li = document.createElement('li');
        li.textContent = String(s||'');
        ul.appendChild(li);
      });
      contentEl.appendChild(ul);
    }
  }

  function open(){ try{ fillFromI18n(); modal && modal.classList.remove('hidden'); }catch(_){ } }
  function close(){ try{ modal && modal.classList.add('hidden'); }catch(_){ } }

  if (infoBtn) infoBtn.addEventListener('click', open, {passive:true});
  if (closeEl) closeEl.addEventListener('click', close, {passive:true});
  if (okEl)    okEl.addEventListener('click', close,  {passive:true});
  if (modal)   modal.addEventListener('click', function(e){ if (e.target===modal) close(); }, {passive:true});

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fillFromI18n, {once:true});
  else fillFromI18n();
})();