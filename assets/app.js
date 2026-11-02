/* ===== HESIN 站点通用逻辑（多语言版） ===== */
const t = window.__t;
const CAT_LABEL = { trucks: 'nav.trucks', special: 'nav.suv', rv: 'nav.rv' };

const CERTS = [
  { img: 'assets/images/certs/cert_hightech.jpg', name_zh: '高新技术企业证书', name_en: 'High-Tech Enterprise Certificate', issuer_zh: '湖北省科技厅·财政厅·税务局', issuer_en: 'Hubei S&T / Finance / Tax Bureau', year: '2024' },
  { img: 'assets/images/certs/cert_military_civil.jpg', name_zh: '湖北省军民融合企业认定证书', name_en: 'Hubei Military-Civilian Integration Enterprise', issuer_zh: '湖北省委军民融合发展委员会办公室', issuer_en: 'Hubei Military-Civilian Integration Office', year: '2022' },
  { img: 'assets/images/certs/cert_customs.jpg', name_zh: '海关报关单位注册登记证书', name_en: 'Customs Registration Certificate', issuer_zh: '荆州海关', issuer_en: 'Jingzhou Customs', year: '2018' },
  { img: 'assets/images/certs/cert_foreign_trade.jpg', name_zh: '对外贸易经营者备案登记表', name_en: 'Foreign Trade Operator Record', issuer_zh: '湖北省商务厅', issuer_en: 'Hubei Commerce Department', year: '2018' },
  { img: 'assets/images/certs/cert_iso9001.jpg', name_zh: '质量管理体系认证证书（ISO 9001）', name_en: 'Quality Management System (ISO 9001)', issuer_zh: '中汽认证中心 CCAP', issuer_en: 'CCAP', year: '' },
  { img: 'assets/images/certs/cert_iso45001.jpg', name_zh: '职业健康安全管理体系认证（ISO 45001）', name_en: 'Occupational Health & Safety (ISO 45001)', issuer_zh: '中标研国联认证中心', issuer_en: 'Guolian Certification', year: '' },
  { img: 'assets/images/certs/cert_iso14001.jpg', name_zh: '环境管理体系认证（ISO 14001）', name_en: 'Environmental Management (ISO 14001)', issuer_zh: '中标研国联认证中心', issuer_en: 'Guolian Certification', year: '' },
  { img: 'assets/images/certs/miit_announcement_1.jpg', name_zh: '道路机动车辆生产企业及产品公告（第311批）', name_en: 'MIIT Vehicle Production Announcement (Batch 311)', issuer_zh: '工业和信息化部', issuer_en: 'Ministry of Industry & Information Technology', year: '2018' },
  { img: 'assets/images/certs/miit_announcement_2.jpg', name_zh: '道路机动车辆生产企业及产品公告（第311批）· 新产品目录', name_en: 'MIIT Announcement (Batch 311) · New Products', issuer_zh: '工业和信息化部', issuer_en: 'Ministry of Industry & Information Technology', year: '2018' }
];

