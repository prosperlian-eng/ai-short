// ===== STATE =====
const state = {
  videoFile: null,
  videoURL: null,
  count: 3,
  font: 'gothic',
  textColor: '#ffffff',
  borderStyle: 'none',
  borderColor: '#FFD700',
  pattern: 'random',
  copies: [],
};

const CATCHCOPIES = [
  'まさかの結果に\n全員驚愕。',
  'これが本当の\n成長記録。',
  'この一打、\n空気が変わった。',
  'この映像、見る前と\n後で景色が変わる。',
  '親父の一言が\n深すぎた。',
  '100切りを阻む\n意外な原因。',
  'プロが教えてくれた\n本音がヤバい。',
  'こんな打ち方、\n誰も教えてくれなかった。',
  '一瞬で変わった\nスイング動画。',
  '18番ホール、\n奇跡の逆転劇。',
  'この練習法で\nHDCP一桁に。',
  'スコア更新の瞬間を\nリアルタイムで。',
  'バンカーから\n直接カップイン。',
  'グリップ変えたら\n全てが変わった。',
  'ティーショットが\n別人になった理由。',
];

// Scene type labels shown on cards
const SCENE_LABELS = ['🔥 盛り上がりシーン', '⚡ アクション', '🎯 決定的瞬間', '✨ ハイライト', '💡 重要ポイント'];

