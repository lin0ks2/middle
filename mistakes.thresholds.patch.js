/*!
 * mistakes.thresholds.patch.js
 * Version: 1.6.1
 * Purpose:
 *  - Add thresholds for adding a word to "Mistakes" (МО):
 *      * 2 incorrect choices for the same word OR
 *      * 3 presses of "I don't know" for the same word
 *  - Prevent duplicates; if word is in Favorites, never add to Mistakes
 * Integration:
 *  - Load AFTER app.ui.view.js and after modules that define addToMistakesOnFailure / App.Favorites
 */
(function(){
  'use strict';

  var fail = Object.create(null);
  var idk = Object.create(null);

  function inc(map, id){
    id = String(id);
    map[id] = (map[id] | 0) + 1;
    return map[id];
  }

  function isFavorite(word){
    try {
      if (!word) return false;
      if (window.App && App.isFavorite && typeof App.isFavorite === 'function') {
        return !!App.isFavorite(word.id);
      }
      // Fallback: check favorites storage if exposed
      if (App && App.Favorites && typeof App.Favorites.has === 'function') {
        return !!App.Favorites.has(word.id);
      }
    } catch(_) {}
    return false;
  }

  // Wrap a known function that app calls to add word to mistakes
  var original = null;
  var name = null;

  if (typeof window.addToMistakesOnFailure === 'function') {
    original = window.addToMistakesOnFailure;
    name = 'window.addToMistakesOnFailure';
  } else if (window.App && App.Mistakes && typeof App.Mistakes.addOnFailure === 'function') {
    original = App.Mistakes.addOnFailure.bind(App.Mistakes);
    name = 'App.Mistakes.addOnFailure';
  }

  function proceed(word, reason){ // reason: 'fail' | 'idk'
    if (!word) return;
    var wid = (word.id != null) ? String(word.id) : null;
    if (!wid) return;

    // increment counters
    var f = (reason === 'fail') ? inc(fail, wid) : (fail[wid]|0);
    var k = (reason === 'idk') ? inc(idk, wid) : (idk[wid]|0);

    // thresholds
    var enough = (f >= 2) || (k >= 3);
    if (!enough) return;

    // favorites protection
    if (isFavorite(word)) return;

    if (original) {
      try { original(word); } catch(_) {}
    }
  }

  // Provide two helpers the app can call explicitly
  window.MistakesGate = {
    onFail: function(word){ proceed(word, 'fail'); },
    onIdk: function(word){ proceed(word, 'idk'); }
  };

  // If there is a global emitter for wrong answers, try to hook it.
  // Otherwise the app must call MistakesGate.onFail / onIdk in the respective handlers.
  try{
    document.addEventListener('lexitron:answer-wrong', function(ev){
      proceed(ev && ev.detail && ev.detail.word, 'fail');
    });
    document.addEventListener('lexitron:idk', function(ev){
      proceed(ev && ev.detail && ev.detail.word, 'idk');
    });
  }catch(_){}

})();