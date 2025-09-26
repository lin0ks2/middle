/*!
 * trainer.medium.patch.js
 * Version: 1.6.1
 * Purpose:
 *  - Set reverse unlock threshold at 2.5 stars
 *  - Provide anti-repeat buffer to avoid showing the same word too soon
 * Integration:
 *  - Load AFTER app.trainer.js and app.ui.view.js
 */
(function(){
  'use strict';

  function ensureNS(){
    if (!window.App) window.App = {};
    if (!App.Trainer) App.Trainer = {};
  }
  ensureNS();

  // --- Reverse unlock threshold by stars ---
  try {
    App.Trainer.unlockThreshold = function(){ return 2.5; };
  } catch(_) {}

  // --- Anti-repeat: ring buffer of last K word ids shown ---
  var recent = [];
  var K = 5;

  function remember(id){
    if (id == null) return;
    id = String(id);
    var idx = recent.indexOf(id);
    if (idx >= 0) recent.splice(idx,1);
    recent.push(id);
    while (recent.length > K) recent.shift();
  }

  // Expose for debugging/tests
  try { App.Trainer._recentShown = recent; } catch(_) {}

  // If app exposes a central "pick next" candidate hook, try to wrap it.
  // We'll look for common names and wrap them if present.
  function wrapPicker(obj, name){
    try{
      var orig = obj && obj[name];
      if (typeof orig !== 'function') return false;
      obj[name] = function(){
        var res = orig.apply(this, arguments);
        // res can be an object { word, candidates } or a word
        // We try to filter candidates if provided, otherwise if it's a list, we filter the list
        try {
          if (Array.isArray(res)) {
            // list of candidates -> filter out recent while possible
            var pool = res.filter(function(w){
              var wid = (w && (w.id != null)) ? String(w.id) : null;
              return !wid || recent.indexOf(wid) === -1;
            });
            if (pool.length === 0) return res; // can't filter, return original
            return pool;
          } else if (res && typeof res === 'object') {
            if (Array.isArray(res.candidates)) {
              var pool = res.candidates.filter(function(w){
                var wid = (w && (w.id != null)) ? String(w.id) : null;
                return !wid || recent.indexOf(wid) === -1;
              });
              if (pool.length) res.candidates = pool;
            }
            return res;
          }
          return res;
        } catch(e){ return res; }
      };
      return true;
    }catch(_){ return false; }
  }

  var wrapped = false;
  wrapped = wrapPicker(App.Trainer, 'pickNext') || wrapped;
  wrapped = wrapPicker(App.Trainer, 'nextCandidates') || wrapped;
  wrapped = wrapPicker(App.Trainer, 'next') || wrapped;

  // Fallback: listen for a custom event the app may fire on word render to remember last shown id.
  // If no event exists, provide a helper App.Trainer.rememberShown(id) for the app to call.
  try {
    document.addEventListener('lexitron:word-shown', function(ev){
      var w = ev && ev.detail && ev.detail.word;
      if (!w) return;
      remember(w.id);
    });
  } catch(_) {}
  try { App.Trainer.rememberShown = remember; } catch(_) {}

})();