function pickCopies(n) {
  const pool = [...CATCHCOPIES];
  const result = [];
  for (let i = 0; i < n; i++) {
    if (pool.length === 0) pool.push(...CATCHCOPIES);
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

// ===== CANVAS CONFIG =====
const W = 540, H = 960;
const TOP_H = H * 0.28;
const VID_Y = H * 0.28;
const VID_H = H * 0.44;
const BOT_Y = VID_Y + VID_H;
const BOT_H = H - BOT_Y;

// ===== BACKGROUND PATTERNS =====
let _seed = 42;
function sr(n) { const x = Math.sin(n + _seed) * 10000; return x - Math.floor(x); }

const PATTERNS = {
  dramatic(ctx) {
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0a0014'); g.addColorStop(0.5,'#1a0030'); g.addColorStop(1,'#000');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    const rg=ctx.createRadialGradient(W/2,H*.5,0,W/2,H*.5,W*.9);
    rg.addColorStop(0,'rgba(120,0,180,0.25)'); rg.addColorStop(1,'transparent');
    ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,255,255,0.35)';
    for(let i=0;i<30;i++){ctx.beginPath();ctx.arc(sr(i*3)*W,sr(i*3+1)*H,sr(i*3+2)*1.5+.5,0,Math.PI*2);ctx.fill();}
  },
  clean(ctx) {
    ctx.fillStyle='#080810'; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.lineWidth=1;
    for(let y=0;y<H;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.strokeStyle='rgba(74,158,255,0.18)'; ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(0,VID_Y-2);ctx.lineTo(W,VID_Y-2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,BOT_Y+2);ctx.lineTo(W,BOT_Y+2);ctx.stroke();
  },
  energy(ctx) {
    const g=ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'#001a00'); g.addColorStop(1,'#000');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(57,255,20,0.06)'; ctx.lineWidth=1;
    for(let i=-H;i<W+H;i+=22){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i+H,H);ctx.stroke();}
    const rg=ctx.createRadialGradient(W/2,H*.5,0,W/2,H*.5,W*.7);
    rg.addColorStop(0,'rgba(57,255,20,0.12)'); rg.addColorStop(1,'transparent');
    ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
  },
  luxury(ctx) {
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#0a0800'); g.addColorStop(1,'#000');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='rgba(255,215,0,0.07)';
    for(let i=0;i<50;i++){ctx.beginPath();ctx.arc(sr(i*7+3)*W,sr(i*7+4)*H,1.5,0,Math.PI*2);ctx.fill();}
    const rg=ctx.createRadialGradient(W/2,H*.5,0,W/2,H*.5,W*.7);
    rg.addColorStop(0,'rgba(255,215,0,0.1)'); rg.addColorStop(1,'transparent');
    ctx.fillStyle=rg; ctx.fillRect(0,0,W,H);
  },
  street(ctx) {
    ctx.fillStyle='#060606'; ctx.fillRect(0,0,W,H);
    for(let i=0;i<150;i++){
      ctx.fillStyle=`rgba(255,255,255,${sr(i*5+2)*0.07})`;
      ctx.fillRect(sr(i*5)*W,sr(i*5+1)*H,2,2);
    }
    ctx.strokeStyle='rgba(255,69,0,0.35)'; ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(0,VID_Y-4);ctx.lineTo(W*0.55,VID_Y-4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(W,BOT_Y+4);ctx.lineTo(W*0.45,BOT_Y+4);ctx.stroke();
  },
};
const PATTERN_KEYS = Object.keys(PATTERNS);
function getPattern(mode, idx) {
  if (mode==='random') return PATTERNS[PATTERN_KEYS[idx % PATTERN_KEYS.length]];
  return PATTERNS[mode] || PATTERNS.dramatic;
}

// ===== DRAW FRAME =====
function drawFrame(ctx, videoEl, title, elapsed, clipDuration, options={}) {
  const font        = options.font        || state.font;
  const textColor   = options.textColor   || state.textColor;
  const borderStyle = options.borderStyle || state.borderStyle;
  const borderColor = options.borderColor || state.borderColor;
  const pattern     = options.pattern     || state.pattern;
  const patIdx      = options.patIdx      || 0;

  _seed = patIdx * 137 + 29;

  // Background
  getPattern(pattern, patIdx)(ctx);

  // Video (contain — no crop)
  if (videoEl && videoEl.readyState >= 2) {
    const vw = videoEl.videoWidth  || 1280;
    const vh = videoEl.videoHeight || 720;
    const scale = Math.min(W / vw, VID_H / vh);
    const dw = vw * scale, dh = vh * scale;
    const dx = (W - dw) / 2, dy = VID_Y + (VID_H - dh) / 2;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, VID_Y, W, VID_H);
    ctx.drawImage(videoEl, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = '#111';
    ctx.fillRect(0, VID_Y, W, VID_H);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.font = '13px sans-serif'; ctx.textAlign='center';
    ctx.fillText('動画をアップロードしてください', W/2, VID_Y + VID_H/2);
  }

  // Top gradient
  const topGrad = ctx.createLinearGradient(0, 0, 0, VID_Y + 70);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.9)');
  topGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = topGrad; ctx.fillRect(0, 0, W, VID_Y + 70);

  // Bottom gradient
  const botGrad = ctx.createLinearGradient(0, BOT_Y - 70, 0, H);
  botGrad.addColorStop(0, 'transparent');
  botGrad.addColorStop(1, 'rgba(0,0,0,0.93)');
  ctx.fillStyle = botGrad; ctx.fillRect(0, BOT_Y - 70, W, H - BOT_Y + 70);

  // Title — auto-fit font size so text never overflows
  const MAX_TEXT_W = W - 40; // 20px margin each side
  const rawLines = title.split('\n').filter(l => l.trim());
  // Start big, shrink until all lines fit
  let fSize = rawLines.length > 1 ? 54 : 60;
  const MIN_SIZE = 28;
  let fittedLines = rawLines;
  outer: while (fSize >= MIN_SIZE) {
    ctx.font = buildFont(font, fSize);
    for (const line of fittedLines) {
      if (ctx.measureText(line).width > MAX_TEXT_W) { fSize -= 2; continue outer; }
    }
    break;
  }
  // If still overflowing at min size, word-wrap each line
  const finalLines = [];
  ctx.font = buildFont(font, fSize);
  for (const line of fittedLines) {
    if (ctx.measureText(line).width <= MAX_TEXT_W) { finalLines.push(line); continue; }
    // Split by characters into two halves
    const mid = Math.ceil(line.length / 2);
    finalLines.push(line.slice(0, mid), line.slice(mid));
  }
  ctx.textAlign = 'center';
  const lineH = fSize * 1.28;
  const totalTextH = finalLines.length * lineH;
  const titleStartY = Math.max(fSize + 10, (TOP_H - totalTextH) / 2 + fSize);
  finalLines.forEach((line, i) => drawText(ctx, font, textColor, line, W/2, titleStartY + i * lineH, fSize));

  // CTA
  const ctaY = BOT_Y + BOT_H * 0.38;
  ctx.font = '700 30px "Hiragino Kaku Gothic ProN",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=10;
  ctx.fillText('続きは本編で', W/2, ctaY);
  ctx.font = '700 26px sans-serif';
  ctx.fillText('▼', W/2, ctaY + 36);
  ctx.shadowBlur = 0;

  // Duration + progress bar (seekable area)
  if (clipDuration > 0) {
    const cur = fmtTime(elapsed);
    const tot = fmtTime(clipDuration);
    const text = `${cur} / ${tot}`;
    ctx.font = '700 18px "SF Mono","Courier New",monospace';
    ctx.textAlign = 'right';
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    rr(ctx, W - tw - 22, BOT_Y - 34, tw + 16, 26, 6); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(text, W - 13, BOT_Y - 14);
    // progress bar — thicker for click target
    const prog = Math.min(elapsed / clipDuration, 1);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(0, BOT_Y - 8, W, 8);
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, BOT_Y - 8, W * prog, 8);
    // scrub handle
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(W * prog, BOT_Y - 4, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // AI生成 badge
  ctx.fillStyle = 'rgba(124,58,237,0.8)';
  rr(ctx, W-88, H-40, 68, 26, 6); ctx.fill();
  ctx.font='600 12px "Hiragino Kaku Gothic ProN",sans-serif';
  ctx.textAlign='center'; ctx.fillStyle='#fff';
  ctx.fillText('AI生成', W-54, H-22);

  drawBorder(ctx, borderStyle, borderColor);
}

function buildFont(style, size) {
  switch(style) {
    case 'mincho':  return `700 ${size}px "Hiragino Mincho ProN",serif`;
    case 'youtube': return `900 ${size}px -apple-system,"Helvetica Neue",sans-serif`;
    default:        return `900 ${size}px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif`;
  }
}

function drawText(ctx, style, color, text, x, y, size) {
  ctx.fillStyle = color;
  switch(style) {
    case 'stroke':
      ctx.strokeStyle='#000'; ctx.lineWidth=size*.12; ctx.lineJoin='round';
      ctx.strokeText(text,x,y); ctx.fillText(text,x,y); break;
    case 'glow':
      ctx.shadowColor=color; ctx.shadowBlur=size*.5;
      ctx.fillText(text,x,y); ctx.shadowBlur=0; break;
    case 'box': {
      const m=ctx.measureText(text), p=size*.2;
      ctx.fillStyle='rgba(0,0,0,0.65)';
      rr(ctx,x-m.width/2-p,y-size-p/2,m.width+p*2,size+p*1.5,6); ctx.fill();
      ctx.fillStyle=color; ctx.fillText(text,x,y); break;
    }
    case 'youtube':
      ctx.strokeStyle='#000'; ctx.lineWidth=size*.1; ctx.lineJoin='round';
      ctx.strokeText(text,x,y); ctx.fillText(text,x,y); break;
    default:
      ctx.shadowColor='rgba(0,0,0,0.9)'; ctx.shadowBlur=size*.35;
      ctx.shadowOffsetX=2; ctx.shadowOffsetY=3;
      ctx.fillText(text,x,y);
      ctx.shadowBlur=0; ctx.shadowOffsetX=0; ctx.shadowOffsetY=0;
  }
}

function drawBorder(ctx, style, color) {
  if (style==='none') return;
  ctx.strokeStyle=color;
  switch(style) {
    case 'thin':  ctx.lineWidth=2; ctx.strokeRect(3,3,W-6,H-6); break;
    case 'thick': ctx.lineWidth=7; ctx.strokeRect(4,4,W-8,H-8); break;
    case 'glow':
      ctx.shadowColor=color; ctx.shadowBlur=24; ctx.lineWidth=3;
      ctx.strokeRect(4,4,W-8,H-8); ctx.shadowBlur=0; break;
    case 'corner': {
      const l=60, lw=6, c=22; ctx.lineWidth=lw;
      [[c,c,c+l,c,c,c+l],[W-c,c,W-c-l,c,W-c,c+l],
       [c,H-c,c+l,H-c,c,H-c-l],[W-c,H-c,W-c-l,H-c,W-c,H-c-l]]
      .forEach(([ax,ay,bx,by,cx2,cy]) => {
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(cx2,cy);ctx.stroke();
      }); break;
    }
  }
}

function rr(ctx, x, y, w, h, r) {
  if (typeof r==='number') r={tl:r,tr:r,br:r,bl:r};
  ctx.beginPath();
  ctx.moveTo(x+r.tl,y);
  ctx.lineTo(x+w-r.tr,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r.tr);
  ctx.lineTo(x+w,y+h-r.br); ctx.quadraticCurveTo(x+w,y+h,x+w-r.br,y+h);
  ctx.lineTo(x+r.bl,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r.bl);
  ctx.lineTo(x,y+r.tl); ctx.quadraticCurveTo(x,y,x+r.tl,y);
  ctx.closePath();
}

function fmtTime(sec) {
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

// ===== AI SCENE ANALYSIS =====
// Analyzes video frames to find the most "interesting" moments
// (high motion + visual dynamism = good hook for shorts)
async function analyzeScenes(videoURL, n, onProgress) {
  return new Promise((resolve) => {
    const vid = document.createElement('video');
    vid.src = videoURL;
    vid.muted = true;
    vid.preload = 'auto';

    vid.addEventListener('loadedmetadata', async () => {
      const duration = vid.duration;
      const clipLen  = Math.min(28, Math.max(5, duration / n));

      // Offscreen canvas for analysis (small = fast)
      const AW = 128, AH = 72;
      const ac = document.createElement('canvas');
      ac.width = AW; ac.height = AH;
      const actx = ac.getContext('2d', { willReadFrequently: true });

      const STEP   = Math.max(0.4, duration / 100); // up to 100 samples
      const scores = [];
      let prevData = null;

      for (let t = 0; t < duration - clipLen; t += STEP) {
        // Seek
        await new Promise(r => {
          vid.addEventListener('seeked', r, { once: true });
          vid.currentTime = t;
        });

        actx.drawImage(vid, 0, 0, AW, AH);
        const raw = actx.getImageData(0, 0, AW, AH).data;

        // Motion score (frame difference)
        let motion = 0;
        if (prevData) {
          for (let i = 0; i < raw.length; i += 4) {
            motion += Math.abs(raw[i]   - prevData[i])
                    + Math.abs(raw[i+1] - prevData[i+1])
                    + Math.abs(raw[i+2] - prevData[i+2]);
          }
          motion /= (raw.length / 4) * 3 * 255;
        }

        // Visual richness (brightness variance)
        let sum = 0;
        for (let i = 0; i < raw.length; i += 4) sum += (raw[i]+raw[i+1]+raw[i+2]) / 3;
        const mean = sum / (raw.length / 4);
        let variance = 0;
        for (let i = 0; i < raw.length; i += 4) {
          const b = (raw[i]+raw[i+1]+raw[i+2])/3;
          variance += (b - mean) ** 2;
        }
        variance = Math.sqrt(variance / (raw.length / 4)) / 255;

        scores.push({ t, score: motion * 0.65 + variance * 0.35 });
        prevData = raw.slice();

        if (onProgress) onProgress(t / (duration - clipLen));
      }

      // Smooth scores (rolling average)
      const smoothed = scores.map((s, i) => ({
        t: s.t,
        score: scores.slice(Math.max(0,i-3), i+4).reduce((a,b)=>a+b.score,0)
               / Math.min(7, scores.length),
      }));

      // Divide video into N equal zones, pick the best moment in each zone
      // → guarantees clips from different parts of the video
      const zoneSize = duration / n;
      const selected = [];

      for (let z = 0; z < n; z++) {
        const zStart = zoneSize * z;
        const zEnd   = zoneSize * (z + 1);

        // Find highest scoring sample within this zone
        const inZone = smoothed.filter(s => s.t >= zStart && s.t < zEnd);
        if (!inZone.length) {
          // fallback: use zone center
          const t = Math.max(0, zStart + (zoneSize - clipLen) / 2);
          selected.push({ startTime: t, clipDuration: clipLen, score: 0 });
          continue;
        }

        const best = inZone.reduce((a, b) => b.score > a.score ? b : a);
        // Start a few seconds BEFORE the peak → cliffhanger effect
        const tStart = Math.min(Math.max(zStart, best.t - 2), zEnd - clipLen);
        const tStartClamped = Math.max(0, Math.min(tStart, duration - clipLen));
        selected.push({ startTime: tStartClamped, clipDuration: clipLen, score: best.score });
      }

      selected.sort((a,b) => a.startTime - b.startTime);
      resolve(selected);
    });

    vid.load();
  });
}

// ===== RECORD WITH AUDIO =====
function recordShort(videoURL, startTime, clipDuration, title, patIdx) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    const vid = document.createElement('video');
    vid.src = videoURL;
    vid.preload = 'auto';
    // Keep unmuted for audio capture

    vid.addEventListener('loadeddata', () => {
      // Use AudioContext to keep audio stream alive even when vid.pause() is called
      let audioCtx, audioDest;
      try {
        audioCtx = new AudioContext();
        const src = audioCtx.createMediaElementSource(vid);
        audioDest = audioCtx.createMediaStreamDestination();
        src.connect(audioDest);
        // Also connect to speakers so we hear it (optional during recording - mute if unwanted)
        // src.connect(audioCtx.destination);
      } catch(e) {
        console.warn('AudioContext setup failed:', e);
      }

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream();
      canvasStream.getVideoTracks().forEach(t => combinedStream.addTrack(t));
      if (audioDest) audioDest.stream.getAudioTracks().forEach(t => combinedStream.addTrack(t));

      const mimeType = ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm']
        .find(t => MediaRecorder.isTypeSupported(t)) || 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks = [];
      recorder.ondataavailable = e => { if(e.data.size>0) chunks.push(e.data); };
      recorder.onstop = () => {
        if (audioCtx) audioCtx.close();
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };
      recorder.onerror = e => { if (audioCtx) audioCtx.close(); reject(e); };

      const outroDur  = outro.mode !== 'none' ? outro.duration : 0;
      let phase       = 'main';
      let outroVid    = null;
      let outroWall   = null;

      function tick(ts) {
        // ── MAIN CLIP ──
        if (phase === 'main') {
          const elapsed = Math.max(0, vid.currentTime - startTime);
          if (elapsed >= clipDuration || vid.ended) {
            // Mute but keep playing silently so audio track stays alive
            vid.volume = 0;
            if (outroDur > 0) {
              phase = 'outro';
              outroWall = ts;
              if (outro.mode === 'video' && outro.videoURL) {
                outroVid = document.createElement('video');
                outroVid.src = outro.videoURL;
                outroVid.preload = 'auto';
                outroVid.load();
                outroVid.addEventListener('loadeddata', () => {
                  outroVid.currentTime = 0;
                  outroVid.addEventListener('seeked', () => outroVid.play().catch(()=>{}), {once:true});
                }, {once:true});
              }
            } else {
              recorder.stop(); return;
            }
          } else {
            drawFrame(ctx, vid, title, elapsed, clipDuration, {
              patIdx, pattern: state.pattern, font: state.font,
              textColor: state.textColor, borderStyle: state.borderStyle, borderColor: state.borderColor,
            });
          }

        // ── OUTRO ──
        } else {
          if (!outroWall) outroWall = ts;
          const outroElapsed = (ts - outroWall) / 1000;
          if (outroElapsed >= outroDur) {
            if (outroVid) outroVid.pause();
            recorder.stop(); return;
          }
          if (outro.mode === 'video' && outroVid && outroVid.readyState >= 2) {
            const ow = outroVid.videoWidth || W, oh = outroVid.videoHeight || H;
            const scale = Math.min(W/ow, H/oh);
            const dw = ow*scale, dh = oh*scale;
            ctx.fillStyle = '#000'; ctx.fillRect(0,0,W,H);
            ctx.drawImage(outroVid, (W-dw)/2, (H-dh)/2, dw, dh);
          } else {
            drawOutroFrame(ctx, outroElapsed, outroDur);
          }
        }
        requestAnimationFrame(tick);
      }

      vid.addEventListener('seeked', () => {
        vid.play().then(() => {
          recorder.start(100);
          requestAnimationFrame(tick);
        }).catch(reject);
      }, { once: true });

      vid.currentTime = startTime;
    }, { once: true });

    vid.load();
  });
}

