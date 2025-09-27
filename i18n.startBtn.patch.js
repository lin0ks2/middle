/*!
 * i18n.startBtn.patch.js — adds localized label for the Setup button
 * Safe additive patch: requires window.I18N to be defined earlier.
 * Version: 1.6.2
 * Date: 2025-09-27
 */
(function(){
  try{
    if (!window.I18N) return;
    window.I18N.ru = Object.assign({}, window.I18N.ru, { startBtn: "Начнём!" });
    window.I18N.uk = Object.assign({}, window.I18N.uk, { startBtn: "Почнемо!" });
  }catch(_){}
})();