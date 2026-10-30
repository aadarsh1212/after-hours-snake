'use strict';
// Fixed simulation ticks with interpolated rendering; turns are buffered to prevent reversals.
const $ = id => document.getElementById(id);
const canvas = $('game'), ctx = canvas.getContext('2d');
const N = 24, directions = {up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const load = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Private mode remains fully playable. */ } };
let best = Number(load('afterhours.best','0')) || 0;
let snake, previous, food, direction, queue = [], score = 0, state = 'ready';
let last = 0, accumulator = 0, size = 600, color = load('afterhours.color','#b4f76c');
if (!/^#[0-9a-f]{6}$/i.test(color)) color = '#b4f76c';
const pad = n => String(n).padStart(3,'0');
$('best').textContent = pad(best);
function setColor(value) {
  color = value;
  document.documentElement.style.setProperty('--snake',color);
  let name = 'CUSTOM COLOR';
  document.querySelectorAll('[data-color]').forEach(button => {
    const selected = button.dataset.color.toLowerCase() === color.toLowerCase();
    button.setAttribute('aria-pressed',String(selected));
    if (selected) name = button.dataset.name.toUpperCase();
  });
  $('color-name').textContent = name;
  $('color-picker').value = color;
  save('afterhours.color',color);
}
document.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click',() => setColor(button.dataset.color)));
$('color-picker').addEventListener('input',event => setColor(event.target.value));
setColor(color);
function spawnFood() {
  const free = [];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(!snake.some(p=>p.x===x&&p.y===y)) free.push({x,y});
  return free.length ? free[Math.floor(Math.random()*free.length)] : null;
}
function reset() {
  snake = [{x:11,y:12},{x:10,y:12},{x:9,y:12},{x:8,y:12}];
  previous = snake.map(p=>({...p})); direction = directions.right; queue = []; score = 0; accumulator = 0;
  food = spawnFood(); $('score').textContent = pad(score); $('best-caption').textContent = 'YOUR NEXT CHALLENGE';
}
function start() { reset(); state='playing'; $('overlay').hidden=true; $('pause').disabled=false; $('pause').innerHTML='<span>Ⅱ</span> Pause <kbd>␣</kbd>'; $('game-status').textContent='IN THE ZONE'; last=performance.now(); }
function showOverlay(kicker,title,description,button,hint) {
  $('overlay-kicker').textContent=kicker; $('overlay-title').textContent=title;
  $('overlay-description').textContent=description; $('start').innerHTML=button+' <span>↗</span>';
  $('start-hint').textContent=hint; $('overlay').hidden=false;
}
function pause() {
  if(state==='playing') {
    state='paused'; $('game-status').textContent='TAKE A BREATHER';
    $('pause').innerHTML='<span>▶</span> Resume <kbd>␣</kbd>';
    showOverlay('NO RUSH','Catch your breath.','Your next bite can wait.','RESUME','SPACE TO RESUME');
  } else if(state==='paused') {
    state='playing'; $('overlay').hidden=true; last=performance.now();
    $('pause').innerHTML='<span>Ⅱ</span> Pause <kbd>␣</kbd>'; $('game-status').textContent='IN THE ZONE';
  }
}
function finish(won=false) {
  state='over'; $('pause').disabled=true; $('game-status').textContent=won?'ARENA COMPLETE':'GAME OVER';
  showOverlay(won?'PERFECT RUN':'THE NEXT RUN IS YOURS',won?'Off the grid.':'One more game?',`You scored ${score}. Personal best: ${best}.`,'PLAY AGAIN','PRESS ENTER TO RESTART');
}
function turn(name) {
  if(state!=='playing'||queue.length>=2) return;
  const next=directions[name], latest=queue.length?queue[queue.length-1]:direction;
  if(next.x===latest.x&&next.y===latest.y) return;
  if(next.x===-latest.x&&next.y===-latest.y) return;
  queue.push(next);
}
function tick() {
  if(queue.length) direction=queue.shift();
  const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
  const eating=food&&head.x===food.x&&head.y===food.y;
  const body=eating?snake:snake.slice(0,-1);
  if(head.x<0||head.x>=N||head.y<0||head.y>=N||body.some(p=>p.x===head.x&&p.y===head.y)) {finish();return;}
  previous=snake.map(p=>({...p})); snake.unshift(head);
  if(eating) {
    score+=10; $('score').textContent=pad(score);
    if(score>best) {best=score;save('afterhours.best',String(best));$('best').textContent=pad(best);$('best-caption').textContent='A NEW PERSONAL BEST';}
    previous.push({...previous[previous.length-1]});food=spawnFood();if(!food) finish(true);
  } else snake.pop();
}
function resize() {
  size=canvas.getBoundingClientRect().width;
  const dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(size*dpr);canvas.height=Math.round(size*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
}
function rounded(x,y,w,h,r) {ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();}
function draw(now) {
  ctx.clearRect(0,0,size,size);const cell=size/N;
  ctx.strokeStyle='#b4f76c09';ctx.lineWidth=1;ctx.beginPath();
  for(let i=1;i<N;i++){ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,size);ctx.moveTo(0,i*cell);ctx.lineTo(size,i*cell);}ctx.stroke();
  if(food) {
    const x=(food.x+.5)*cell,y=(food.y+.5)*cell;
    const pulse=reducedMotion?1:1+Math.sin(now/250)*.08;
    ctx.fillStyle='#ff8577';ctx.shadowColor='#ff695e';ctx.shadowBlur=13;
    rounded(x-cell*.23*pulse,y-cell*.23*pulse,cell*.46*pulse,cell*.46*pulse,2);
    ctx.shadowBlur=0;ctx.fillStyle='#ffcec3';ctx.fillRect(x-cell*.12,y-cell*.13,cell*.12,cell*.1);
  }
  const alpha=reducedMotion||state!=='playing'?1:Math.min(accumulator/Number($('speed').value),1);
  for(let i=snake.length-1;i>=0;i--) {
    const old=previous[i]||snake[i],p=snake[i];
    const x=(old.x+(p.x-old.x)*alpha)*cell,y=(old.y+(p.y-old.y)*alpha)*cell;
    ctx.globalAlpha=i===0?1:Math.max(.38,1-i/(snake.length+3)*.6);ctx.fillStyle=color;
    ctx.shadowColor=color;ctx.shadowBlur=i===0?10:3;
    rounded(x+1.5,y+1.5,cell-3,cell-3,Math.max(2,cell*.13));ctx.shadowBlur=0;
    if(i===0){ctx.globalAlpha=1;ctx.fillStyle='#102016';const d=cell*.12;
      if(direction.x){const ex=x+(direction.x>0?.69:.21)*cell;ctx.fillRect(ex,y+cell*.25,d,d);ctx.fillRect(ex,y+cell*.63,d,d);}
      else{const ey=y+(direction.y>0?.69:.21)*cell;ctx.fillRect(x+cell*.25,ey,d,d);ctx.fillRect(x+cell*.63,ey,d,d);}
    }
  }ctx.globalAlpha=1;
}
function frame(now) {
  const elapsed=Math.min(now-last,250);last=now;
  if(state==='playing') {accumulator+=elapsed;const interval=Number($('speed').value);while(accumulator>=interval&&state==='playing'){accumulator-=interval;tick();}}
  draw(now);requestAnimationFrame(frame);
}
$('start').addEventListener('click',()=>state==='paused'?pause():start());
$('pause').addEventListener('click',pause);$('restart').addEventListener('click',start);
$('speed').addEventListener('change',()=>{accumulator=0;});
const keys={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
document.addEventListener('keydown',event=>{
  if(event.target.closest('input,select')||event.ctrlKey||event.metaKey||event.altKey) return;
  const key=event.key.length===1?event.key.toLowerCase():event.key;
  if(keys[key]){event.preventDefault();turn(keys[key]);}
  else if(key===' '&&!event.target.closest('button')){event.preventDefault();if(!event.repeat)pause();}
  else if(key==='Enter'&&!event.target.closest('button,a')){event.preventDefault();if(!event.repeat){if(state==='paused')pause();else if(state!=='playing')start();}}
  else if(key==='r'&&!event.repeat)start();
});
document.querySelectorAll('[data-dir]').forEach(button=>button.addEventListener('pointerdown',event=>{event.preventDefault();turn(button.dataset.dir);}));
let touchStart=null;
$('arena').addEventListener('pointerdown',event=>{if(event.target!==canvas)return;touchStart={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
canvas.addEventListener('pointerup',event=>{if(!touchStart)return;const dx=event.clientX-touchStart.x,dy=event.clientY-touchStart.y;touchStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))<12)return;turn(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
canvas.addEventListener('pointercancel',()=>{touchStart=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause();});
window.addEventListener('blur',()=>{if(state==='playing')pause();});
new ResizeObserver(resize).observe(canvas);reset();resize();requestAnimationFrame(frame);
