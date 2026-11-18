// Export einer HTML-Animation als MP4 (1080x1920).
// Aufruf: node tools/export.js drafts/02_write-it-down.html output/name.mp4 [fps] [audio.mp3]
// Vorschau-Bilder: node tools/export.js <html> --stills <ordner> 1,4.5,9,13
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [html, out, a3, a4] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(html) + '?export=1');
  await page.waitForFunction(() => window.READY === true);

  if (out === '--stills') {
    fs.mkdirSync(a3, { recursive: true });
    for (const t of a4.split(',').map(Number)) {
      await page.evaluate(t => window.seek(t), t);
      await page.screenshot({ path: path.join(a3, `t${String(t).replace('.', '_')}.png`) });
    }
    await browser.close();
    return;
  }

  const fps = Number(a3 || 60);
  const dur = await page.evaluate(() => window.DUR);
  const frames = Math.round(dur * fps);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const args = ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-'];
  if (a4) args.push('-i', a4, '-c:a', 'aac', '-b:a', '192k', '-shortest');
  args.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'ignore', 'inherit'] });
  for (let i = 0; i < frames; i++) {
    await page.evaluate(t => window.seek(t), i / fps);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % fps === 0) process.stdout.write(`\r${(i / fps).toFixed(0)} / ${dur} s`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('\nfertig: ' + out);
})();
