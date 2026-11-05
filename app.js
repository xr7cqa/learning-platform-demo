(function(){
  const d = window.ASSET_DATA || {};
  const orig = String.prototype;
  // rewrite asset paths at render time via helper
  window.asset = function(name){
    const key = name.replace(/^assets\//,'').replace(/^\.\//,'');
    return d[key] || ('assets/'+key);
  };
})();
'use strict';
/* ========== التخزين والتقدّم ========== */
const KEY = 'tafaaul-progress-v1';
const blank = () => ({ lessons: {}, lab: { done: false, runs: 0 }, game: { done: false, best: null, plays: 0 }, quiz: { done: false, best: null, last: null, attempts: 0 }, practice: {} });
let store;
function load() {
  try { store = Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); }
  catch (e) { store = blank(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* التخزين غير متاح */ } }
load();

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2600); }

/* ========== المحتوى ========== */
const SUBJECTS = [
  { id: 'arabic', name: 'اللغة العربية', img: 'subj-arabic', color: 'rose', hint: 'مفردات وقواعد' },
  { id: 'math', name: 'الرياضيات', img: 'subj-math', color: 'amber', hint: 'أعداد وأشكال' },
  { id: 'science', name: 'العلوم', img: 'subj-science', color: 'green', hint: 'وحدة الطاقة' },
  { id: 'social', name: 'الدراسات الاجتماعية', img: 'subj-social', color: 'teal', hint: 'وطني وعالمي' }
];

const ANIM = {
  battery: `<svg viewBox="0 0 320 200" class="anim anim-chain" role="img" aria-label="بطارية تنقل الطاقة الكهربائية إلى مصباح">
    <rect x="22" y="70" width="92" height="56" rx="10" fill="#2f3b45"/><rect x="114" y="86" width="10" height="24" rx="3" fill="#95a5a6"/>
    <rect x="22" y="70" width="40" height="56" rx="10" fill="#f2b632"/><path d="M78 82l-10 18h9l-4 16 13-20h-9l4-14z" fill="#ffd54d"/>
    <path class="flow" d="M124 98 H200" stroke="#f2b632" stroke-width="6" stroke-linecap="round" stroke-dasharray="10 12"/>
    <g transform="translate(232 58)"><circle class="glow" cx="30" cy="40" r="44" fill="#ffe27a" opacity=".55"/><path d="M30 4a30 30 0 0 0-17 54c4 3 6 7 6 11v5h22v-5c0-4 2-8 6-11A30 30 0 0 0 30 4z" fill="#ffd54d" stroke="#e8a817" stroke-width="3"/><rect x="18" y="76" width="24" height="12" rx="3" fill="#9aa5ad"/></g>
    <text x="68" y="152" text-anchor="middle" class="svg-t">طاقة كيميائية</text><text x="262" y="166" text-anchor="middle" class="svg-t">ضوء وحرارة</text></svg>`,
  bulb: `<svg viewBox="0 0 320 200" class="anim" role="img" aria-label="مصباح مضيء تخرج منه أشعة ضوء وموجات حرارة">
    <g class="rays" stroke="#f5b72a" stroke-width="5" stroke-linecap="round"><path d="M160 14v18M96 40l12 12M224 40l-12 12M78 100h18M242 100h-18"/></g>
    <circle class="glow" cx="160" cy="92" r="62" fill="#ffe27a" opacity=".5"/>
    <path d="M160 46a42 42 0 0 0-24 76c5 4 8 9 8 15v6h32v-6c0-6 3-11 8-15a42 42 0 0 0-24-76z" fill="#ffd54d" stroke="#e8a817" stroke-width="3"/>
    <path d="M150 112l5-18 5 12 5-12 5 18" fill="none" stroke="#e07b12" stroke-width="3" stroke-linejoin="round"/>
    <rect x="144" y="143" width="32" height="16" rx="4" fill="#9aa5ad"/><rect x="149" y="159" width="22" height="8" rx="3" fill="#7d8890"/>
    <g class="heat" stroke="#ef6b4a" stroke-width="4" fill="none" stroke-linecap="round"><path d="M232 150c-6-8 6-12 0-20s6-12 0-20"/><path d="M252 150c-6-8 6-12 0-20s6-12 0-20"/></g>
    <text x="250" y="178" text-anchor="middle" class="svg-t">حرارة</text><text x="80" y="178" text-anchor="middle" class="svg-t">ضوء</text></svg>`,
  fan: `<svg viewBox="0 0 320 200" class="anim" role="img" aria-label="مروحة تدور شفراتها">
    <circle cx="160" cy="86" r="66" fill="#e8f7f4" stroke="#7fcfc0" stroke-width="4"/>
    <g class="spin" style="transform-origin:160px 86px"><path d="M160 86c-6-22 0-46 14-52 10 14 2 38-14 52z" fill="#2bb3a3"/><path d="M160 86c22-6 46 0 52 14-14 10-38 2-52-14z" fill="#2bb3a3"/><path d="M160 86c6 22 0 46-14 52-10-14-2-38 14-52z" fill="#2bb3a3"/><path d="M160 86c-22 6-46 0-52-14 14-10 38-2 52 14z" fill="#2bb3a3"/></g>
    <circle cx="160" cy="86" r="10" fill="#1a7f74"/><rect x="154" y="152" width="12" height="22" fill="#9aa5ad"/><rect x="124" y="172" width="72" height="12" rx="6" fill="#7d8890"/>
    <g class="wind" stroke="#7fcfc0" stroke-width="4" fill="none" stroke-linecap="round"><path d="M248 60h36M240 86h50M248 112h36"/></g>
    <text x="268" y="150" text-anchor="middle" class="svg-t">حركة</text></svg>`,
  speaker: `<svg viewBox="0 0 320 200" class="anim" role="img" aria-label="مكبر صوت تخرج منه موجات صوتية">
    <rect x="70" y="40" width="92" height="124" rx="14" fill="#3b4752"/><circle cx="116" cy="118" r="30" fill="#25303a" stroke="#6b7a86" stroke-width="4"/><circle class="cone" cx="116" cy="118" r="12" fill="#6b7a86"/><circle cx="116" cy="66" r="12" fill="#25303a" stroke="#6b7a86" stroke-width="3"/>
    <g class="waves" fill="none" stroke="#2bb3a3" stroke-width="5" stroke-linecap="round"><path class="w1" d="M184 90q14 28 0 56"/><path class="w2" d="M206 76q24 42 0 84"/><path class="w3" d="M228 62q34 56 0 112"/></g>
    <text x="250" y="190" text-anchor="middle" class="svg-t">صوت</text></svg>`,
  sun: `<svg viewBox="0 0 320 200" class="anim" role="img" aria-label="الشمس تضيء ألواحا شمسية">
    <g class="rays" stroke="#f5b72a" stroke-width="5" stroke-linecap="round"><path d="M70 10v14M70 106v14M16 64h14M110 64h14M32 26l10 10M98 92l10 10M108 26 98 36M42 92l-10 10"/></g>
    <circle class="glow" cx="70" cy="64" r="34" fill="#ffd54d"/><circle cx="70" cy="64" r="26" fill="#ffc531"/>
    <g transform="translate(150 96) skewX(-14)"><rect width="150" height="70" rx="6" fill="#2f7fd1"/><path d="M50 0v70M100 0v70M0 35h150" stroke="#a9d3ff" stroke-width="3"/></g>
    <rect x="200" y="166" width="10" height="24" fill="#7d8890"/><path class="flow" d="M122 84 L170 108" stroke="#f5b72a" stroke-width="5" stroke-dasharray="8 10" stroke-linecap="round"/></svg>`,
  forms: `<svg viewBox="0 0 320 200" class="anim" role="img" aria-label="أمثلة على أشكال الطاقة">
    <g transform="translate(20 30)"><circle class="glow" cx="40" cy="40" r="34" fill="#ffe27a"/><circle cx="40" cy="40" r="22" fill="#ffc531"/><text x="40" y="104" text-anchor="middle" class="svg-t">ضوئية</text></g>
    <g transform="translate(120 30)"><path d="M40 6 22 46h16l-6 34 26-44H42z" fill="#f2b632" class="pulse"/><text x="40" y="104" text-anchor="middle" class="svg-t">كهربائية</text></g>
    <g transform="translate(220 30)"><circle cx="40" cy="44" r="30" fill="#e8f7f4" stroke="#7fcfc0" stroke-width="3"/><g class="spin" style="transform-origin:40px 44px"><path d="M40 44c-4-14 0-28 9-32 6 9 1 23-9 32zM40 44c4 14 0 28-9 32-6-9-1-23 9-32z" fill="#2bb3a3"/></g><text x="40" y="104" text-anchor="middle" class="svg-t">حركية</text></g></svg>`
};

