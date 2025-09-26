/*!
 * dicts.js — Lexitron
 * Version: 1.6.2
 * Date: 2025-09-27
 *
 * Purpose:
 *  - Ensure decks objects exist
 *  - Wire up Dicts modal (header/ok/backdrop close, localized title)
 */
(function(){
  // Keep deck placeholders (as in your 1.5/1.6 builds)
  window.decks = window.decks || {};
  if (!Array.isArray(window.decks.de_verbs)) window.decks.de_verbs = [];
  if (!Array.isArray(window.decks.de_nouns)) window.decks.de_nouns = [];

  function t(){
    try{ return (window.App && typeof App.i18n==='function') ? (App.i18n()||{}) : {}; }
    catch(_){ return {}; }
  }

  function bindDictsModal(){
    var modal = document.getElementById('modal');
    if (!modal) return;

    var titleEl = document.getElementById('modalTitle');
    var okBtn   = document.getElementById('okBtn');
    var xBtn    = document.getElementById('modalClose');
    var backdrop= document.getElementById('backdrop');

    // If there is a header but no X button — create it to unify UX
    if (!xBtn){
      var header = modal.querySelector('.modalHeader') || modal.querySelector('.dialog');
      if (header){
        xBtn = document.createElement('button');
        xBtn.id = 'modalClose';
        xBtn.className = 'iconBtn small';
        xBtn.setAttribute('aria-label','Close');
        xBtn.textContent = '✖️';
        header.appendChild(xBtn);
      }
    }

    function fill(){
      var tr = t();
      if (titleEl && tr.modalTitle) titleEl.textContent = tr.modalTitle;
      if (okBtn) okBtn.textContent = tr.ok || 'OK';
    }
    function close(){ modal.classList.add('hidden'); }

    if (okBtn) okBtn.addEventListener('click', close);
    if (xBtn)  xBtn.addEventListener('click', close);
    if (backdrop) backdrop.addEventListener('click', close);

    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', fill, {once:true});
    else fill();
  }

  // Bind once DOM exists
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindDictsModal, {once:true});
  else bindDictsModal();
})();
// конец!
/* -------------------------------  К О Н Е Ц  ------------------------------- */
