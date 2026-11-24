'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const config = window.CLINIC_CONFIG;
const menu = $('.menu-toggle'), nav = $('#nav-links');
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','فتح القائمة');}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'إغلاق القائمة':'فتح القائمة');});
$$('#nav-links a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.nav-shell'))closeMenu();});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){$$('#nav-links a').forEach(a=>{const active=a.hash==='#'+e.target.id;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}},{rootMargin:'-20% 0px -55% 0px'});$$('#nav-links a').forEach(a=>{const target=$(a.hash);if(target)observer.observe(target);});}
const imageDialog=$('#image-dialog'), largeImage=$('#large-image');
$$('.filter').forEach(button=>button.addEventListener('click',()=>{$$('.filter').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});$$('.gallery-card').forEach(card=>card.hidden=button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter);}));
$$('.gallery-card').forEach(card=>card.addEventListener('click',e=>{if(!imageDialog.showModal)return;e.preventDefault();$('#image-title').textContent=card.dataset.title;largeImage.alt=card.dataset.title;largeImage.src=card.href;imageDialog.showModal();}));
$$('dialog').forEach(dialog=>{$$('[data-close]',dialog).forEach(button=>button.addEventListener('click',()=>dialog.close()));dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});});
const track=$('.reviews-track');function scrollReview(direction){const first=$('.review',track);const gap=parseFloat(getComputedStyle(track).columnGap)||18;const delta=(first.offsetWidth+gap)*direction;track.scrollBy({left:delta,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
$('#review-prev').addEventListener('click',()=>scrollReview(1));$('#review-next').addEventListener('click',()=>scrollReview(-1));
const form=$('#appointment'), error=$('#form-error'), dialog=$('#booking-dialog'), send=$('#send-whatsapp');
const fields=form.elements;
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
fields.date.min=localDate();
const toAscii=s=>s.replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
const clean=s=>s.replace(/[\r\n\t\u202A-\u202E\u2066-\u2069]+/g,' ').replace(/[*_~`|]/g,' ').replace(/\s+/g,' ').trim();
function errorAt(message,field){error.textContent=message;error.hidden=false;field?.focus();}
$$('[data-branch]').forEach(link=>link.addEventListener('click',()=>{fields.branch.value=link.dataset.branch;error.hidden=true;}));
// Service context is optional and resettable through the form; it is not sensitive medical history.
$$('[data-service]').forEach(link=>link.addEventListener('click',()=>{fields.specialty.value=link.dataset.service;}));
form.addEventListener('input',()=>{error.hidden=true;});
function getRows(){const name=clean(fields.patient.value);const phone=toAscii(fields.phone.value).replace(/[\s()-]/g,'');const branch=config?.branches[fields.branch.value];if(name.length<2||!/[\p{L}]/u.test(name)){errorAt('من فضلك أدخل اسم المريض.',fields.patient);return null;}if(!/^\+?[0-9]{7,15}$/.test(phone)){errorAt('من فضلك أدخل رقم هاتف صحيحًا (7 إلى 15 رقمًا).',fields.phone);return null;}if(!branch||!/^\d{8,15}$/.test(branch.whatsapp)){errorAt('من فضلك اختر العيادة المناسبة.',fields.branch);return null;}if(!['كشف جديد','متابعة'].includes(fields.visit.value)){errorAt('من فضلك اختر نوع الزيارة.',fields.visit);return null;}if(fields.date.value&&(fields.date.value<localDate()||fields.date.validity.badInput)){errorAt('اختر تاريخ اليوم أو تاريخًا لاحقًا.',fields.date);return null;}if(!fields.consent.checked){errorAt('يرجى الموافقة على مشاركة البيانات مع العيادة عبر واتساب.',fields.consent);return null;}
const date=fields.date.value?new Intl.DateTimeFormat('ar-EG',{dateStyle:'full'}).format(new Date(fields.date.value+'T12:00:00')):'بدون تفضيل';
const rows=[['اسم المريض',name],['رقم الهاتف',phone],['العيادة',branch.name],['نوع الزيارة',fields.visit.value],['التخصص',fields.specialty.value||'بدون تحديد'],['التاريخ المفضل',date],['الفترة المفضلة',fields.period.value||'بدون تفضيل']];return {rows,branch};}
function messageFor(rows){return ['*طلب حجز جديد | د. محمود أبو عمر*','━━━━━━━━━━━━━━','*البيان | التفاصيل*','━━━━━━━━━━━━━━',...rows.map(([label,value])=>`*${label}* | ${value}`),'━━━━━━━━━━━━━━','برجاء تأكيد الموعد المتاح. شكرًا.'].join('\n');}
form.addEventListener('submit',e=>{e.preventDefault();error.hidden=true;const result=getRows();if(!result)return;const {rows,branch}=result;const tbody=$('#preview-rows');tbody.replaceChildren();for(const [label,value] of rows){const tr=document.createElement('tr'),th=document.createElement('th'),td=document.createElement('td');th.scope='row';th.textContent=label;td.textContent=value;td.dir=label==='رقم الهاتف'?'ltr':'auto';tr.append(th,td);tbody.append(tr);}send.href=`https://wa.me/${branch.whatsapp}?text=${encodeURIComponent(messageFor(rows))}`;if(dialog.showModal)dialog.showModal();else window.location.href=send.href;});
$('#year').textContent=String(new Date().getFullYear());
