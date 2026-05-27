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

console.log('\nAccessibility:');
test('html lang attr', function(){ return html.includes('<html')&&html.includes('lang=')||'Missing'; });
test('all img have alt', function(){ var imgs=html.match(/<img[^>]+>/g)||[]; var bad=imgs.filter(function(i){return!i.includes('alt=');}); return bad.length===0||'Missing alt on '+bad.length+' img'; });

console.log('\n' + '-'.repeat(40));
console.log('Passed: ' + passed + ' / ' + (passed+failed));
if(failed>0){ console.error('Failed: '+failed); process.exit(1); }
else console.log('All tests passed.');