// ===== THUMBNAIL =====
function drawThumbnail(canvas, videoURL, seekTime, title, patIdx) {
  return new Promise(resolve => {
    const ctx = canvas.getContext('2d');
    canvas.width = W; canvas.height = H;

    if (!videoURL) {
      drawFrame(ctx, null, title, 0, 0, { patIdx });
      resolve(); return;
    }

    const tmp = document.createElement('video');
    tmp.src = videoURL;
    tmp.muted = true;
    tmp.preload = 'auto';
    tmp.addEventListener('seeked', () => {
      drawFrame(ctx, tmp, title, 0, 0, {
        patIdx, pattern: state.pattern, font: state.font,
        textColor: state.textColor, borderStyle: state.borderStyle, borderColor: state.borderColor,
      });
      resolve();
    }, { once: true });
    tmp.addEventListener('loadeddata', () => { tmp.currentTime = seekTime; }, { once: true });
    tmp.load();
  });
}

// ===== OUTRO STATE =====
const outro = {
  mode: 'text',       // 'text' | 'video' | 'none'
  channel: '',
  sub: '',
  sns: '',
  bgColor: '#0a0a0f',
  videoURL: null,
  duration: 5,
};

// Draw outro frame (text mode)
function drawOutroFrame(ctx, elapsed, totalDuration) {
  const bg = outro.bgColor;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow
  const rg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.9);
  rg.addColorStop(0, 'rgba(124,58,237,0.18)');
  rg.addColorStop(1, 'transparent');
  ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);

  // Decorative lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 22) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Fade-in based on elapsed
  const opacity = Math.min(1, elapsed * 2);
  ctx.globalAlpha = opacity;

  // Subscribe icon area
  const iconY = H * 0.28;
  ctx.fillStyle = '#ff0000';
  rr(ctx, W/2 - 54, iconY - 30, 108, 60, 12); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = '700 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('▶', W/2 + 2, iconY + 12);

  // Channel name
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 40px "Hiragino Kaku Gothic ProN","Noto Sans JP",sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 16;
  const chName = outro.channel || 'CHANNEL NAME';
  // Auto-shrink if too long
  let cSize = 40;
  while (cSize > 20 && ctx.measureText(chName).width > W - 60) {
    cSize -= 2; ctx.font = `900 ${cSize}px "Hiragino Kaku Gothic ProN",sans-serif`;
  }
  ctx.fillText(chName, W/2, H * 0.48);
  ctx.shadowBlur = 0;

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W*0.2, H*0.52); ctx.lineTo(W*0.8, H*0.52); ctx.stroke();

  // Sub text
  if (outro.sub) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '400 22px "Hiragino Kaku Gothic ProN",sans-serif';
    ctx.textAlign = 'center';
    // wrap if too long
    const words = outro.sub;
    let subSize = 22;
    while (subSize > 14 && ctx.measureText(words).width > W - 60) {
      subSize -= 1; ctx.font = `400 ${subSize}px "Hiragino Kaku Gothic ProN",sans-serif`;
    }
    ctx.fillText(words, W/2, H * 0.57);
  }

  // SNS
  if (outro.sns) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '600 18px "Hiragino Kaku Gothic ProN",sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(outro.sns, W/2, H * 0.63);
  }

  // Progress bar
  const prog = Math.min(elapsed / totalDuration, 1);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(0, H - 6, W * prog, 6);
}

