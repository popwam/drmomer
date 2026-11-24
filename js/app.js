'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const config = window.CLINIC_CONFIG;
const navLinks=$$('#nav-links a, .mobile-nav a');
function highlight(id){navLinks.forEach(a=>{const active=a.hash==='#'+id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
const sectionIds=['hero','introduction','work','reviews','contact','booking'];
let scheduled=false;
function updateNavigation(){scheduled=false;const marker=window.innerHeight*.34;let active='hero';for(const id of sectionIds){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<=marker)active=id;}if(window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4)active='booking';highlight(active==='reviews'&&matchMedia('(max-width:850px)').matches?'work':active);}
window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNavigation);}},{passive:true});window.addEventListener('resize',updateNavigation);updateNavigation();
const imageDialog=$('#image-dialog'), largeImage=$('#large-image');
$$('.filter').forEach(button=>button.addEventListener('click',()=>{$$('.filter').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$$('.gallery-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);}));
$$('.gallery-card').forEach(card=>card.addEventListener('click',e=>{if(!imageDialog.showModal)return;e.preventDefault();$('#image-title').textContent=card.dataset.title;largeImage.alt=card.dataset.title;largeImage.src=card.href;imageDialog.showModal();}));
$$('dialog').forEach(dialog=>{$$('[data-close]',dialog).forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});});
const track=$('.reviews-track');function scrollReview(direction){const first=$('.review',track);const gap=parseFloat(getComputedStyle(track).columnGap)||18;const delta=(first.offsetWidth+gap)*direction;track.scrollBy({left:delta,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#review-prev').addEventListener('click',()=>scrollReview(1));$('#review-next').addEventListener('click',()=>scrollReview(-1));
const form=$('#appointment'), error=$('#form-error');
const fields=form.elements;
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
fields.date.min=localDate();
const toAscii=s=>s.replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
const clean=s=>s.replace(/[\r\n\t\u202A-\u202E\u2066-\u2069]+/g,' ').replace(/[*_~`|]/g,' ').replace(/\s+/g,' ').trim();
function errorAt(message,field){error.textContent=message;error.hidden=false;if(field?.closest('details'))field.closest('details').open=true;field?.focus();}
$$('[data-branch]').forEach(link=>link.addEventListener('click',()=>{fields.branch.value=link.dataset.branch;error.hidden=true;}));
$$('[data-service]').forEach(link=>link.addEventListener('click',()=>{fields.specialty.value=link.dataset.service;$('#optional-fields').open=true;}));
form.addEventListener('input',()=>{error.hidden=true;});
function getRows(){const name=clean(fields.patient.value);const phone=toAscii(fields.phone.value).replace(/[\s()-]/g,'');const branch=config?.branches[fields.branch.value];if(name.length<2||!/[\p{L}]/u.test(name)){errorAt('من فضلك أدخل اسم المريض.',fields.patient);return null;}if(!/^\+?[0-9]{7,15}$/.test(phone)){errorAt('من فضلك أدخل رقم هاتف صحيحًا (7 إلى 15 رقمًا).',fields.phone);return null;}if(!branch||!/^\d{8,15}$/.test(branch.whatsapp)){errorAt('من فضلك اختر العيادة المناسبة.',fields.branch[0]);return null;}if(fields.date.validity.badInput||(fields.date.value&&fields.date.value<localDate())){errorAt('اختر تاريخ اليوم أو تاريخًا لاحقًا.',fields.date);return null;}
const rows=[['اسم المريض',name],['رقم الهاتف',phone],['العيادة',branch.name]];
if(fields.visit.value)rows.push(['نوع الزيارة',fields.visit.value]);if(fields.specialty.value)rows.push(['التخصص',fields.specialty.value]);if(fields.date.value)rows.push(['التاريخ المفضل',new Intl.DateTimeFormat('ar-EG',{dateStyle:'full'}).format(new Date(fields.date.value+'T12:00:00'))]);if(fields.period.value)rows.push(['الفترة المفضلة',fields.period.value]);return {rows,branch};}
function messageFor(rows){return ['*طلب حجز جديد | د. محمود أبو عمر*','━━━━━━━━━━━━━━','*البيان | التفاصيل*','━━━━━━━━━━━━━━',...rows.map(([label,value])=>`*${label}* | ${value}`),'━━━━━━━━━━━━━━','برجاء تأكيد الموعد المتاح. شكرًا.'].join('\n');}
form.addEventListener('submit',e=>{e.preventDefault();error.hidden=true;const result=getRows();if(!result)return;if(!navigator.onLine){errorAt('أعد الاتصال بالإنترنت لإرسال طلب الحجز.');return;}const {rows,branch}=result;window.location.assign(`https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(messageFor(rows))}`);});
$('#year').textContent=String(new Date().getFullYear());
