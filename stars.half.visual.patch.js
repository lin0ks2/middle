/*!
 * stars.half.visual.patch.js
 * Version: 1.6.1
 *  - Рисует дробные ★
 *  Подключать последним, после всех скриптов
 */
(function(){
  'use strict';
  var D=document,W=window;

  // CSS
  var css=[
  '#stars.halfstars{display:flex;gap:6px;align-items:center;font-size:22px}',   // базовый размер, как в style.css
'#stars.halfstars .star{position:relative;width:1em;height:1em;color:#fbbf24}', // 1em от 22px = 22px; цвет как у .starIcon.filled
'#stars.halfstars .star::before{content:"☆";position:absolute;inset:0;opacity:.35;color:#cbd5e1}', // пустая звезда как в теме
'#stars.halfstars .star::after{content:"★";position:absolute;inset:0;overflow:hidden;width:var(--p,0%)}',
'#stars.halfstars .star::after{transition:width .15s ease}'
    '#stars.halfstars .star::before{content:"☆";position:absolute;inset:0;opacity:.35}',
    '#stars.halfstars .star::after{content:"★";position:absolute;inset:0;overflow:hidden;width:var(--p,0%)}',
    '#stars.halfstars .star::after{transition:width .15s ease}'
  ].join('');
  var st=D.createElement('style'); st.textContent=css; (D.head||D.documentElement).appendChild(st);

  function clamp(x,a,b){return Math.max(a,Math.min(b,x));}

  function valFor(w){
    try{
      if(!w)return 0;
      var id=String(w.id);
      return Number(App.state?.stars?.[id])||0;
    }catch(_){return 0;}
  }

  function render(v,max){
    var host=D.getElementById('stars'); if(!host)return;
    max=max||(App.Trainer?.starsMax?.()||5);
    host.classList.add('halfstars');
    host.innerHTML='';
    for(var i=1;i<=max;i++){
      var s=D.createElement('span'); s.className='star';
      var p=clamp((v-(i-1))*100,0,100);
      s.style.setProperty('--p',p+'%');
      host.appendChild(s);
    }
  }

  // события
  D.addEventListener('lexitron:word-shown',e=>render(valFor(e?.detail?.word)));
  D.addEventListener('lexitron:answer-correct',e=>render(valFor(e?.detail?.word)));
  D.addEventListener('lexitron:idk',e=>render(valFor(e?.detail?.word)));

  if(D.readyState==='loading') D.addEventListener('DOMContentLoaded',()=>render(0),{once:true});
  else render(0);

  W.HalfStars={render};
})();