// ===== DOM REFS =====
const uploadZone     = document.getElementById('upload-zone');
const videoInput     = document.getElementById('video-input');
const uploadFilename = document.getElementById('upload-filename');
const sourceVideo    = document.getElementById('source-video');
const countGroup     = document.getElementById('count-group');
const fontGroup      = document.getElementById('font-group');
const borderGroup    = document.getElementById('border-group');
const patternGroup   = document.getElementById('pattern-group');
const generateBtn    = document.getElementById('generate-btn');
const resultsSection = document.getElementById('results-section');
const previewsGrid   = document.getElementById('previews-grid');
const regenBtn       = document.getElementById('regen-btn');
const dlAllBtn       = document.getElementById('dl-all-btn');
const btnViewGrid    = document.getElementById('btn-view-grid');
const btnViewList    = document.getElementById('btn-view-list');
const btnSelectAll   = document.getElementById('btn-select-all');
const btnDeselectAll = document.getElementById('btn-deselect-all');
const btnDlSelected  = document.getElementById('btn-dl-selected');
const selCountEl     = document.getElementById('sel-count');

let currentView = 'grid';
const selectedSet = new Set();

// ===== OUTRO SETUP =====
(function setupOutro() {
  // Mode toggle
  document.querySelectorAll('.outro-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.outro-mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      outro.mode = btn.dataset.mode;
      document.getElementById('outro-text-panel').style.display  = outro.mode === 'text'  ? '' : 'none';
      document.getElementById('outro-video-panel').style.display = outro.mode === 'video' ? '' : 'none';
      if (outro.mode === 'text') refreshOutroPreview();
    });
  });

  // Text inputs
  const chInput  = document.getElementById('outro-channel');
  const subInput = document.getElementById('outro-sub');
  const snsInput = document.getElementById('outro-sns');
  [chInput, subInput, snsInput].forEach(el => {
    el.addEventListener('input', () => {
      outro.channel = chInput.value;
      outro.sub     = subInput.value;
      outro.sns     = snsInput.value;
      refreshOutroPreview();
    });
  });

  // BG color
  const bgGroup = document.getElementById('outro-bg-group');
  bgGroup.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      bgGroup.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      outro.bgColor = dot.dataset.color;
      document.getElementById('outro-bg-custom').value = dot.dataset.color;
      refreshOutroPreview();
    });
  });
  document.getElementById('outro-bg-custom').addEventListener('input', e => {
    outro.bgColor = e.target.value;
    bgGroup.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
    refreshOutroPreview();
  });

  // Outro video upload
  const outroZone  = document.getElementById('outro-upload-zone');
  const outroInput = document.getElementById('outro-video-input');
  const outroFname = document.getElementById('outro-filename');
  outroZone.addEventListener('click', () => outroInput.click());
  outroInput.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    if (outro.videoURL) URL.revokeObjectURL(outro.videoURL);
    outro.videoURL = URL.createObjectURL(f);
    outroFname.textContent = `✓ ${f.name}`;
  });
  outroZone.addEventListener('dragover', e => { e.preventDefault(); outroZone.classList.add('drag-over'); });
  outroZone.addEventListener('dragleave', () => outroZone.classList.remove('drag-over'));
  outroZone.addEventListener('drop', e => {
    e.preventDefault(); outroZone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f && (f.type.includes('video') || f.name.endsWith('.mov'))) {
      if (outro.videoURL) URL.revokeObjectURL(outro.videoURL);
      outro.videoURL = URL.createObjectURL(f);
      outroFname.textContent = `✓ ${f.name}`;
    }
  });

  refreshOutroPreview();
})();

