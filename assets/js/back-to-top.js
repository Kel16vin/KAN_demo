(function(){
  function init(){
    const btn = document.getElementById('back-to-top');
    if(!btn) return;
    const showAt = 300; // px
    let scheduled = false;
    function update(){
      if(window.scrollY > showAt) btn.classList.remove('hidden','opacity-0');
      else btn.classList.add('hidden','opacity-0');
      scheduled = false;
    }
    function onScroll(){
      if(scheduled) return; scheduled = true; requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, {passive: true});
    // color updates: run on scroll, load and resize
    let colorScheduled = false;
    function updateColorScheduled(){ if(colorScheduled) return; colorScheduled = true; requestAnimationFrame(function(){ updateColor(); colorScheduled = false; }); }
    window.addEventListener('scroll', updateColorScheduled, {passive:true});
    window.addEventListener('resize', function(){ requestAnimationFrame(updateColor); }, {passive:true});
    window.addEventListener('load', function(){ requestAnimationFrame(updateColor); });

    btn.addEventListener('click', function(e){
      e.preventDefault();
      // prefer smooth native scroll
      window.scrollTo({top: 0, behavior: 'smooth'});
    });

    btn.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });

    // initialize visibility
    update();
    // initialize color
    updateColor();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

// --- helper: color detection and mapping ---
function updateColor(){
  const btn = document.getElementById('back-to-top');
  if(!btn) return;

  // sample point slightly above the button center
  const rect = btn.getBoundingClientRect();
  const x = Math.max(2, Math.min(window.innerWidth-2, rect.left + rect.width/2));
  const y = Math.max(2, Math.min(window.innerHeight-2, rect.top - 8));

  // temporarily hide button so elementFromPoint hits the background
  const prevPointer = btn.style.pointerEvents;
  const prevVis = btn.style.visibility;
  btn.style.pointerEvents = 'none'; btn.style.visibility = 'hidden';
  let el = document.elementFromPoint(x,y);
  btn.style.pointerEvents = prevPointer; btn.style.visibility = prevVis;

  while(el && el !== document.documentElement){
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    if(bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent'){
      applyColorFromBg(btn,bg);
      return;
    }
    el = el.parentElement;
  }
  // fallback to body
  applyColorFromBg(btn, getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)');
}

function parseRGB(str){
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if(!m) return null; return [parseInt(m[1],10),parseInt(m[2],10),parseInt(m[3],10)];
}

function distSq(a,b){ return Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2)+Math.pow(a[2]-b[2],2); }

function applyColorFromBg(btn,bgStr){
  const NAVY = [30,27,75]; // approximate site navy
  const ORANGE = [255,107,53];
  const WHITE = [255,255,255];
  const rgb = parseRGB(bgStr) || WHITE;

  const dN = distSq(rgb,NAVY), dO = distSq(rgb,ORANGE), dW = distSq(rgb,WHITE);
  // mapping: NAVY bg -> ORANGE button, ORANGE bg -> WHITE button, WHITE bg -> NAVY button

  // cleanup classes
  ['bg-navy','bg-orange','bg-white','bg-gray-900'].forEach(c => btn.classList.remove(c));
  ['text-white','text-navy','text-gray-900'].forEach(c => btn.classList.remove(c));

  const min = Math.min(dN,dO,dW);
  if(min === dN){
    btn.classList.add('bg-orange','text-white');
  } else if(min === dO){
    btn.classList.add('bg-white','text-navy');
  } else {
    btn.classList.add('bg-navy','text-white');
  }
}