function ensureLightbox() {
  if (document.getElementById('wb-lightbox')) return;
  const lb = document.createElement('div');
  lb.id = 'wb-lightbox'; lb.className = 'lightbox';
  lb.innerHTML = '<span class="lb-close">&times;</span><img alt="">';
  lb.addEventListener('click', () => lb.classList.remove('open'));
  document.body.appendChild(lb);
}
function openLightbox(src, alt) {
  ensureLightbox();
  const lb = document.getElementById('wb-lightbox');
  lb.querySelector('img').src = src; lb.querySelector('img').alt = alt || '';
  lb.classList.add('open');
}
function renderCerts() {
  const box = document.getElementById('cert-grid');
  if (!box) return;
  const zh = window.__curLang() === 'zh';
  box.innerHTML = CERTS.map(c => {
    const name = zh ? c.name_zh : c.name_en;
    const issuer = zh ? c.issuer_zh : c.issuer_en;
    const cap = (name + ' — ' + issuer + (c.year ? ' · ' + c.year : '')).replace(/'/g, "\\'");
    return `<figure class="cert-item" onclick="openLightbox('${c.img}','${cap}')">
      <div class="cert-thumb"><img src="${c.img}" alt="${name}" loading="lazy"></div>
      <figcaption><strong>${name}</strong><span>${issuer}${c.year ? ' · ' + c.year : ''}</span></figcaption>
    </figure>`;
  }).join('');
}

function vName(v) { return (window.__curLang() === 'zh') ? (v.vehicle_name || '') : (v.vehicle_name_en || v.vehicle_name || ''); }
function vChassis(v) { return (window.__curLang() === 'zh') ? (v.chassis || '') : (v.chassis_en || v.chassis || ''); }
function vBrand(v) { return (window.__curLang() === 'zh') ? v.brand : v.brand_en; }
function vMfr(v) { return (window.__curLang() === 'zh') ? v.enterprise : v.enterprise_en; }
function vMaker(e) { return (window.__curLang() === 'zh') ? (e.maker || '') : (e.maker_en || e.maker || ''); }
function vPhotos(v) { return (window.HESIN_VEHICLE_PHOTOS && v.announcement_model && window.HESIN_VEHICLE_PHOTOS[v.announcement_model]) || []; }

// 燃料/排放标准的本地化（数据源为中文原文，非中文界面统一译出）
const FUEL_EN = { '柴油':'Diesel','汽油':'Gasoline','纯电动':'Pure Electric','混合动力':'Hybrid','插电式混合动力':'Plug-in Hybrid','燃料电池':'Fuel Cell','纯电动/换电':'Pure Electric (swappable)','甲醇':'Methanol','天然气':'CNG','柴油/电混合动力':'Diesel-Hybrid','汽油/电混合动力':'Petrol-Hybrid' };
const EMI_EN = { '国六':'China VI','国五':'China V','国四':'China IV','国三':'China III','国六B':'China VI-B' };
function vFuel(v) { return (window.__curLang() === 'zh') ? (v.fuel_type || '') : (FUEL_EN[v.fuel_type] || v.fuel_type || ''); }
function vEmission(v) { return (window.__curLang() === 'zh') ? (v.emission_standard || '') : (EMI_EN[v.emission_standard] || v.emission_standard || ''); }

function buildNav() {
  const path = location.pathname.split('/').pop() || 'index.html';
  const links = [
    ['index.html', t('nav.home')], ['trucks.html', t('nav.trucks')],
    ['suv.html', t('nav.suv')], ['rv.html', t('nav.rv')], ['gallery.html', t('nav.gallery')], ['about.html', t('nav.about')]
  ];
  const items = links.map(([href, label]) =>
    `<a href="${href}" class="${path === href ? 'active' : ''}">${label}</a>`).join('');
  const langOpts = window.LANGS.map(l =>
    `<option value="${l.code}" ${l.code === window.__curLang() ? 'selected' : ''}>${l.label}</option>`).join('');
  document.getElementById('topbar').innerHTML = `
    <div class="wrap topbar-inner">
      <a href="index.html" class="brand"><img class="logo" src="assets/images/logo/hesin_icon.png" alt="HESIN"> HESIN</a>
      <button class="nav-toggle" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
      <nav class="nav-links">${items}</nav>
      <select class="lang-switch" aria-label="${t('lang.label')}" onchange="setLang(this.value)">${langOpts}</select>
    </div>`;
}

function buildFooter() {
  document.getElementById('site-footer').innerHTML = `
    <div class="wrap footer-grid">
      <div>
        <div class="brand" style="color:#fff"><img class="logo" src="assets/images/logo/hesin_icon.png" alt="HESIN"> HESIN</div>
        <img class="brand-wordmark" src="assets/images/logo/hesin_wordmark_white.png" alt="HESIN">
        <p style="opacity:.8;font-size:14px;margin-top:12px">${t('footer.tagline')}</p>
      </div>
      <div>
        <h4>${t('footer.products')}</h4>
        <a href="trucks.html">${t('nav.trucks')}</a>
        <a href="suv.html">${t('nav.suv')}</a>
        <a href="rv.html">${t('nav.rv')}</a>
        <a href="gallery.html">${t('nav.gallery')}</a>
      </div>
      <div>
        <h4>${t('footer.company')}</h4>
        <a href="about.html">${t('footer.about')}</a>
        <a href="about.html#contact">${t('footer.contact')}</a>
      </div>
    </div>
    <div class="wrap footer-bottom"><span>${t('footer.copy')}</span><a class="icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">粤ICP备2026170727号</a></div>
    <div class="wrap footer-qr">
      <div class="qr-row">
        <div class="qr-card"><img src="assets/images/social/social_wechat_s.jpg" alt="WeChat QR"><span class="qr-name">${t('contact.wechat')}</span></div>
        <div class="qr-card"><img src="assets/images/social/social_whatsapp_s.jpg" alt="WhatsApp QR"><span class="qr-name">${t('social.whatsapp')}</span></div>
        <div class="qr-card"><img src="assets/images/social/social_zalo_s.jpg" alt="Zalo QR"><span class="qr-name">${t('social.zalo')}</span></div>
      </div>
    </div>
    <div class="wrap footer-email">
      <a id="email-link" class="email-btn" href="#" aria-label="Email HESIN"><img src="assets/images/email_icon.png" alt="Email"><span data-i18n="contact.act.mail">${t('contact.act.mail')}</span></a>
    </div>`;
  const em = document.getElementById('email-link');
  if (em) em.href = 'mail' + 'to:13510303518' + '@' + '139.com';
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = window.__t(el.getAttribute('data-i18n')); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.setAttribute('placeholder', window.__t(el.getAttribute('data-i18n-ph'))); });
}

