'use strict';
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let passed = 0, failed = 0;

function test(label, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) { console.log('  \u2713 ' + label); passed++; }
    else { console.error('  \u2717 ' + label + ' (' + r + ')'); failed++; }
  } catch(e) { console.error('  \u2717 ' + label + ' (ERROR: ' + e.message + ')'); failed++; }
}
function read(f) { return fs.readFileSync(path.join(root, f), 'utf8'); }
function exists(f) { return fs.existsSync(path.join(root, f)); }

console.log('\nBlitzerSafe LP - Validation\n');

console.log('Required files:');
['index.html','style.css','script.js','logo.svg','impressum.html','datenschutz.html','agb.html','.nojekyll','.github/workflows/deploy.yml','.github/workflows/ci.yml'].forEach(function(f){
  test(f + ' exists', function(){ return exists(f) || 'Missing: '+f; });
});

const html = read('index.html');

console.log('\nRequired HTML IDs:');
['nav','hero','how','features','showcase','pricing','faq','lang-de','lang-en','mobile-menu-btn','mobile-nav','theme-toggle','back-to-top','cookie-banner'].forEach(function(id){
  test('id="'+id+'"', function(){ return html.includes('id="'+id+'"') || 'Missing id='+id; });
});

console.log('\nProduction URL:');
test('blitzersafe.vercel.app >= 5x', function(){
  var n=(html.match(/blitzersafe\.vercel\.app/g)||[]).length;
  return n>=5||'Found '+n;
});

console.log('\nLanguage:');
test('data-de >= 50', function(){ var n=(html.match(/data-de=/g)||[]).length; return n>=50||'Found '+n; });
test('data-en >= 50', function(){ var n=(html.match(/data-en=/g)||[]).length; return n>=50||'Found '+n; });
test('data-de == data-en count', function(){ var d=(html.match(/data-de=/g)||[]).length,e=(html.match(/data-en=/g)||[]).length; return d===e||'de='+d+' en='+e; });

console.log('\niPhone mockup:');
test('iphone-frame present', function(){ return html.includes('iphone-frame')||'Missing'; });
test('>= 3 app-screen', function(){ var n=(html.match(/class="app-screen/g)||[]).length; return n>=3||'Found '+n; });

console.log('\nPricing:');
test('pricing-card present', function(){ return html.includes('pricing-card')||'Missing'; });
test('featured card present', function(){ return html.includes('pricing-card featured')||'Missing'; });
test('9,99 present', function(){ return html.includes('9,99')||'Missing'; });

console.log('\nFAQ:');
test('>= 5 faq-item', function(){ var n=(html.match(/class="faq-item"/g)||[]).length; return n>=5||'Found '+n; });

console.log('\nNew Features (2026 update):');
test('Parking violations mentioned (Parkverstöße)', function(){ return html.includes('Parkverstöße')||'Missing'; });
test('Deadline alerts (Frist-Warnung)', function(){ return html.includes('Frist-Warnung')||'Missing'; });
test('Case file analysis (Akten-Analyse)', function(){ return html.includes('Akten-Analyse')||'Missing'; });
test('Deadline badge DRINGEND', function(){ return html.includes('DRINGEND')||'Missing'; });
test('Deadline badge WARNUNG', function(){ return html.includes('WARNUNG')||'Missing'; });
test('bento-card >= 9', function(){ var n=(html.match(/bento-card/g)||[]).length; return n>=9||'Found '+n; });

console.log('\nContent consistency:');
test('data-de and data-en counts still match', function(){ var d=(html.match(/data-de=/g)||[]).length,e=(html.match(/data-en=/g)||[]).length; return d===e||'de='+d+' en='+e; });
test('No broken HTML entities in visible text', function(){ return !html.includes('&amp;amp;')&&!html.includes('&lt;br')||'Found broken entities'; });
test('All external links have rel="noopener"', function(){
  var links=html.match(/<a[^>]*target="_blank"[^>]*>/g)||[];
  var bad=links.filter(function(l){return!l.includes('noopener');});
  return bad.length===0||bad.length+' links missing noopener';
});
test('No http:// links (use https://)', function(){
  var httpLinks=(html.match(/href="http:\/\//g)||[]).length;
  return httpLinks===0||'Found '+httpLinks+' http:// links';
});

console.log('\nSEO & Meta:');
test('meta description present', function(){ return html.includes('<meta name="description"')||'Missing'; });
test('og:title present', function(){ return html.includes('og:title')||'Missing'; });
test('og:description present', function(){ return html.includes('og:description')||'Missing'; });
test('title tag present', function(){ return html.includes('<title>')||'Missing'; });

console.log('\nLegal pages link check:');
test('impressum.html linked', function(){ return html.includes('href="impressum.html"')||'Missing'; });
test('datenschutz.html linked', function(){ return html.includes('href="datenschutz.html"')||'Missing'; });
test('agb.html linked', function(){ return html.includes('href="agb.html"')||'Missing'; });

console.log('\nCSS file check:');
var css = read('style.css');
test('style.css not empty', function(){ return css.length > 100||'Too short: '+css.length; });
test('iphone-frame CSS exists', function(){ return css.includes('iphone-frame')||'Missing'; });
test('bento-card CSS exists', function(){ return css.includes('bento-card')||'Missing'; });
test('faq-item CSS exists', function(){ return css.includes('faq-item')||'Missing'; });
test('cookie-banner CSS exists', function(){ return css.includes('cookie-banner')||'Missing'; });

console.log('\nJS file check:');
var js = read('script.js');
test('script.js not empty', function(){ return js.length > 100||'Too short: '+js.length; });
test('language toggle logic', function(){ return js.includes('lang-de')||js.includes('lang-en')||'Missing language toggle'; });
test('theme toggle logic', function(){ return js.includes('theme')||'Missing theme toggle'; });
test('FAQ accordion logic', function(){ return js.includes('faq')||js.includes('FAQ')||'Missing FAQ logic'; });

console.log('\nAccessibility:');
test('html lang attr', function(){ return html.includes('<html')&&html.includes('lang=')||'Missing'; });
test('all img have alt', function(){ var imgs=html.match(/<img[^>]+>/g)||[]; var bad=imgs.filter(function(i){return!i.includes('alt=');}); return bad.length===0||'Missing alt on '+bad.length+' img'; });

console.log('\n' + '-'.repeat(40));
console.log('Passed: ' + passed + ' / ' + (passed+failed));
if(failed>0){ console.error('Failed: '+failed); process.exit(1); }
else console.log('All tests passed.');