const LESSONS = {
  what: { title: 'ما هي الطاقة؟', mins: 5, thumb: 'bulb', slides: [
    { t: 'ما هي الطاقة؟', p: 'الطاقة هي القدرة على إحداث تغيير، مثل تحريك جسم أو تسخينه أو إضاءة غرفة. نحتاجها في كل نشاط نقوم به.', a: 'forms' },
    { t: 'أشكال الطاقة', p: 'للطاقة أشكال كثيرة، منها: الضوئية والحرارية والحركية والصوتية والكهربائية، والكيميائية المخزّنة في الطعام والبطاريات.', a: 'forms',
      q: { s: 'أين تُخزَّن الطاقة الكيميائية؟', o: ['في الطعام والبطاريات', 'في ضوء المصباح', 'في صوت الجرس'], c: 0, ok: 'أحسنت، الطعام والبطاريات يخزّنان طاقة كيميائية.', no: 'حاول مرة أخرى، فكّر فيما نأكله لنحصل على النشاط.' } },
    { t: 'الطاقة من حولنا', p: 'الشمس تمنحنا الضوء والحرارة، والسيارة تتحرك بطاقة الوقود، والهاتف يعمل بطاقة البطارية.', a: 'sun' }
  ]},
  transform: { title: 'تحولات الطاقة', mins: 7, thumb: 'gear', slides: [
    { t: 'الطاقة تتحول', p: 'الطاقة لا تفنى ولا تُستحدث من العدم، لكنها تتحول من شكل إلى آخر. البطارية مثلا تحوّل طاقتها الكيميائية إلى طاقة كهربائية.', a: 'battery' },
    { t: 'المصباح', p: 'عندما يمر التيار الكهربائي في المصباح تتحول الطاقة الكهربائية إلى طاقة ضوئية، وجزء منها يتحول إلى حرارة؛ لذلك يسخن المصباح.', a: 'bulb',
      q: { s: 'ماذا لاحظت عندما أضاء المصباح؟', o: ['أصبح دافئا', 'أصبح باردا', 'أصدر صوتا عاليا'], c: 0, ok: 'أحسنت، لقد تحولت الطاقة الكهربائية إلى ضوء وحرارة.', no: 'حاول مرة أخرى، وفكّر فيما يحدث داخل المصباح عندما يضيء.' } },
    { t: 'المروحة', p: 'في المروحة محرّك صغير يحوّل الطاقة الكهربائية إلى طاقة حركية تُدير الشفرات فتحرّك الهواء.', a: 'fan',
      q: { s: 'ما الطاقة الناتجة عن دوران المروحة؟', o: ['طاقة صوتية', 'طاقة حركية', 'طاقة ضوئية'], c: 1, ok: 'صحيح، الشفرات تتحرك فهي طاقة حركية.', no: 'حاول مرة أخرى، انظر إلى الشفرات: ماذا تفعل؟' } },
    { t: 'مكبر الصوت', p: 'يحوّل مكبر الصوت الطاقة الكهربائية إلى اهتزازات سريعة، وهذه الاهتزازات تنتقل في الهواء طاقةً صوتية نسمعها.', a: 'speaker',
      q: { s: 'لماذا نسمع الصوت من المكبر؟', o: ['لأنه يضيء', 'لأنه يسخن', 'لأن جزءا منه يهتز'], c: 2, ok: 'أحسنت، الاهتزاز ينتج الصوت.', no: 'حاول مرة أخرى، ضع يدك على مكبر يعمل: ماذا تشعر؟' } },
    { t: 'تذكّر', p: 'كل جهاز كهربائي يحوّل الطاقة الكهربائية إلى شكل نحتاجه: المصباح إلى ضوء، والمروحة إلى حركة، ومكبر الصوت إلى صوت.', a: 'battery' }
  ]},
  sources: { title: 'مصادر الطاقة', mins: 6, thumb: 'wind', slides: [
    { t: 'مصادر متجددة', p: 'المصادر المتجددة لا تنفد مع الاستخدام، مثل الشمس والرياح والمياه الجارية.', a: 'sun' },
    { t: 'مصادر غير متجددة', p: 'النفط والغاز الطبيعي والفحم مصادر غير متجددة؛ تكوّنت عبر ملايين السنين وتنفد مع الاستهلاك.', a: 'forms',
      q: { s: 'أيّ هذه المصادر متجدد؟', o: ['النفط', 'الشمس', 'الفحم'], c: 1, ok: 'صحيح، الشمس مصدر متجدد.', no: 'حاول مرة أخرى، أيّها لا ينفد مهما استخدمناه؟' } },
    { t: 'الطاقة في الإمارات', p: 'في دبي مجمع محمد بن راشد آل مكتوم للطاقة الشمسية، وهو يحوّل ضوء الشمس إلى كهرباء تصل إلى البيوت والمدارس.', a: 'sun' }
  ]}
};
const LESSON_ORDER = ['what', 'transform', 'sources'];

const PRACTICE = {
  arabic: { unit: 'وحدة المفردات', qs: [
    { s: 'ما جمع كلمة «كتاب»؟', o: ['كتب', 'كاتبون', 'مكتبة'], c: 0, e: '«كتب» جمع تكسير لكلمة «كتاب».' },
    { s: 'ما ضدّ كلمة «طويل»؟', o: ['عريض', 'قصير', 'كبير'], c: 1, e: 'الضدّ هو المعنى المعاكس: طويل ← قصير.' },
    { s: 'كلمة «يكتبُ» هي:', o: ['اسم', 'حرف', 'فعل مضارع'], c: 2, e: 'تدل على حدث يقع الآن، فهي فعل مضارع.' } ]},
  math: { unit: 'وحدة العمليات والأشكال', qs: [
    { s: 'ناتج ٧ × ٨ يساوي:', o: ['٥٤', '٥٦', '٤٨'], c: 1, e: '٧ × ٨ = ٥٦.' },
    { s: 'كم ضلعا للمثلث؟', o: ['٣', '٤', '٥'], c: 0, e: 'المثلث له ثلاثة أضلاع وثلاث زوايا.' },
    { s: 'نصف العدد ١٠ هو:', o: ['٢', '٥', '٢٠'], c: 1, e: '١٠ ÷ ٢ = ٥.' } ]},
  social: { unit: 'وحدة وطني الإمارات', qs: [
    { s: 'ما عاصمة دولة الإمارات العربية المتحدة؟', o: ['دبي', 'الشارقة', 'أبوظبي'], c: 2, e: 'أبوظبي هي عاصمة الدولة.' },
    { s: 'كم عدد إمارات الدولة؟', o: ['خمس', 'سبع', 'تسع'], c: 1, e: 'تتكوّن الدولة من سبع إمارات.' },
    { s: 'في أي يوم نحتفل بعيد الاتحاد؟', o: ['٢ ديسمبر', '١ يناير', '١٥ مارس'], c: 0, e: 'قام الاتحاد في ٢ ديسمبر ١٩٧١.' } ]}
};