function refreshOutroPreview() {
  const canvas = document.getElementById('outro-preview-canvas');
  if (!canvas) return;
  canvas.width = 270; canvas.height = 480;
  const ctx = canvas.getContext('2d');
  // Save/restore W,H
  const origW = W, origH = H;
  // Temporarily draw at half scale
  ctx.save();
  ctx.scale(270/W, 480/H);
  drawOutroFrame(ctx, 2, 5);
  ctx.restore();
}

// Loading overlay
const loadingOverlay = document.createElement('div');
loadingOverlay.className = 'loading-overlay';
loadingOverlay.innerHTML = `
  <div class="spinner"></div>
  <div class="loading-text" id="loading-text">解析中...</div>
  <div class="loading-sub" id="loading-sub"></div>
  <div class="analysis-bar-wrap"><div class="analysis-bar" id="analysis-bar"></div></div>
`;
document.body.appendChild(loadingOverlay);
const loadingText  = document.getElementById('loading-text');
const loadingSub   = document.getElementById('loading-sub');
const analysisBar  = document.getElementById('analysis-bar');

// ===== UPLOAD =====
uploadZone.addEventListener('click', () => videoInput.click());
videoInput.addEventListener('change', e => { const f=e.target.files[0]; if(f) handleFile(f); });
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault(); uploadZone.classList.remove('drag-over');
  const f=e.dataTransfer.files[0];
  if(f&&(f.type.includes('video')||f.name.endsWith('.mov'))) handleFile(f);
});
function handleFile(file) {
  state.videoFile = file;
  if(state.videoURL) URL.revokeObjectURL(state.videoURL);
  state.videoURL = URL.createObjectURL(file);
  uploadFilename.textContent = `✓ ${file.name}`;
  sourceVideo.src = state.videoURL;
  sourceVideo.style.display = 'block';
}