function setLang(lang) {
  localStorage.setItem('hesin_lang', lang);
  const meta = window.LANGS.find(l => l.code === lang) || window.LANGS[0];
  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
  buildNav(); buildFooter(); applyI18n();
  const page = document.body.dataset.page;
  if (page === 'trucks') renderGrid('trucks', 'vehicle-grid');
  if (page === 'suv') renderGrid('special', 'vehicle-grid');
  if (page === 'rv') renderGrid('rv', 'vehicle-grid');
  if (page === 'detail') renderDetail();
  if (page === 'home') renderHomeFeatured();
  if (page === 'about') renderCerts();
}

function esc(s) { return (s == null || s === '') ? '—' : String(s); }
function gvw(v) { return v.gross_mass_kg ? (v.gross_mass_kg / 1000).toFixed(1) + ' t' : '—'; }

function cardHTML(v, cat) {
  const initial = (vName(v) || 'V').slice(0, 1);
  const photos = vPhotos(v);
  const thumb = photos.length
    ? `<img src="${photos[0]}" alt="${esc(vName(v))}" loading="lazy">`
    : `<span>${esc(initial)}</span>`;
  const chassis = vChassis(v) ? t('detail.card.chassis') + ': ' + vChassis(v) : t('detail.card.custom');
  return `<a class="card" href="detail.html?cat=${cat}&model=${encodeURIComponent(v.announcement_model)}">
    <div class="thumb">${thumb}</div>
    <div class="body">
      <div class="model">${esc(v.announcement_model)}</div>
      <h3>${esc(vName(v))}</h3>
      <div class="meta">GVW ${gvw(v)} · ${esc(vEmission(v))} · ${t('detail.row.batch')} ${esc(v.announcement_batch)}</div>
      <div class="tags"><span class="tag">${esc(vFuel(v))}</span><span class="tag">${esc(chassis)}</span></div>
      <div class="more">${t('list.view')}</div>
    </div>
  </a>`;
}

function renderGrid(cat, gridId) {
  const data = (window.HESIN_VEHICLES && window.HESIN_VEHICLES[cat]) || [];
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = data.length
    ? data.map(v => cardHTML(v, cat)).join('')
    : `<p style="color:var(--muted)">${t('list.nomodels')}</p>`;
  const counter = document.getElementById('count-' + cat);
  if (counter) counter.textContent = data.length;
}