const QUIZ = [
  { s: 'ما الطاقة الرئيسية الناتجة عن تشغيل المروحة؟', o: ['طاقة حرارية', 'طاقة ضوئية', 'طاقة حركية', 'طاقة صوتية'], c: 2, e: 'المحرّك يحوّل الطاقة الكهربائية إلى حركة تُدير الشفرات.' },
  { s: 'يحوّل المصباح الطاقة الكهربائية إلى:', o: ['طاقة صوتية فقط', 'طاقة ضوئية وحرارية', 'طاقة حركية', 'طاقة كيميائية'], c: 1, e: 'يعطي المصباح ضوءا، ويتحول جزء من الطاقة إلى حرارة.' },
  { s: 'ما الطاقة الناتجة عن مكبر الصوت؟', o: ['طاقة صوتية', 'طاقة ضوئية', 'طاقة حركية', 'طاقة كيميائية'], c: 0, e: 'يهتز جزء في المكبر فتنتقل الاهتزازات في الهواء صوتا.' },
  { s: 'أيّ العبارات الآتية صحيحة؟', o: ['الطاقة تفنى بعد الاستخدام', 'الطاقة تُصنع من لا شيء', 'الطاقة تتحول من شكل إلى آخر', 'الطاقة لها شكل واحد فقط'], c: 2, e: 'الطاقة لا تفنى ولا تُستحدث من العدم، بل تتحول من شكل إلى آخر.' },
  { s: 'ماذا يحدث للمصباح عند فتح المفتاح في الدائرة؟', o: ['يضيء أكثر', 'ينطفئ لأن الدائرة انقطعت', 'يبقى مضيئا', 'يتحول إلى مروحة'], c: 1, e: 'فتح المفتاح يقطع مسار التيار، فلا تصل الطاقة إلى المصباح.' }
];

const GAME_DEV = [
  { id: 'lamp', name: 'المصباح', ans: 'light' },
  { id: 'fan', name: 'المروحة', ans: 'motion' },
  { id: 'speaker', name: 'مكبر الصوت', ans: 'sound' }
];
const GAME_EN = [
  { id: 'light', name: 'طاقة ضوئية' },
  { id: 'motion', name: 'طاقة حركية' },
  { id: 'sound', name: 'طاقة صوتية' }
];

/* ========== رسوم SVG صغيرة ========== */
const MINI = {
  lamp: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><circle cx="32" cy="26" r="20" fill="#fff3c4"/><path d="M32 10a15 15 0 0 0-9 27c2 2 3 4 3 6v3h12v-3c0-2 1-4 3-6a15 15 0 0 0-9-27z" fill="#ffd54d" stroke="#e8a817" stroke-width="2"/><rect x="26" y="46" width="12" height="7" rx="2" fill="#9aa5ad"/></svg>`,
  fan: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><circle cx="32" cy="28" r="22" fill="#e8f7f4" stroke="#7fcfc0" stroke-width="2.5"/><path d="M32 28c-3-10 0-20 6-23 5 6 1 17-6 23zM32 28c10-3 20 0 23 6-6 5-17 1-23-6zM32 28c3 10 0 20-6 23-5-6-1-17 6-23zM32 28c-10 3-20 0-23-6 6-5 17-1 23 6z" fill="#2bb3a3"/><circle cx="32" cy="28" r="4" fill="#1a7f74"/><rect x="29" y="50" width="6" height="8" fill="#9aa5ad"/><rect x="20" y="57" width="24" height="5" rx="2.5" fill="#7d8890"/></svg>`,
  speaker: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><rect x="10" y="8" width="30" height="48" rx="6" fill="#3b4752"/><circle cx="25" cy="38" r="11" fill="#25303a" stroke="#6b7a86" stroke-width="2"/><circle cx="25" cy="18" r="5" fill="#25303a" stroke="#6b7a86" stroke-width="2"/><path d="M46 26q5 6 0 12M51 21q9 11 0 22" fill="none" stroke="#2bb3a3" stroke-width="3" stroke-linecap="round"/></svg>`,
  light: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><circle cx="32" cy="32" r="14" fill="#ffc531"/><g stroke="#f5b72a" stroke-width="4" stroke-linecap="round"><path d="M32 6v8M32 50v8M6 32h8M50 32h8M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6"/></g></svg>`,
  motion: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><path d="M32 8l4 6 7-2 1 7 7 2-3 6 5 5-6 4 2 7-7 1-2 7-6-3-5 5-4-6-7 2-1-7-7-2 3-6-5-5 6-4-2-7 7-1 2-7 6 3z" fill="#2bb3a3"/><circle cx="32" cy="32" r="9" fill="#e8f7f4"/></svg>`,
  sound: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><path d="M10 24h10l14-12v40L20 40H10z" fill="#3b4752"/><path d="M42 24q6 8 0 16M48 18q12 14 0 28" fill="none" stroke="#2bb3a3" stroke-width="4" stroke-linecap="round"/></svg>`,
  gear: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><path d="M24 8l3 5 6-1 1 6 6 2-2 5 4 5-5 3 1 6-6 1-2 6-5-3-5 4-3-5-6 1-1-6-6-2 2-5-4-5 5-3-1-6 6-1 2-6 5 3z" fill="#f2b632"/><circle cx="24" cy="30" r="7" fill="#fff6d8"/><path d="M48 34l2 3 4-1v4l3 2-2 3 2 3-4 1v4l-4-1-2 3-3-2-3 2-1-4-4-1 1-3-2-3 3-2v-4l4 1 2-3z" fill="#1aa37a"/><circle cx="46" cy="44" r="4" fill="#e3f6f1"/></svg>`,
  wind: `<svg viewBox="0 0 64 64" class="mini" aria-hidden="true"><rect x="30" y="26" width="4" height="34" fill="#c9d3d9"/><g fill="#fff" stroke="#9aa5ad" stroke-width="1.5"><path d="M32 26 30 4l4 0z"/><path d="M32 26l19 11-2 3z"/><path d="M32 26 13 37l2 3z"/></g><circle cx="32" cy="26" r="3" fill="#7d8890"/><path d="M4 52h16l-4-8H8z" fill="#2f7fd1"/></svg>`,
  bulb: ''
};
MINI.bulb = MINI.lamp;

const BADGES = [
  { id: 'first', name: 'أول درس', test: s => Object.values(s.lessons).some(l => l.done), color: '#f5b72a' },
  { id: 'lab', name: 'عالم الدوائر', test: s => s.lab.done, color: '#2bb3a3' },
  { id: 'game', name: 'بطل المطابقة', test: s => s.game.done, color: '#ef7d57' },
  { id: 'quiz', name: 'نجم الاختبار', test: s => s.quiz.best !== null && s.quiz.best >= 4, color: '#3a9be0' },
  { id: 'unit', name: 'أنهيت الوحدة', test: s => LESSON_ORDER.every(k => s.lessons[k] && s.lessons[k].done), color: '#1aa37a' }
];
function medal(b, earned) {
  return `<div class="medal ${earned ? 'earned' : ''}" title="${b.name}">
    <svg viewBox="0 0 64 72" aria-hidden="true"><path d="M20 2h10l6 22H24zM34 2h10l-4 22H28z" fill="${earned ? '#e05b5b' : '#cfd6da'}"/>
    <circle cx="32" cy="44" r="24" fill="${earned ? b.color : '#dfe5e8'}"/><circle cx="32" cy="44" r="18" fill="${earned ? '#ffffff55' : '#eef1f3'}"/>
    <path d="m32 32 3.7 7.6 8.3 1.2-6 5.8 1.4 8.3L32 51l-7.4 3.9 1.4-8.3-6-5.8 8.3-1.2z" fill="${earned ? '#fff' : '#c4ccd1'}"/></svg>
    <span>${b.name}</span><span class="sr-only">${earned ? 'تم الحصول عليه' : 'لم يُفتح بعد'}</span></div>`;
}

/* ========== حساب التقدّم ========== */
function progressItems() {
  return [
    ...LESSON_ORDER.map(k => ({ name: LESSONS[k].title, done: !!(store.lessons[k] && store.lessons[k].done) })),
    { name: 'تجربة الدائرة الكهربائية', done: store.lab.done },
    { name: 'لعبة المطابقة', done: store.game.done },
    { name: 'اختبار الوحدة', done: store.quiz.done }
  ];
}
function pct() { const it = progressItems(); return Math.round(it.filter(i => i.done).length / it.length * 100); }
function lessonStatus(k) {
  const l = store.lessons[k];
  if (l && l.done) return { cls: 'done', label: 'مكتمل', ic: 'check' };
  if (l && l.step > 0) return { cls: 'doing', label: 'قيد التعلّم', ic: 'clock' };
  return { cls: 'new', label: 'لم يبدأ', ic: 'lock' };
}
function ring(p, size = 96) {
  const r = 40, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="نسبة التقدّم ${p}٪">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="#e3efe9" stroke-width="10"/>
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="url(#rg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${c * p / 100} ${c}" transform="rotate(-90 50 50)"/>
    <defs><linearGradient id="rg"><stop offset="0" stop-color="#1aa37a"/><stop offset="1" stop-color="#2bb3a3"/></linearGradient></defs>
    <text x="50" y="57" text-anchor="middle" class="ring-t">${ar(p)}٪</text></svg>`;
}
function sidePanel() {
  const it = progressItems(), d = it.filter(i => i.done).length;
  return `<aside class="side" aria-label="تقدّمك">
    <div class="card side-card welcome"><div class="sprout">${icon('sprout')}</div><div><h2>أهلا بك</h2><p>في منصتك التعليمية</p></div></div>
    <a class="card side-card prog" href="#/progress"><div><h2>مستوى التقدّم</h2><div class="bar"><span style="width:${pct()}%"></span></div><p>${ar(d)} من ${ar(it.length)} أنشطة مكتملة</p></div>${ring(pct(), 84)}</a>
    <div class="card side-card"><h2 class="with-ic">إنجازاتك ${icon('trophy', 'ic big')}</h2><div class="medals">${BADGES.slice(0, 3).map(b => medal(b, b.test(store))).join('')}</div></div>
  </aside>`;
}