// ===== TOGGLE GROUPS =====
function setupToggle(group, key, isInt=false) {
  group.addEventListener('click', e => {
    const btn=e.target.closest('.toggle-btn'); if(!btn) return;
    group.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    state[key] = isInt ? parseInt(btn.dataset.value,10) : btn.dataset.value;
  });
}
setupToggle(countGroup,'count',true);
setupToggle(fontGroup,'font');
setupToggle(borderGroup,'borderStyle');
setupToggle(patternGroup,'pattern');

// ===== COLOR PICKERS =====
function setupColorGroup(groupId, key, customId) {
  const group=document.getElementById(groupId);
  const ci=document.getElementById(customId);
  group.querySelectorAll('.color-dot').forEach(dot=>{
    dot.addEventListener('click',()=>{
      group.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('active'));
      dot.classList.add('active');
      state[key]=dot.dataset.color; ci.value=dot.dataset.color;
    });
  });
  ci.addEventListener('input',e=>{
    state[key]=e.target.value;
    group.querySelectorAll('.color-dot').forEach(d=>d.classList.remove('active'));
  });
}
setupColorGroup('text-color-group','textColor','custom-text-color');
setupColorGroup('border-color-group','borderColor','custom-border-color');

// ===== CARD DATA =====
let cardData = [];

// ===== GENERATE =====
generateBtn.addEventListener('click', async () => {
  loadingOverlay.classList.add('show');
  generateBtn.classList.add('loading');
  generateBtn.textContent = '解析中...';

  const n = parseInt(state.count, 10);
  state.copies = pickCopies(n);
  let scenes = null;

  if (state.videoURL) {
    // AI scene analysis
    loadingText.textContent = '🔍 AIが動画を解析中...';
    loadingSub.textContent  = '盛り上がりシーンを検出しています';
    analysisBar.style.width = '0%';

    try {
      scenes = await analyzeScenes(state.videoURL, n, (progress) => {
        analysisBar.style.width = `${Math.round(progress * 100)}%`;
        loadingSub.textContent  = `解析中 ${Math.round(progress * 100)}%`;
      });
      loadingText.textContent = '✨ シーン選定完了！';
      loadingSub.textContent  = `${n}つのベストシーンが見つかりました`;
      await new Promise(r => setTimeout(r, 600));
    } catch(e) {
      console.warn('Scene analysis failed:', e);
    }
  } else {
    loadingText.textContent = 'サムネイルを生成中...';
    loadingSub.textContent  = '';
    await new Promise(r => setTimeout(r, 800));
  }

  await renderPreviews(scenes);

  loadingOverlay.classList.remove('show');
  generateBtn.classList.remove('loading');
  generateBtn.innerHTML = '<span class="generate-icon">✦</span> AIショートを生成する';
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior:'smooth', block:'start' });
});