function renderHomeFeatured() {
  const box = document.getElementById('home-featured');
  if (!box) return;
  const cats = ['trucks', 'special', 'rv'];
  let html = '';
  cats.forEach(cat => {
    const list = (window.HESIN_VEHICLES[cat] || []).slice(0, 3);
    html += `<h3 class="section-title" style="margin-top:34px">${t(CAT_LABEL[cat])} <span style="color:var(--muted);font-weight:400;font-size:16px">· ${window.HESIN_VEHICLES[cat].length} ${t('home.models')}</span></h3>`;
    html += `<div class="grid" style="margin-top:16px">${list.map(v => cardHTML(v, cat)).join('')}</div>`;
  });
  box.innerHTML = html;
}

function renderDetail() {
  const box = document.getElementById('vehicle-detail');
  if (!box) return;
  const p = new URLSearchParams(location.search);
  const cat = p.get('cat'); const model = p.get('model');
  const list = (window.HESIN_VEHICLES && window.HESIN_VEHICLES[cat]) || [];
  const v = list.find(x => x.announcement_model === model);
  if (!v) { box.innerHTML = '<p>' + t('list.nomodels') + '</p>'; return; }
  const initial = (vName(v) || 'V').slice(0, 1);
  const photos = vPhotos(v);
  const engines = (v.engines && v.engines.length)
    ? '<ul class="engine-list">' + v.engines.map(e =>
        `<li>${esc(e.model)} — ${esc(vMaker(e))} — ${e.power_kw ? e.power_kw + ' kW' : t('detail.row.engines')}</li>`).join('') + '</ul>'
    : '—';
  const rows = [
    ['detail.row.model', v.announcement_model],
    ['detail.row.name', vName(v)],
    ['detail.row.brand', vBrand(v)],
    ['detail.row.mfr', vMfr(v)],
    ['detail.row.batch', v.announcement_batch],
    ['detail.row.date', v.announcement_date],
    ['detail.row.emission', vEmission(v)],
    ['detail.row.fuel', vFuel(v)],
    ['detail.row.gvw', v.gross_mass_kg ? v.gross_mass_kg + ' kg' : ''],
    ['detail.row.curb', v.curb_mass_kg ? v.curb_mass_kg + ' kg' : ''],
    ['detail.row.payload', v.rated_load_kg ? v.rated_load_kg + ' kg' : ''],
    ['detail.row.axle', v.axle_count],
    ['detail.row.wheelbase', v.wheelbase_mm],
    ['detail.row.tires', v.tires],
    ['detail.row.overall', v.overall_dimensions_mm],
    ['detail.row.cargo', v.cargo_dimensions_mm],
    ['detail.row.chassis', vChassis(v)],
    ['detail.row.speed', v.max_speed_kmh],
    ['detail.row.engines', engines]
  ];
  const tbody = rows.map(([k, val]) => `<tr><th>${t(k)}</th><td>${val}</td></tr>`).join('');
  const hero = photos.length
    ? `<img src="${photos[0]}" alt="${esc(vName(v))}" onclick="openLightbox('${photos[0]}','${esc(vName(v))}')">`
    : esc(initial);
  const thumbs = photos.length > 1
    ? `<div class="photo-thumbs">${photos.slice(1).map((s,i)=>`<img src="${s}" alt="${esc(vName(v))} ${i+2}" loading="lazy" onclick="openLightbox('${s}','${esc(vName(v))}')">`).join('')}</div>`
    : '';
  box.innerHTML = `
    <div class="detail-head">
      <div class="big-thumb media">${hero}</div>
      <div>
        <div class="eyebrow">${t(CAT_LABEL[cat] || 'nav.home')}</div>
        <h1 style="font-size:32px;margin:6px 0">${esc(vName(v))}</h1>
        <div class="model" style="color:var(--blue);font-weight:700">${esc(v.announcement_model)}</div>
        <p style="color:var(--muted);margin-top:8px">${t('detail.specs')} ${esc(vEmission(v))}</p>
        <a href="about.html#contact" class="btn btn-blue" style="margin-top:14px">${t('detail.inquire')}</a>
      </div>
    </div>
    ${thumbs}
    <table class="spec-table"><tbody>${tbody}</tbody></table>
    <p class="note" style="margin-top:14px">${t('detail.note')}</p>`;
}