/* ========== الصفحات ========== */
function pageHome() {
  return `<div class="home-grid">
  <div class="home-main">
    <section class="hero" aria-labelledby="heroT">
      <img class="hero-bg" src="${asset("banner-bg.webp")}" alt="" aria-hidden="true">
      <img class="hero-guide" src="${asset("guide-tablet.webp")}" alt="مرشدة المنصة تحمل جهازا لوحيا">
      <div class="hero-text">
        <h1 id="heroT">تعلّم بمتعة وتفاعل</h1>
        <p class="pill-green">دروس تفاعلية · ألعاب تعليمية · تجارب افتراضية</p>
      </div>
      <div class="subjects">${SUBJECTS.map(s => `
        <a class="subj subj-${s.color}" href="#/subject/${s.id}">
          <h3>${s.name}</h3><img src="${asset(s.img + ".webp")}" alt="" aria-hidden="true">
          <span class="subj-btn">ابدأ التعلّم ${icon('arrow')}</span></a>`).join('')}</div>
    </section>
    <section class="sections" aria-label="أقسام المنصة">
      <a class="sec sec-lab" href="#/lab"><div><h2>المختبر الافتراضي</h2><p>نفّذ التجارب وتعلّم بالتجربة</p><span class="play">${icon('play')}</span></div><img src="${asset("sec-lab.webp")}" alt="" aria-hidden="true"></a>
      <a class="sec sec-games" href="#/game"><div><h2>الألعاب التعليمية</h2><p>تعلّم عبر التحدي والمتعة</p><span class="play">${icon('play')}</span></div><img src="${asset("sec-games.webp")}" alt="" aria-hidden="true"></a>
      <a class="sec sec-lessons" href="#/subject/science"><div><h2>دروس تفاعلية</h2><p>شرح مبسّط بالصور والحركة</p><span class="play">${icon('play')}</span></div><img src="${asset("sec-lessons.webp")}" alt="" aria-hidden="true"></a>
    </section>
    <section class="card latest" aria-labelledby="latestT">
      <h2 id="latestT" class="with-ic">${icon('book')} أحدث الدروس</h2>
      <div class="latest-list">${LESSON_ORDER.map(k => `<a class="latest-item" href="#/lesson/${k}">${MINI[LESSONS[k].thumb]}<span><strong>${LESSONS[k].title}</strong><small>العلوم · ${ar(LESSONS[k].mins)} دقائق</small></span></a>`).join('')}</div>
      <a class="btn btn-soft" href="#/subjects">عرض الكل ${icon('arrow')}</a>
    </section>
  </div>
  ${sidePanel()}
  </div>`;
}

function pageSubjects() {
  return `<section class="page-head card"><h1>المواد الدراسية</h1><p>اختر مادة لتبدأ دروسها وأنشطتها.</p></section>
  <div class="subjects subjects-page">${SUBJECTS.map(s => `
    <a class="subj subj-${s.color}" href="#/subject/${s.id}"><h3>${s.name}</h3><img src="${asset(s.img + ".webp")}" alt="" aria-hidden="true"><small class="subj-hint">${s.hint}</small><span class="subj-btn">ادخل ${icon('arrow')}</span></a>`).join('')}</div>`;
}

function crumbs(list) {
  return `<nav class="crumbs" aria-label="مسار الصفحة">${list.map((c, i) => i < list.length - 1 ? `<a href="${c[1]}">${c[0]}</a><span aria-hidden="true">‹</span>` : `<span aria-current="page">${c[0]}</span>`).join('')}</nav>`;
}

function pageScience() {
  const units = [['وحدة الطاقة', 'bolt', true], ['الحركة والقوى', 'redo', false], ['المادة وخواصها', 'flask', false], ['البيئة والتوازن', 'sprout', false]];
  return `${crumbs([['الرئيسية', '#/'], ['المواد', '#/subjects'], ['العلوم', '']])}
  <section class="unit-hero"><img src="${asset("science-bg.webp")}" alt="" aria-hidden="true"><div class="unit-title card"><span class="u-ic">${icon('flask')}</span><div><h1>مادة العلوم</h1><p>اكتشف العالم من حولك بالتجربة والتفاعل</p></div></div></section>
  <div class="unit-grid">
    <aside class="card units" aria-label="وحدات المادة"><h2>الوحدات</h2>
      ${units.map(u => `<button class="unit-btn ${u[2] ? 'active' : ''}" ${u[2] ? 'aria-current="true"' : 'disabled'}>${icon(u[1])}<span>${u[0]}</span>${u[2] ? '' : '<small>قريبا</small>'}</button>`).join('')}
    </aside>
    <section class="card lessons" aria-labelledby="ulT"><h2 id="ulT" class="with-ic">${icon('bolt')} دروس وحدة الطاقة</h2>
      <ul class="lesson-list">${LESSON_ORDER.map((k, i) => { const st = lessonStatus(k); return `
        <li class="lesson-row"><div class="thumb">${MINI[LESSONS[k].thumb]}</div>
          <div class="l-info"><strong>${ar(i + 1)}. ${LESSONS[k].title}</strong><small>${icon('clock')} ${ar(LESSONS[k].mins)} دقائق · ${ar(LESSONS[k].slides.length)} شرائح</small></div>
          <span class="chip chip-${st.cls}">${icon(st.ic)} ${st.label}</span>
          <a class="btn btn-primary btn-sm" href="#/lesson/${k}" aria-label="افتح درس ${LESSONS[k].title}">${st.cls === 'done' ? 'مراجعة' : st.cls === 'doing' ? 'تابع' : 'ابدأ'}</a></li>`; }).join('')}</ul>
      <div class="unit-acts"><a class="btn btn-soft" href="#/lab">${icon('flask')} المختبر</a><a class="btn btn-soft" href="#/game">${icon('game')} لعبة المطابقة</a><a class="btn btn-soft" href="#/quiz">${icon('quiz')} اختبار الوحدة</a></div>
    </section>
  </div>
  <a class="btn btn-ghost back" href="#/subjects">${icon('arrow-prev')} العودة إلى المواد</a>`;
}