// ===== RENDER CARDS =====
async function renderPreviews(scenes) {
  previewsGrid.innerHTML = '';
  cardData = [];
  selectedSet.clear();
  updateSelectionUI();
  setView('grid'); // reset to grid on new generation

  const n = parseInt(state.count, 10);
  let vidDuration = 0;
  if (sourceVideo.src) {
    await new Promise(r => {
      if (sourceVideo.readyState >= 1) { vidDuration = sourceVideo.duration; r(); }
      else sourceVideo.addEventListener('loadedmetadata', () => { vidDuration=sourceVideo.duration; r(); }, {once:true});
    });
  }

  for (let i = 0; i < n; i++) {
    let startTime, clipDuration, sceneLabel;

    if (scenes && scenes[i]) {
      startTime    = scenes[i].startTime;
      clipDuration = scenes[i].clipDuration;
      sceneLabel   = SCENE_LABELS[i % SCENE_LABELS.length];
    } else if (vidDuration > 0) {
      const seg = vidDuration / n;
      startTime    = seg * i;
      clipDuration = Math.min(30, Math.max(5, seg));
      sceneLabel   = null;
    } else {
      startTime    = 0;
      clipDuration = 15;
      sceneLabel   = null;
    }

    const title  = state.copies[i] || CATCHCOPIES[i % CATCHCOPIES.length];
    const patIdx = i;

    const card = document.createElement('div');
    card.className = 'short-card';
    card.dataset.idx = i;

    // Selection checkbox
    const selCheck = document.createElement('label');
    selCheck.className = 'card-select-check';
    selCheck.innerHTML = `<input type="checkbox" class="card-checkbox" data-idx="${i}"><span class="card-check-box"></span>`;
    selCheck.addEventListener('click', e => e.stopPropagation());
    selCheck.querySelector('input').addEventListener('change', e => {
      if (e.target.checked) selectedSet.add(i);
      else selectedSet.delete(i);
      card.classList.toggle('selected', e.target.checked);
      updateSelectionUI();
    });
    card.appendChild(selCheck);

    const labelEl = document.createElement('div');
    labelEl.className = 'short-card-label';
    labelEl.textContent = `SHORT #${String(i+1).padStart(2,'0')}`;
    card.appendChild(labelEl);

    if (vidDuration > 0) {
      const badge = document.createElement('div');
      badge.className = 'scene-badge';
      badge.innerHTML = `${sceneLabel ? `<span class="scene-type">${sceneLabel}</span>` : ''}
        <span class="scene-time">${fmtTime(startTime)} 〜 ${fmtTime(startTime+clipDuration)}</span>`;
      card.appendChild(badge);
    }

    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'short-canvas-wrap';
    const canvas = document.createElement('canvas');
    canvas.className = 'short-canvas';
    canvasWrap.appendChild(canvas);

    const playBtn = document.createElement('button');
    playBtn.className = 'card-play-btn';
    playBtn.innerHTML = '▶';
    playBtn.addEventListener('click', () => togglePreview(i));
    canvasWrap.appendChild(playBtn);

    // Progress bar seek (click on bottom ~10% of canvas)
    canvasWrap.addEventListener('click', e => {
      const d = cardData[i];
      if (!d || !d.playing || !d.previewVid) return;
      const rect = canvasWrap.getBoundingClientRect();
      const relY = (e.clientY - rect.top) / rect.height;
      // Only trigger in progress bar zone (bottom ~12%)
      if (relY < 0.88) return;
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      d.previewVid.currentTime = d.startTime + ratio * d.clipDuration;
    });

    card.appendChild(canvasWrap);

    // List-view meta (title + scene info text, hidden in grid mode)
    const listMeta = document.createElement('div');
    listMeta.className = 'card-list-meta';
    listMeta.innerHTML = `
      <div class="list-meta-title">${title}</div>
      <div class="list-meta-scene">${sceneLabel ? `${sceneLabel} · ` : ''}${fmtTime(startTime)} 〜 ${fmtTime(startTime+clipDuration)}</div>
    `;
    card.appendChild(listMeta);

    const actions = document.createElement('div');
    actions.className = 'short-card-actions';

    const dlBtn = document.createElement('button');
    dlBtn.className = 'short-dl-btn';
    dlBtn.innerHTML = '⬇ 動画ダウンロード';
    dlBtn.addEventListener('click', () => downloadShort(i, dlBtn));

    const regenOneBtn = document.createElement('button');
    regenOneBtn.className = 'short-regen-btn';
    regenOneBtn.textContent = '🎲';
    regenOneBtn.title = 'タイトルを再生成';
    regenOneBtn.addEventListener('click', async () => {
      const t = CATCHCOPIES[Math.floor(Math.random()*CATCHCOPIES.length)];
      cardData[i].title = t;
      await drawThumbnail(canvas, state.videoURL, startTime, t, patIdx);
    });

    actions.appendChild(dlBtn);
    actions.appendChild(regenOneBtn);
    card.appendChild(actions);
    previewsGrid.appendChild(card);

    loadingText.textContent = `サムネイル生成中 (${i+1}/${n})`;
    await drawThumbnail(canvas, state.videoURL, startTime, title, patIdx);

    cardData.push({ canvas, startTime, clipDuration, title, patIdx, playBtn, playing: false, previewVid: null, animRaf: null });
  }
}

// ===== IN-CARD PREVIEW (with audio) =====
function togglePreview(idx) {
  const d = cardData[idx];
  if (!d) return;
  if (d.playing) { stopPreview(idx); return; }
  if (!state.videoURL) { showToast('動画をアップロードしてください'); return; }

  d.playing = true;
  d.playBtn.innerHTML = '⏸';
  d.playBtn.classList.add('active');
  d.canvas.parentElement.classList.add('is-playing');

  const vid = document.createElement('video');
  vid.src = state.videoURL;
  vid.muted = false; // ← 音声ON
  vid.volume = 1;
  vid.preload = 'auto';
  d.previewVid = vid;

  vid.addEventListener('loadeddata', () => {
    vid.currentTime = d.startTime;
    vid.addEventListener('seeked', () => {
      vid.play().catch(() => {});
      function tick() {
        if (!d.playing) return;
        // Use video.currentTime so seeking works automatically
        const elapsed = Math.max(0, vid.currentTime - d.startTime);
        if (elapsed >= d.clipDuration || vid.ended) { stopPreview(idx); return; }
        const ctx = d.canvas.getContext('2d');
        drawFrame(ctx, vid, d.title, elapsed, d.clipDuration, {
          patIdx: d.patIdx, pattern: state.pattern, font: state.font,
          textColor: state.textColor, borderStyle: state.borderStyle, borderColor: state.borderColor,
        });
        d.animRaf = requestAnimationFrame(tick);
      }
      d.animRaf = requestAnimationFrame(tick);
    }, { once: true });
  }, { once: true });
  vid.load();
}

function stopPreview(idx) {
  const d = cardData[idx];
  if (!d) return;
  if (d.previewVid) { d.previewVid.pause(); d.previewVid = null; }
  if (d.animRaf)    { cancelAnimationFrame(d.animRaf); d.animRaf = null; }
  d.playing = false;
  d.playBtn.innerHTML = '▶';
  d.playBtn.classList.remove('active');
  d.canvas.parentElement.classList.remove('is-playing');
  drawThumbnail(d.canvas, state.videoURL, d.startTime, d.title, d.patIdx);
}

// ===== DOWNLOAD WITH AUDIO =====
async function downloadShort(idx, btn) {
  const d = cardData[idx];
  if (!d) return;

  if (!state.videoURL) {
    showToast('動画をアップロードしてください');
    return;
  }

  const origHTML = btn.innerHTML;
  btn.innerHTML = '⏺ 録画準備中...';
  btn.disabled = true;

  try {
    // Stop preview if playing
    if (d.playing) stopPreview(idx);

    btn.innerHTML = '⏺ 録画中 0%';

    // Progress polling
    const startWall = Date.now();
    const progressTimer = setInterval(() => {
      const pct = Math.min(99, Math.round((Date.now() - startWall) / (d.clipDuration * 1000) * 100));
      btn.innerHTML = `⏺ 録画中 ${pct}%`;
    }, 400);

    const blob = await recordShort(state.videoURL, d.startTime, d.clipDuration, d.title, d.patIdx);
    clearInterval(progressTimer);

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `short_${idx+1}.webm`;
    a.href = url;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast(`short_${idx+1}.webm をダウンロードしました（音声付き）`);
  } catch(e) {
    console.error(e);
    showToast('録画に失敗しました: ' + e.message);
  }

  btn.innerHTML = origHTML;
  btn.disabled = false;
}

