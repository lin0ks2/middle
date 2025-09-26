/*!
 * stars.rules.patch.js
 * Version: 1.6.1
 * Purpose:
 *  - Adjust star rules:
 *      * +0.5 star on correct answer
 *      * -0.5 star on "I don't know" (min 0)
 *  - Use stars to determine reverse unlock (threshold in trainer.medium.patch.js)
 * Integration:
 *  - Load AFTER app.ui.view.js.
 *  - If your handlers for correct answer and "I don't know" can call these helpers, do:
 *      StarsRules.onCorrect(wordId);
 *      StarsRules.onIdk(wordId);
 *  - If not, this file will try to attach to generic custom events if the app emits them.
 */
(function(){
  'use strict';

  function getMax(){ try { return (window.App && App.Trainer && App.Trainer.starsMax) ? App.Trainer.starsMax() : 5; } catch(_){ return 5; } }
  function clamp(x, lo, hi){ return Math.max(lo, Math.min(hi, x)); }

  function getStars(id){
    try { return (App && App.state && App.state.stars && (App.state.stars[id]||0)) || 0; } catch(_){ return 0; }
  }
  function setStars(id, v){
    try {
      if (!App || !App.state) return;
      if (!App.state.stars) App.state.stars = {};
      App.state.stars[id] = v;
      if (App.saveState) App.saveState();
    } catch(_){}
  }

  function onCorrect(wordId){
    if (wordId == null) return;
    var cur = getStars(wordId);
    var next = clamp(cur + 0.5, 0, getMax());
    setStars(wordId, next);
  }

  function onIdk(wordId){
    if (wordId == null) return;
    var cur = getStars(wordId);
    var next = clamp(cur - 0.5, 0, getMax());
    setStars(wordId, next);
  }

  window.StarsRules = { onCorrect, onIdk };

  // Try to auto-hook if app emits events:
  try {
    document.addEventListener('lexitron:answer-correct', function(ev){
      var w = ev && ev.detail && ev.detail.word;
      if (w && w.id != null) onCorrect(String(w.id));
    });
    document.addEventListener('lexitron:idk', function(ev){
      var w = ev && ev.detail && ev.detail.word;
      if (w && w.id != null) onIdk(String(w.id));
    });
  } catch(_) {}

})();