function pagePractice(id) {
  const s = SUBJECTS.find(x => x.id === id), P = PRACTICE[id];
  const best = store.practice[id];
  return `${crumbs([['الرئيسية', '#/'], ['المواد', '#/subjects'], [s.name, '']])}
  <section class="card page-head subj-head subj-${s.color}"><img src="${asset(s.img + ".webp")}" alt="" aria-hidden="true"><div><h1>${s.name}</h1><p>${P.unit} · تدريب سريع من ${ar(P.qs.length)} أسئلة${best != null ? ` · أفضل نتيجة: ${ar(best)} من ${ar(P.qs.length)}` : ''}</p></div></section>
  <section class="card quiz-wrap" id="practice"></section>
  <p class="note">بقية دروس هذه المادة قيد الإعداد، وتتوفر الآن وحدة الطاقة كاملة في <a href="#/subject/science">مادة العلوم</a>.</p>
  <a class="btn btn-ghost back" href="#/subjects">${icon('arrow-prev')} العودة إلى المواد</a>`;
}

function pageLesson(k) {
  const L = LESSONS[k];
  return `${crumbs([['الرئيسية', '#/'], ['العلوم', '#/subject/science'], [L.title, '']])}
  <div class="lesson-grid">
    <aside class="card lesson-nav" aria-label="محتوى الدرس"><h2>محتوى الدرس</h2>
      <ol id="slideList">${L.slides.map((s, i) => `<li><button data-go="${i}">${s.t}</button></li>`).join('')}</ol>
      <div class="lesson-links"><a href="#/lab">${icon('flask')} التجربة التفاعلية</a><a href="#/game">${icon('game')} النشاط</a><a href="#/quiz">${icon('quiz')} الاختبار</a></div>
    </aside>
    <section class="card player" aria-labelledby="lsT">
      <header class="player-head"><h1 id="lsT">${L.title}</h1>
        <div class="steps"><span id="stepTxt"></span><div class="bar" role="progressbar" aria-label="تقدّم الدرس" aria-valuemin="0" aria-valuemax="${L.slides.length}" id="stepBar"><span></span></div></div></header>
      <div class="stage">
        <div class="stage-art" id="art"></div>
        <div class="stage-text"><h2 id="sT"></h2><p id="sP"></p></div>
        <img class="stage-guide" src="${asset("guide-point.webp")}" alt="" aria-hidden="true">
      </div>
      <div class="check" id="check" aria-live="polite"></div>
      <div class="player-ctrl">
        <button class="btn btn-ghost" id="prev">${icon('arrow-prev')} السابق</button>
        <button class="btn btn-primary" id="next">التالي ${icon('arrow-next')}</button>
      </div>
    </section>
  </div>`;
}
function initLesson(k) {
  const L = LESSONS[k]; const rec = store.lessons[k] || (store.lessons[k] = { step: 0, done: false });
  let i = Math.min(rec.step || 0, L.slides.length - 1);
  if (rec.done) i = 0;
  function show() {
    const s = L.slides[i];
    $('#art').innerHTML = ANIM[s.a]; $('#sT').textContent = s.t; $('#sP').textContent = s.p;
    $('#stepTxt').textContent = `الشريحة ${ar(i + 1)} من ${ar(L.slides.length)}`;
    $('#stepBar span').style.width = ((i + 1) / L.slides.length * 100) + '%';
    $('#stepBar').setAttribute('aria-valuenow', i + 1);
    $$('#slideList button').forEach((b, j) => { b.classList.toggle('cur', j === i); b.classList.toggle('seen', j < i || rec.done); b.setAttribute('aria-current', j === i ? 'step' : 'false'); });
    $('#prev').disabled = i === 0;
    const last = i === L.slides.length - 1;
    $('#next').innerHTML = last ? `${rec.done ? 'أنهيت الدرس' : 'إنهاء الدرس'} ${icon('check')}` : `التالي ${icon('arrow-next')}`;
    const c = $('#check');
    if (s.q) {
      c.hidden = false;
      c.innerHTML = `<p class="q-title">${icon('quiz')} سؤال سريع: ${s.q.s}</p><div class="q-opts">${s.q.o.map((o, j) => `<button class="opt" data-j="${j}">${o}</button>`).join('')}</div><p class="fb" id="fb"></p>`;
      $$('.opt', c).forEach(b => b.addEventListener('click', () => {
        const j = +b.dataset.j, ok = j === s.q.c;
        $$('.opt', c).forEach(x => x.classList.remove('wrong'));
        b.classList.add(ok ? 'right' : 'wrong');
        const fb = $('#fb'); fb.className = 'fb ' + (ok ? 'ok' : 'no'); fb.innerHTML = icon(ok ? 'check' : 'x') + (ok ? s.q.ok : s.q.no);
        if (ok) $$('.opt', c).forEach(x => x.disabled = true);
      }));
    } else { c.hidden = true; c.innerHTML = ''; }
    if (!rec.done) { rec.step = Math.max(rec.step, i); save(); }
  }
  $('#prev').onclick = () => { if (i > 0) { i--; show(); } };
  $('#next').onclick = () => {
    if (i < L.slides.length - 1) { i++; show(); return; }
    if (!rec.done) { rec.done = true; rec.step = L.slides.length - 1; save(); toast('أحسنت! أكملت درس ' + L.title); }
    show();
  };
  $$('#slideList button').forEach(b => b.onclick = () => { i = +b.dataset.go; show(); });
  show();
}