async function submitLead(e) {
  e.preventDefault();
  const alertBox = document.getElementById('form-alert');
  const btn = document.getElementById('submit-btn');
  const form = e.target;
  const email = form.email.value.trim();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    alertBox.className = 'alert err'; alertBox.textContent = t('form.errEmail'); return;
  }
  alertBox.className = 'alert'; alertBox.textContent = '';
  btn.disabled = true; btn.textContent = t('form.submitting');
  try {
    const cloud = getCloud();
    const payload = {
      customer_type: form.customer_type.value,
      name: form.elements['name'].value.trim(),
      company: form.company.value.trim(),
      email,
      phone: form.phone.value.trim(),
      country: form.country.value.trim(),
      vehicle_interest: form.vehicle_interest.value,
      message: form.message.value.trim()
    };
    const { error } = await cloud.database.from('leads').insert(payload);
    if (error) throw error;
    alertBox.className = 'alert ok';
    alertBox.textContent = t('form.ok');
    form.reset();
  } catch (err) {
    alertBox.className = 'alert err';
    alertBox.textContent = t('form.errFail');
  } finally {
    btn.disabled = false; btn.textContent = t('form.submit');
  }
}

function initFloating() {
  if (document.getElementById('wa-fab')) return;
  // WhatsApp 悬浮按钮（海外买家习惯：随时点击发起聊天）
  const wa = document.createElement('a');
  wa.id = 'wa-fab'; wa.className = 'wa-fab';
  wa.href = 'https://wa.me/8613510303518';
  wa.target = '_blank'; wa.rel = 'noopener';
  wa.setAttribute('aria-label', 'Chat on WhatsApp');
  wa.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.04 2a9.9 9.9 0 0 0-8.5 15L2.1 22l5.15-1.35A9.9 9.9 0 1 0 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.1.11-1.78-.11-.41-.13-.94-.31-1.62-.6-2.85-1.23-4.71-4.1-4.86-4.29-.14-.19-1.16-1.54-1.16-2.94 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36h.55c.17 0 .41-.07.64.49.24.58.81 1.99.88 2.13.07.15.12.32.02.51-.09.2-.17.32-.34.5-.17.17-.36.39-.51.52-.17.15-.35.31-.15.66.2.34.89 1.47 1.91 2.38 1.31 1.17 2.42 1.53 2.76 1.7.34.17.54.14.74-.09.2-.22.86-1 1.09-1.35.22-.34.45-.28.75-.17.31.11 1.96.93 2.3 1.1.34.17.56.25.65.39.08.15.08.83-.16 1.53z" fill="currentColor"/></svg>';
  document.body.appendChild(wa);
  // 返回顶部
  const btt = document.createElement('button');
  btt.id = 'back-top'; btt.className = 'back-top';
  btt.type = 'button';
  btt.setAttribute('aria-label', 'Back to top');
  btt.innerHTML = '&#8593;';
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(btt);
  window.addEventListener('scroll', () => {
    btt.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = window.__curLang();
  const meta = window.LANGS.find(l => l.code === lang) || window.LANGS[0];
  document.documentElement.lang = lang;
  document.documentElement.dir = meta.dir;
  buildNav(); buildFooter();
  const page = document.body.dataset.page;
  if (page === 'trucks') renderGrid('trucks', 'vehicle-grid');
  if (page === 'suv') renderGrid('special', 'vehicle-grid');
  if (page === 'rv') renderGrid('rv', 'vehicle-grid');
  if (page === 'detail') renderDetail();
  if (page === 'home') renderHomeFeatured();
  if (page === 'about') {
    const f = document.getElementById('lead-form');
    if (f) f.addEventListener('submit', submitLead);
    renderCerts();
  }
  applyI18n();
  initFloating();
});
