import assert from 'node:assert/strict';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

const browser=await chromium.launch({
  executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args:['--autoplay-policy=no-user-gesture-required']
});
try{
  const page=await browser.newPage();
  await page.goto(pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html')).href);
  const results=await page.evaluate(async()=>{
    const names=['干的真棒-杰瑞.mp3','呵呵你还挺厉害-杰瑞.mp3','你还挺厉害-汤姆.mp3'];
    const base=new URL('../../../tutorial-assets/media/sounds/',location.href);
    return Promise.all(names.map(name=>new Promise(resolve=>{
      const audio=new Audio(new URL(name,base).href);
      const finish=state=>resolve({name,state,duration:audio.duration,readyState:audio.readyState,error:audio.error?.code||0,src:decodeURI(audio.src)});
      const timer=setTimeout(()=>finish('timeout'),6000);
      audio.addEventListener('loadedmetadata',()=>{clearTimeout(timer);finish('loadedmetadata');},{once:true});
      audio.addEventListener('error',()=>{clearTimeout(timer);finish('error');},{once:true});
      audio.load();
    })));
  });
  for(const result of results){
    assert.equal(result.state,'loadedmetadata',`${result.name} failed to decode: ${JSON.stringify(result)}`);
    assert.ok(Number.isFinite(result.duration)&&result.duration>0,`${result.name} has no playable duration`);
    assert.equal(result.error,0,`${result.name} reports a media error`);
  }
  const tutorialPage=await browser.newPage();
  await tutorialPage.addInitScript(()=>{
    window.__realTutorialPlayback=[];
    const nativePlay=HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play=function(){window.__realTutorialPlayback.push(decodeURI(this.src));return nativePlay.call(this);};
  });
  await tutorialPage.goto(pathToFileURL(path.resolve('templates/template-1/ustb-blue/tutorial.html')).href+'?tutorial=1');
  await tutorialPage.waitForFunction(()=>window.slideStudio);
  await tutorialPage.getByRole('button',{name:'我已阅读，继续'}).click();
  await tutorialPage.waitForTimeout(240);
  assert.equal(await tutorialPage.evaluate(()=>window.__realTutorialPlayback.length),0,'an ordinary step must not start a voice pack');
  await tutorialPage.getByRole('button',{name:'代我完成本项'}).click();
  await tutorialPage.waitForFunction(()=>window.__realTutorialPlayback.some(src=>src.endsWith('/你还挺厉害-汤姆.mp3')),null,{timeout:5000});
  assert.match((await tutorialPage.evaluate(()=>window.__realTutorialPlayback.at(-1)))||'',/你还挺厉害-汤姆\.mp3$/,'skipping the entire item starts Tom voice feedback');
  console.log('PASS real MP3 decoding, standard-cue ordinary steps and Tom group-skip playback:',results.map(result=>`${result.name} ${result.duration.toFixed(2)}s`).join(' | '));
}finally{
  await browser.close();
}