/* ========== المختبر ========== */
function pageLab() {
  return `${crumbs([['الرئيسية', '#/'], ['العلوم', '#/subject/science'], ['المختبر', '']])}
  <section class="card page-head with-guide"><div><h1 class="with-ic">${icon('flask')} التجربة التفاعلية</h1><p>اضغط على المفتاح لتغلق الدائرة، وشاهد كيف تتحول الطاقة الكهربائية.</p></div></section>
  <div class="lab-grid">
    <section class="card circuit-card" aria-labelledby="cT"><h2 id="cT">تحويل الطاقة في دائرة كهربائية</h2>
      <div class="circuit" id="circuit"></div>
      <p class="sw-state" id="swState" aria-live="polite"></p>
    </section>
    <aside class="card controls" aria-label="التحكم بالتجربة"><h2>التحكم بالتجربة</h2>
      <label class="ctl">الجهاز في الدائرة<select id="dev"><option value="lamp">مصباح</option><option value="fan">مروحة</option><option value="speaker">جرس صغير</option></select></label>
      <div class="ctl"><span id="batLbl">عدد البطاريات</span><div class="stepper" role="group" aria-labelledby="batLbl"><button class="btn-icon" id="batMinus" aria-label="إنقاص بطارية">−</button><output id="batN">١</output><button class="btn-icon" id="batPlus" aria-label="زيادة بطارية">+</button></div></div>
      <div class="ctl"><span>حالة المفتاح</span><button class="switch" id="sw" role="switch" aria-checked="false"><span class="knob"></span><span class="sw-txt">مفتوح</span></button></div>
      <button class="btn btn-ghost" id="labReset">${icon('redo')} إعادة التجربة</button>
      <div class="result" id="result" aria-live="polite"></div>
      <p class="note small">هذه محاكاة تعليمية مبسطة: زيادة البطاريات تزيد شدة الأثر في الرسم فقط، وليست نموذجا فيزيائيا دقيقا.</p>
    </aside>
  </div>`;
}
function circuitSVG(dev, n, on) {
  const bats = Array.from({ length: n }, (_, i) => `<g transform="translate(${70 + i * 62} 214)"><rect width="54" height="32" rx="6" fill="#2f3b45"/><rect width="22" height="32" rx="6" fill="#f2b632"/><rect x="54" y="10" width="6" height="12" rx="2" fill="#95a5a6"/><path d="M36 7l-7 10h6l-3 9 9-12h-6l3-7z" fill="#ffd54d"/></g>`).join('');
  const level = on ? n : 0;
  let device;
  if (dev === 'lamp') device = `<g transform="translate(330 40)"><circle cx="40" cy="40" r="${30 + level * 10}" fill="#ffe27a" opacity="${on ? 0.25 + level * 0.15 : 0}" class="${on ? 'glow' : ''}"/>
     <path d="M40 8a28 28 0 0 0-16 51c4 3 5 6 5 10v5h22v-5c0-4 1-7 5-10A28 28 0 0 0 40 8z" fill="${on ? '#ffd54d' : '#eef2f4'}" stroke="${on ? '#e8a817' : '#b7c2c8'}" stroke-width="3"/>
     <path d="M32 58l4-14 4 9 4-9 4 14" fill="none" stroke="${on ? '#e07b12' : '#9aa5ad'}" stroke-width="2.5"/><rect x="28" y="74" width="24" height="12" rx="3" fill="#9aa5ad"/></g>`;
  else if (dev === 'fan') device = `<g transform="translate(330 40)"><circle cx="40" cy="38" r="34" fill="#e8f7f4" stroke="#7fcfc0" stroke-width="3"/>
     <g class="${on ? 'spin s' + level : ''}" style="transform-origin:40px 38px"><path d="M40 38c-4-14 0-28 9-32 6 9 1 23-9 32zM40 38c14-4 28 0 32 9-9 6-23 1-32-9zM40 38c4 14 0 28-9 32-6-9-1-23 9-32zM40 38c-14 4-28 0-32-9 9-6 23-1 32 9z" fill="#2bb3a3"/></g><circle cx="40" cy="38" r="5" fill="#1a7f74"/><rect x="36" y="72" width="8" height="14" fill="#9aa5ad"/></g>`;
  else device = `<g transform="translate(330 40)"><rect x="14" y="6" width="44" height="74" rx="8" fill="#3b4752"/><circle cx="36" cy="52" r="15" fill="#25303a" stroke="#6b7a86" stroke-width="3"/><circle cx="36" cy="22" r="7" fill="#25303a" stroke="#6b7a86" stroke-width="2"/>
     <g fill="none" stroke="#2bb3a3" stroke-width="4" stroke-linecap="round" class="${on ? 'waves' : ''}" opacity="${on ? 1 : 0}"><path class="w1" d="M66 36q8 12 0 24"/><path class="w2" d="M76 28q14 20 0 40"/>${level > 1 ? '<path class="w3" d="M86 20q20 28 0 56"/>' : ''}</g></g>`;
  const wire = on ? '#ef6b4a' : '#c47a62';
  const swAngle = on ? 0 : -32;
  return `<svg viewBox="0 0 480 280" role="img" aria-label="دائرة كهربائية فيها ${ar(n)} بطارية ومفتاح ${on ? 'مغلق' : 'مفتوح'}">
    <rect x="10" y="10" width="460" height="260" rx="22" fill="#eef7f6"/>
    <path d="M60 230 H40 V70 H140" fill="none" stroke="${wire}" stroke-width="7" stroke-linecap="round"/>
    <path d="M206 70 H330" fill="none" stroke="${wire}" stroke-width="7" stroke-linecap="round"/>
    <path d="M410 80 H440 V230 H${70 + n * 62}" fill="none" stroke="${wire}" stroke-width="7" stroke-linecap="round"/>
    ${on ? `<path class="flow" d="M60 230 H40 V70 H330 M410 80 H440 V230 H${70 + n * 62}" fill="none" stroke="#ffd54d" stroke-width="3" stroke-dasharray="6 14" stroke-linecap="round"/>` : ''}
    <g class="sw-g"><rect x="130" y="80" width="90" height="16" rx="8" fill="#5b6770"/><circle cx="145" cy="70" r="8" fill="#3b4752"/><circle cx="206" cy="70" r="8" fill="#3b4752"/>
      <rect x="145" y="65" width="64" height="10" rx="5" fill="${on ? '#1aa37a' : '#e05b5b'}" transform="rotate(${swAngle} 145 70)"/></g>
    <text x="175" y="122" text-anchor="middle" class="svg-t">المفتاح: ${on ? 'مغلق' : 'مفتوح'}</text>
    ${bats}${device}
    <text x="370" y="160" text-anchor="middle" class="svg-t">${dev === 'lamp' ? 'المصباح' : dev === 'fan' ? 'المروحة' : 'الجرس'}</text>
  </svg>`;
}
function initLab() {
  let on = false, n = 1, dev = 'lamp';
  const R = {
    lamp: ['أضاء المصباح', 'أحسنت! لقد تحولت الطاقة الكهربائية إلى ضوء وحرارة.'],
    fan: ['دارت المروحة', 'تحولت الطاقة الكهربائية إلى طاقة حركية تُدير الشفرات.'],
    speaker: ['رنّ الجرس', 'تحولت الطاقة الكهربائية إلى اهتزازات نسمعها صوتا.']
  };
  function draw() {
    $('#circuit').innerHTML = circuitSVG(dev, n, on);
    $('#batN').textContent = ar(n);
    $('#batMinus').disabled = n <= 1; $('#batPlus').disabled = n >= 3;
    const sw = $('#sw'); sw.setAttribute('aria-checked', on); sw.classList.toggle('on', on); $('.sw-txt', sw).textContent = on ? 'مغلق' : 'مفتوح';
    $('#swState').innerHTML = on ? `${icon('check')} الدائرة مغلقة: التيار يسري في الأسلاك.` : `${icon('x')} الدائرة مفتوحة: لا يسري التيار. اضغط على المفتاح لتغلق الدائرة.`;
    $('#swState').className = 'sw-state ' + (on ? 'ok' : 'off');
    $('#result').innerHTML = on
      ? `<h3>النتيجة</h3><p class="r-ok">${icon('check')} ${R[dev][0]}</p><p>${R[dev][1]}</p>${n > 1 ? `<p class="small">مع ${ar(n)} بطاريات يصبح الأثر أقوى في هذه المحاكاة.</p>` : ''}`
      : `<h3>النتيجة</h3><p>عند فتح المفتاح ينقطع مسار التيار، فلا تصل الطاقة إلى الجهاز ${dev === 'lamp' ? 'فينطفئ المصباح' : 'فيتوقف'}.</p>`;
  }
  $('#sw').onclick = () => { on = !on; if (on) { store.lab.runs++; if (!store.lab.done) { store.lab.done = true; toast('أحسنت! أكملت تجربة الدائرة الكهربائية'); } save(); } draw(); };
  $('#batMinus').onclick = () => { if (n > 1) { n--; draw(); } };
  $('#batPlus').onclick = () => { if (n < 3) { n++; draw(); } };
  $('#dev').onchange = e => { dev = e.target.value; draw(); };
  $('#labReset').onclick = () => { on = false; n = 1; dev = 'lamp'; $('#dev').value = 'lamp'; draw(); $('#sw').focus(); };
  draw();
}