// ===== VIEW TOGGLE =====
btnViewGrid.addEventListener('click', () => setView('grid'));
btnViewList.addEventListener('click', () => setView('list'));

function setView(v) {
  currentView = v;
  previewsGrid.className = v === 'list' ? 'previews-list' : 'previews-grid';
  btnViewGrid.classList.toggle('active', v === 'grid');
  btnViewList.classList.toggle('active', v === 'list');
}

// ===== SELECTION =====
function updateSelectionUI() {
  selCountEl.textContent = selectedSet.size;
  btnDlSelected.disabled = selectedSet.size === 0;
}

btnSelectAll.addEventListener('click', () => {
  cardData.forEach((_, i) => {
    selectedSet.add(i);
    const cb = previewsGrid.querySelector(`.card-checkbox[data-idx="${i}"]`);
    if (cb) cb.checked = true;
    const card = previewsGrid.querySelector(`.short-card[data-idx="${i}"]`);
    if (card) card.classList.add('selected');
  });
  updateSelectionUI();
});

btnDeselectAll.addEventListener('click', () => {
  selectedSet.clear();
  previewsGrid.querySelectorAll('.card-checkbox').forEach(cb => cb.checked = false);
  previewsGrid.querySelectorAll('.short-card').forEach(c => c.classList.remove('selected'));
  updateSelectionUI();
});

btnDlSelected.addEventListener('click', async () => {
  const indices = [...selectedSet].sort((a,b)=>a-b);
  if (!indices.length) return;
  showToast(`${indices.length}本の動画を録画・ダウンロードします`);
  for (const idx of indices) {
    const btn = previewsGrid.querySelector(`.short-card[data-idx="${idx}"] .short-dl-btn`);
    if (btn) await downloadShort(idx, btn);
    await new Promise(r => setTimeout(r, 500));
  }
});

// ===== REGEN ALL TITLES =====
regenBtn.addEventListener('click', async () => {
  state.copies = pickCopies(state.count);
  for (let i = 0; i < cardData.length; i++) {
    cardData[i].title = state.copies[i];
    await drawThumbnail(cardData[i].canvas, state.videoURL, cardData[i].startTime, cardData[i].title, cardData[i].patIdx);
  }
  showToast('タイトルを再生成しました');
});

// ===== DOWNLOAD ALL =====
dlAllBtn.addEventListener('click', async () => {
  if (!cardData.length) return;
  for (let i = 0; i < cardData.length; i++) {
    const btns = previewsGrid.querySelectorAll('.short-dl-btn');
    if (btns[i]) await downloadShort(i, btns[i]);
    await new Promise(r => setTimeout(r, 800));
  }
});

// ===== PRESETS =====
document.getElementById('btn-save-preset').addEventListener('click', () => {
  document.getElementById('preset-save-modal').classList.add('open');
});
document.getElementById('preset-save-cancel').addEventListener('click', () => {
  document.getElementById('preset-save-modal').classList.remove('open');
});
document.getElementById('preset-save-confirm').addEventListener('click', () => {
  const name = document.getElementById('preset-name-input').value.trim() || '無名プリセット';
  const presets = JSON.parse(localStorage.getItem('shortai_presets')||'{}');
  presets[name] = { font:state.font, textColor:state.textColor, borderStyle:state.borderStyle, borderColor:state.borderColor, pattern:state.pattern, count:state.count };
  localStorage.setItem('shortai_presets', JSON.stringify(presets));
  document.getElementById('preset-save-modal').classList.remove('open');
  showToast(`「${name}」を保存しました`);
});
document.getElementById('btn-load-preset').addEventListener('click', () => {
  renderPresetList();
  document.getElementById('preset-load-modal').classList.add('open');
});
document.getElementById('preset-load-close').addEventListener('click', () => {
  document.getElementById('preset-load-modal').classList.remove('open');
});

function renderPresetList() {
  const presets = JSON.parse(localStorage.getItem('shortai_presets')||'{}');
  const list = document.getElementById('preset-list');
  const keys = Object.keys(presets);
  if (!keys.length) { list.innerHTML='<p style="color:#6b7280;font-size:13px;padding:8px 0;">保存されたプリセットはありません</p>'; return; }
  list.innerHTML = keys.map(name=>`
    <div class="preset-item">
      <span>${name}</span>
      <div style="display:flex;gap:6px;">
        <button class="preset-apply-btn" onclick="applyPreset('${name}')">適用</button>
        <button class="preset-delete-btn" onclick="deletePreset('${name}')">削除</button>
      </div>
    </div>`).join('');
}
window.applyPreset = function(name) {
  const p = JSON.parse(localStorage.getItem('shortai_presets')||'{}')[name];
  if (!p) return;
  Object.assign(state, p);
  syncToggle(fontGroup, p.font); syncToggle(borderGroup, p.borderStyle); syncToggle(patternGroup, p.pattern);
  document.getElementById('preset-load-modal').classList.remove('open');
  showToast(`「${name}」を適用しました`);
};
window.deletePreset = function(name) {
  const p = JSON.parse(localStorage.getItem('shortai_presets')||'{}');
  delete p[name]; localStorage.setItem('shortai_presets', JSON.stringify(p));
  renderPresetList();
};
function syncToggle(group, val) {
  group.querySelectorAll('.toggle-btn').forEach(b=>b.classList.toggle('active', b.dataset.value===val));
}

function showToast(msg) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 3000);
}
