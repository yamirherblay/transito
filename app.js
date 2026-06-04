let allQuestions = [];
let comboQuestions = [];
let examQuestions = [];
let currentPage = 0;
const P = 5;
const TOTAL = 20;
const COMBO_COUNT = 4;

allQuestions = window.PREGUNTAS || [];
comboQuestions = window.PREGUNTAS_COMBO || [];

/* Theme */
function toggleTheme() {
  const html = document.documentElement;
  const theme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  document.getElementById('theme-btn').textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  document.getElementById('theme-btn-home').textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
}

function applyTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-btn').textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
  document.getElementById('theme-btn-home').textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
}

/* Stats */
function getStats() {
  return {
    a: parseInt(localStorage.getItem('aprobados') || '0'),
    d: parseInt(localStorage.getItem('desaprobados') || '0')
  };
}

function updateStatsUI() {
  const s = getStats();
  const el = document.getElementById('stats-display');
  if (el) el.innerHTML = '<span class="ok">\u2705 ' + s.a + '</span> <span class="ko">\u274C ' + s.d + '</span>';
}

function resetStats() {
  if (!confirm('\u00BFSeguro de reiniciar las estad\u00EDsticas?')) return;
  localStorage.setItem('aprobados', '0');
  localStorage.setItem('desaprobados', '0');
  updateStatsUI();
}

/* Screens */
function show(id) {
  ['home','exam','results'].forEach(s => {
    document.getElementById('screen-' + s).style.display = s === id ? 'block' : 'none';
  });
  if (id === 'home') updateStatsUI();
}

function closeExam() {
  document.getElementById('modal-close').style.display = 'flex';
}

function confirmClose(yes) {
  document.getElementById('modal-close').style.display = 'none';
  if (yes) show('home');
}

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function shuffleOpts(q) {
  const idx = shuffle([0,1,2]);
  return {
    id: q.id,
    pregunta: q.pregunta,
    shuffled: idx.map(i => q.opciones[i]),
    correct: idx.indexOf(q.correcta),
    selected: null
  };
}

function startExam() {
  const normales = shuffle(allQuestions).slice(0, TOTAL - COMBO_COUNT);
  const combos = shuffle(comboQuestions).slice(0, COMBO_COUNT);
  const pool = shuffle([...normales, ...combos]);
  examQuestions = pool.map(shuffleOpts);
  currentPage = 0;
  render();
  show('exam');
}

function render() {
  const start = currentPage * P;
  const end = start + P;
  const items = examQuestions.slice(start, end);
  const container = document.getElementById('exam-content');
  container.innerHTML = '';
  items.forEach((q, i) => {
    const qIdx = start + i;
    const num = qIdx + 1;
    const div = document.createElement('div');
    div.className = 'question';
    const pEl = document.createElement('div');
    pEl.className = 'q-num';
    pEl.textContent = num + '. ' + q.pregunta;
    div.appendChild(pEl);
    q.shuffled.forEach((opt, oi) => {
      const letter = String.fromCharCode(65 + oi);
      const label = document.createElement('label');
      label.className = 'option' + (q.selected === oi ? ' selected' : '');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'q' + q.id;
      radio.value = oi;
      if (q.selected === oi) radio.checked = true;
      label.appendChild(radio);
      const span = document.createElement('span');
      span.className = 'opt-letter';
      span.textContent = letter + ')';
      label.appendChild(span);
      label.appendChild(document.createTextNode(' ' + opt));
      label.addEventListener('click', function(e) {
        if (e.target.tagName !== 'INPUT') {
          radio.checked = true;
        }
        examQuestions[qIdx].selected = oi;
        render();
      });
      div.appendChild(label);
    });
    container.appendChild(div);
  });
  document.getElementById('page-info').textContent = 'P\u00E1gina ' + (currentPage + 1) + '/4';
  document.getElementById('prev-btn').style.display = currentPage === 0 ? 'none' : 'inline-block';
  document.getElementById('next-btn').style.display = currentPage < 3 ? 'inline-block' : 'none';
  document.getElementById('eval-btn').style.display = currentPage === 3 ? 'inline-block' : 'none';
  const answered = examQuestions.filter(q => q.selected !== null).length;
  document.getElementById('progress-bar').style.width = (answered / TOTAL * 100) + '%';
  document.getElementById('progress-text').textContent = answered + '/' + TOTAL;
}

function select(idx, val) {
  examQuestions[idx].selected = val;
  render();
}

function prevPage() {
  if (currentPage > 0) { currentPage--; render(); }
}

function nextPage() {
  if (currentPage < 3) { currentPage++; render(); }
  window.scrollTo(0, 0);
}

function evaluar() {
  const unanswered = examQuestions.filter(q => q.selected === null).length;
  if (unanswered > 0) {
    if (!confirm('Tienes ' + unanswered + ' pregunta(s) sin responder. \u00BFDeseas evaluar de todas formas?')) return;
  }
  let score = 0;
  let details = [];
  examQuestions.forEach((q, i) => {
    const correct = q.selected === q.correct;
    if (correct) score += 5;
    details.push({
      num: i + 1,
      pregunta: q.pregunta,
      correcta: String.fromCharCode(65 + q.correct) + ') ' + q.shuffled[q.correct],
      elegida: q.selected !== null ? String.fromCharCode(65 + q.selected) + ') ' + q.shuffled[q.selected] : 'Sin responder',
      ok: correct,
      sinResponder: q.selected === null
    });
  });
  const passed = score >= 70;

  /* Stats */
  let s = getStats();
  if (passed) { s.a++; localStorage.setItem('aprobados', s.a); }
  else { s.d++; localStorage.setItem('desaprobados', s.d); }

  document.getElementById('result-score').textContent = score + '/100';
  document.getElementById('result-pass').textContent = passed ? 'APROBADO' : 'SUSPENDIDO';
  document.getElementById('result-pass').className = passed ? 'pass' : 'fail';
  document.getElementById('result-stats').innerHTML = '<span class="ok">\u2705 ' + s.a + ' aprobados</span> <span class="ko">\u274C ' + s.d + ' desaprobados</span>';

  const list = document.getElementById('result-details');
  list.innerHTML = '';
  details.forEach(d => {
    const row = document.createElement('div');
    if (d.ok) row.className = 'result-row ok';
    else if (d.sinResponder) row.className = 'result-row none';
    else row.className = 'result-row err';
    row.innerHTML = `
      <div class="r-h"><span class="r-num">${d.num}.</span> ${d.pregunta}</div>
      <div class="r-correct"><span class="r-label">Correcta:</span> ${d.correcta}</div>
      <div class="r-your"><span class="r-label">Tu respuesta:</span> ${d.sinResponder ? '<em>Sin responder</em>' : d.elegida}</div>
    `;
    list.appendChild(row);
  });
  show('results');
  window.scrollTo(0, 0);
}

function newExam() {
  show('home');
}

applyTheme();
updateStatsUI();