/* ========== اللعبة ========== */
function pageGame() {
  return `${crumbs([['الرئيسية', '#/'], ['العلوم', '#/subject/science'], ['لعبة المطابقة', '']])}
  <section class="card page-head"><h1 class="with-ic">${icon('game')} لعبة تفاعلية</h1><p>صِل كل جهاز بنوع الطاقة الناتجة عنه: اضغط على الجهاز ثم على نوع الطاقة.</p></section>
  <div class="game-grid" id="game"></div>`;
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function initGame() {
  let sel = null, matched = {}, correct = 0, wrong = 0, t0 = Date.now(), timer;
  const en = shuffle(GAME_EN);
  const root = $('#game');
  root.innerHTML = `<section class="card board" aria-label="لوحة اللعبة">
      <div class="cols"><div class="col" id="devCol" aria-label="الأجهزة">${GAME_DEV.map(d => `<button class="tile dev" data-id="${d.id}" aria-pressed="false">${MINI[d.id]}<span>${d.name}</span><b class="tag" aria-hidden="true"></b></button>`).join('')}</div>
      <div class="col" id="enCol" aria-label="أنواع الطاقة">${en.map(e => `<button class="tile en" data-id="${e.id}">${MINI[e.id]}<span>${e.name}</span><b class="tag" aria-hidden="true"></b></button>`).join('')}</div></div>
      <p class="fb" id="gfb" aria-live="polite">ابدأ باختيار جهاز.</p></section>
    <aside class="card score" aria-label="النتيجة"><div class="stars" id="gStars"></div><div class="sc"><span>${icon('clock')}</span><output id="gTime">٠٠:٠٠</output></div><div class="sc"><small>النقاط</small><output id="gScore">٠</output></div>
      <div class="sc small"><span class="ok">صحيحة: <output id="gOk">٠</output></span><span class="no">خاطئة: <output id="gNo">٠</output></span></div>
      <button class="btn btn-ghost" id="gRestart">${icon('redo')} إعادة اللعبة</button><p class="note small">+١٠ لكل إجابة صحيحة، −٥ لكل محاولة خاطئة.</p></aside>`;
  const score = () => Math.max(0, correct * 10 - wrong * 5);
  const stars = () => wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
  const fmt = s => ar(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
  function upd() {
    $('#gScore').textContent = ar(score()); $('#gOk').textContent = ar(correct); $('#gNo').textContent = ar(wrong);
    $('#gStars').innerHTML = [1, 2, 3].map(k => `<svg class="st ${k <= stars() ? 'on' : ''}" aria-hidden="true"><use href="#i-star"/></svg>`).join('');
  }
  timer = setInterval(() => { const e = $('#gTime'); if (!e) return clearInterval(timer); e.textContent = fmt(Math.floor((Date.now() - t0) / 1000)); }, 500);
  route.cleanup = () => clearInterval(timer);
  const fb = (m, c) => { const f = $('#gfb'); f.className = 'fb ' + c; f.innerHTML = m; };
  $$('.dev', root).forEach(b => b.onclick = () => {
    if (matched[b.dataset.id]) return;
    $$('.dev', root).forEach(x => { x.classList.remove('sel'); x.setAttribute('aria-pressed', 'false'); });
    b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); sel = b.dataset.id;
    fb('اختر الآن نوع الطاقة الناتجة عن ' + GAME_DEV.find(d => d.id === sel).name + '.', '');
  });
  $$('.en', root).forEach(b => b.onclick = () => {
    if (!sel) { fb('اختر جهازا أولا من القائمة.', 'no'); return; }
    if (b.classList.contains('done')) return;
    const d = GAME_DEV.find(x => x.id === sel), db = $(`.dev[data-id="${sel}"]`, root);
    if (d.ans === b.dataset.id) {
      correct++; matched[sel] = true; const tag = ar(correct);
      [db, b].forEach(x => { x.classList.remove('sel'); x.classList.add('done'); x.disabled = true; $('.tag', x).textContent = tag; });
      fb(`${icon('check')} أحسنت! ${d.name} ينتج ${GAME_EN.find(e => e.id === d.ans).name}.`, 'ok'); sel = null;
    } else {
      wrong++; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 500);
      fb(`${icon('x')} حاول مرة أخرى وفكّر فيما يحدث داخل ${d.name}.`, 'no');
    }
    upd();
    if (correct === GAME_DEV.length) finish();
  });
  function finish() {
    clearInterval(timer);
    const s = score(), secs = Math.floor((Date.now() - t0) / 1000);
    store.game.plays++; store.game.done = true; store.game.best = Math.max(store.game.best || 0, s); save();
    const ov = document.createElement('div'); ov.className = 'win card'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'أكملت اللعبة');
    ov.innerHTML = `${confetti()}<svg class="cup" aria-hidden="true"><use href="#i-trophy"/></svg><div class="ribbon">أحسنت</div><p>طابقت الأجهزة الثلاثة في ${fmt(secs)}</p><p class="big-score">نقاطك <strong id="finalScore">${ar(s)}</strong> من ${ar(30)}</p>
      <div class="stars">${[1, 2, 3].map(k => `<svg class="st ${k <= stars() ? 'on' : ''}" aria-hidden="true"><use href="#i-star"/></svg>`).join('')}</div>
      <div class="win-acts"><button class="btn btn-primary" id="gAgain">${icon('redo')} العب مرة أخرى</button><a class="btn btn-soft" href="#/quiz">إلى الاختبار ${icon('arrow')}</a></div>`;
    $('.board', root).appendChild(ov); $('#gAgain').focus();
    $('#gAgain').onclick = initGame;
  }
  $('#gRestart').onclick = initGame;
  upd();
}
function confetti() {
  const c = ['#f5b72a', '#2bb3a3', '#ef7d57', '#1aa37a', '#3a9be0'];
  return `<div class="confetti" aria-hidden="true">${Array.from({ length: 18 }, (_, i) => `<i style="right:${(i * 37) % 100}%;background:${c[i % 5]};animation-delay:${(i % 6) * 0.15}s"></i>`).join('')}</div>`;
}

