const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1500,height:900}});
const f=JSON.parse(fs.readFileSync('figuras.json','utf8'));
let h='<body style="margin:10px;background:#eee;display:flex;flex-wrap:wrap;gap:10px;font-family:Arial">';
for(const k of Object.keys(f)) h+=`<div style="background:#fff;padding:6px"><b>P${k}</b><br><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(f[k])}"></div>`;
await p.setContent(h);await p.waitForTimeout(300);await p.screenshot({path:'/tmp/claude-0/-home-claude/6df74d2a-0370-58ed-8e30-7baa3a029148/scratchpad/logfig/nuevas.png',fullPage:true});await b.close();})();