/* ========== محرك الاختبار ========== */
function runQuiz(root, qs, opts) {
  let i = 0, score = 0, answered = false;
  function show() {
    const q = qs[i]; answered = false;
    root.innerHTML = `<div class="q-head"><span>السؤال ${ar(i + 1)} من ${ar(qs.length)}</span><div class="bar" role="progressbar" aria-label="تقدّم الاختبار" aria-valuemin="0" aria-valuemax="${qs.length}" aria-valuenow="${i}"><span style="width:${i / qs.length * 100}%"></span></div></div>
      <fieldset class="q"><legend><h2>${q.s}</h2></legend><div class="q-opts col">${q.o.map((o, j) => `<button class="opt radio" data-j="${j}"><i></i>${o}</button>`).join('')}</div></fieldset>
      <p class="fb" id="qfb" aria-live="polite"></p>
      <div class="player-ctrl"><span></span><button class="btn btn-primary" id="qNext" disabled>${i === qs.length - 1 ? 'عرض النتيجة' : 'التالي'} ${icon('arrow-next')}</button></div>`;
    $$('.opt', root).forEach(b => b.onclick = () => {
      if (answered) return; answered = true;
      const j = +b.dataset.j, ok = j === q.c; if (ok) score++;
      $$('.opt', root).forEach((x, k) => { x.disabled = true; if (k === q.c) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      const fb = $('#qfb', root); fb.className = 'fb ' + (ok ? 'ok' : 'no');
      fb.innerHTML = `${icon(ok ? 'check' : 'x')} <span>${ok ? 'إجابة صحيحة.' : 'إجابة غير صحيحة.'} ${q.e}</span>`;
      $('.bar span', root).style.width = ((i + 1) / qs.length * 100) + '%';
      const n = $('#qNext', root); n.disabled = false; n.focus();
    });
    $('#qNext', root).onclick = () => { if (i < qs.length - 1) { i++; show(); } else done(); };
  }
  function done() {
    const p = Math.round(score / qs.length * 100);
    opts.onDone(score);
    const st = score === qs.length ? 3 : p >= 60 ? 2 : score > 0 ? 1 : 0;
    root.innerHTML = `<div class="win inline">${score >= Math.ceil(qs.length * 0.6) ? confetti() : ''}<svg class="cup" aria-hidden="true"><use href="#i-trophy"/></svg>
      <div class="ribbon">${score === qs.length ? 'أحسنت' : p >= 60 ? 'عمل جيد' : 'واصل المحاولة'}</div>
      <p class="big-score">نتيجتك <strong id="qScore">${ar(score)}</strong> من ${ar(qs.length)} <small>(${ar(p)}٪)</small></p>
      <div class="stars">${[1, 2, 3].map(k => `<svg class="st ${k <= st ? 'on' : ''}" aria-hidden="true"><use href="#i-star"/></svg>`).join('')}</div>
      <div class="win-acts"><button class="btn btn-primary" id="qAgain">${icon('redo')} إعادة الاختبار</button>${opts.after || ''}</div></div>`;
    $('#qAgain', root).onclick = () => { i = 0; score = 0; show(); };
    $('#qAgain', root).focus();
  }
  show();
}
function pageQuiz() {
  return `${crumbs([['الرئيسية', '#/'], ['العلوم', '#/subject/science'], ['الاختبار', '']])}
  <div class="quiz-grid"><section class="card quiz-wrap" id="quiz" aria-label="الاختبار التفاعلي"></section>
  <aside class="card quiz-side"><h1 class="with-ic">${icon('quiz')} الاختبار التفاعلي</h1><p>خمسة أسئلة عن تحولات الطاقة. اختر إجابة واحدة لكل سؤال.</p>
  ${store.quiz.best !== null ? `<p class="chip chip-done">أفضل نتيجة: ${ar(store.quiz.best)} من ${ar(QUIZ.length)}</p>` : ''}
  <img src="${asset("guide-point.webp")}" alt="" aria-hidden="true" class="quiz-guide"></aside></div>`;
}

function pageProgress() {
  const it = progressItems();
  const q = store.quiz;
  return `<section class="card page-head"><h1 class="with-ic">${icon('chart')} تقدّمي</h1><p>يُحفظ تقدّمك على هذا الجهاز وفي هذا المتصفح فقط.</p></section>
  <div class="prog-grid">
    <section class="card prog-ring">${ring(pct(), 150)}<p>${ar(it.filter(x => x.done).length)} من ${ar(it.length)} أنشطة مكتملة</p></section>
    <section class="card"><h2>الدروس والأنشطة</h2><ul class="checklist">${it.map(x => `<li class="${x.done ? 'done' : ''}">${icon(x.done ? 'check' : 'clock')} <span>${x.name}</span><small>${x.done ? 'مكتمل' : 'لم يكتمل'}</small></li>`).join('')}</ul></section>
    <section class="card"><h2>النتائج</h2><dl class="results">
      <div><dt>الاختبار: آخر نتيجة</dt><dd id="pQuizLast">${q.last === null ? '—' : ar(q.last) + ' من ' + ar(QUIZ.length)}</dd></div>
      <div><dt>الاختبار: أفضل نتيجة</dt><dd>${q.best === null ? '—' : ar(q.best) + ' من ' + ar(QUIZ.length)}</dd></div>
      <div><dt>عدد محاولات الاختبار</dt><dd>${ar(q.attempts)}</dd></div>
      <div><dt>لعبة المطابقة: أفضل نقاط</dt><dd id="pGameBest">${store.game.best === null ? '—' : ar(store.game.best) + ' من ٣٠'}</dd></div>
      ${SUBJECTS.filter(s => PRACTICE[s.id]).map(s => `<div><dt>تدريب ${s.name}</dt><dd>${store.practice[s.id] == null ? '—' : ar(store.practice[s.id]) + ' من ٣'}</dd></div>`).join('')}
    </dl></section>
    <section class="card"><h2>الإنجازات</h2><div class="medals all">${BADGES.map(b => medal(b, b.test(store))).join('')}</div></section>
  </div>
  <div class="danger-zone card"><div><h2>إعادة ضبط البيانات</h2><p>يحذف كل التقدّم والنتائج المحفوظة على هذا الجهاز.</p></div><button class="btn btn-danger" id="resetBtn">${icon('redo')} مسح التقدّم</button></div>`;
}

/* ========== الموجّه ========== */
function route() {
  if (route.cleanup) { route.cleanup(); route.cleanup = null; }
  const h = (location.hash || '#/').slice(1).split('/').filter(Boolean);
  const m = $('#main'); let nav = 'home', html, init;
  const [a, b] = h;
  if (!a) { html = pageHome(); }
  else if (a === 'subjects') { html = pageSubjects(); nav = 'subjects'; }
  else if (a === 'subject' && b === 'science') { html = pageScience(); nav = 'subjects'; }
  else if (a === 'subject' && PRACTICE[b]) { html = pagePractice(b); nav = 'subjects'; init = () => runQuiz($('#practice'), PRACTICE[b].qs, { onDone: s => { store.practice[b] = Math.max(store.practice[b] || 0, s); save(); }, after: `<a class="btn btn-soft" href="#/subjects">المواد ${icon('arrow')}</a>` }); }
  else if (a === 'lesson' && LESSONS[b]) { html = pageLesson(b); nav = 'subjects'; init = () => initLesson(b); }
  else if (a === 'lab') { html = pageLab(); nav = 'lab'; init = initLab; }
  else if (a === 'game') { html = pageGame(); nav = 'game'; init = initGame; }
  else if (a === 'quiz') { html = pageQuiz(); nav = 'quiz'; init = () => runQuiz($('#quiz'), QUIZ, { onDone: s => { const q = store.quiz; q.attempts++; q.last = s; q.best = Math.max(q.best || 0, s); q.done = true; save(); }, after: `<a class="btn btn-soft" href="#/progress">تقدّمي ${icon('arrow')}</a>` }); }
  else if (a === 'progress') { html = pageProgress(); nav = 'progress'; init = () => $('#resetBtn').onclick = askReset; }
  else { html = `<section class="card page-head"><h1>الصفحة غير موجودة</h1><p>عد إلى <a href="#/">الصفحة الرئيسية</a>.</p></section>`; }
  m.innerHTML = `<div class="page">${html}</div>`;
  $$('.main-nav a').forEach(x => x.classList.toggle('active', x.dataset.nav === nav));
  $$('.main-nav a').forEach(x => x.dataset.nav === nav ? x.setAttribute('aria-current', 'page') : x.removeAttribute('aria-current'));
  closeMenu();
  if (init) init();
  window.scrollTo(0, 0);
  if (route.started) m.focus({ preventScroll: true });
  route.started = true;
}
function askReset() {
  const d = $('#confirmDlg');
  const doReset = () => { localStorage.removeItem(KEY); load(); route(); toast('تم مسح التقدّم'); };
  if (typeof d.showModal === 'function') {
    d.returnValue = ''; d.showModal();
    d.onclose = () => { if (d.returnValue === 'ok') doReset(); };
  } else if (confirm('هل تريد مسح كل التقدّم؟')) doReset();
}
function closeMenu() { const n = $('#mainNav'), b = $('#menuBtn'); n.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); b.innerHTML = icon('menu'); b.setAttribute('aria-label', 'فتح القائمة'); }
$('#menuBtn').addEventListener('click', () => {
  const n = $('#mainNav'), b = $('#menuBtn'), open = !n.classList.contains('open');
  n.classList.toggle('open', open); b.setAttribute('aria-expanded', open); b.innerHTML = icon(open ? 'close' : 'menu'); b.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
window.addEventListener('hashchange', route);
route();
