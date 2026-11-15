import { useState, useEffect } from 'react'
import { sb, fetchData, saveData, logEvent, fetchStats, uploadImage, sendMessage, fetchMessages, deleteMessage } from './store'
const tx = (v, l) => (v && typeof v === 'object' ? v[l] || v.ar || '' : v || '')
const today = () => new Date().toISOString().slice(0, 10)
const T = { ar: { about: 'نبذة', skills: 'المهارات', projects: 'المشاريع', education: 'التعليم والتدريب', platforms: 'اعمل معي عبر', contact: 'تواصل معي', avail: 'متاح للعمل الحر', hire: 'تواصل معي', visit: 'زيارة الموقع ←', name: 'الاسم', email: 'الإيميل', msg: 'رسالتك', send: 'إرسال', sent: 'تم الإرسال ✓', fail: 'تعذر الإرسال' },
  en: { about: 'About', skills: 'Skills', projects: 'Projects', education: 'Education', platforms: 'Hire me on', contact: 'Contact', avail: 'Available for freelance', hire: 'Contact me', visit: 'Visit site →', name: 'Name', email: 'Email', msg: 'Your message', send: 'Send', sent: 'Sent ✓', fail: 'Could not send' } }
const useHash = () => { const [h, s] = useState(location.hash); useEffect(() => { const f = () => s(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, []); return h }
function Theme() {
  const [t, setT] = useState(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  useEffect(() => { document.documentElement.dataset.theme = t; localStorage.setItem('theme', t) }, [t])
  return <button className="icon" onClick={() => setT(t === 'dark' ? 'light' : 'dark')} aria-label="theme">{t === 'dark' ? '☀️' : '🌙'}</button>
}
const go = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }

function Public({ d, track }) {
  const [l, setL] = useState(localStorage.getItem('lang') || 'ar'), [f, setF] = useState({ name: '', email: '', body: '' }), [st, setSt] = useState('')
  useEffect(() => { document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'; localStorage.setItem('lang', l) }, [l])
  const p = d.profile, t = T[l], ids = ['about', 'skills', d.projects.length ? 'projects' : null, 'education', 'platforms', 'contact'].filter(Boolean)
  const send = async e => { e.preventDefault(); const { error } = await sendMessage(f); setSt(error ? t.fail : t.sent); if (!error) setF({ name: '', email: '', body: '' }) }
  return <>
    <header className="nav"><b>{tx(p.name, l)}</b><nav>{ids.map(s => <a key={s} href={'#' + s} onClick={go(s)}>{t[s]}</a>)}</nav>
      <div className="row"><button className="icon txt" onClick={() => setL(l === 'ar' ? 'en' : 'ar')}>{l === 'ar' ? 'EN' : 'ع'}</button><Theme /></div></header>
    <main>
      <section className="hero"><div><span className="tag">{t.avail}</span><h1><em>{tx(p.name, l)}</em></h1><h2>{tx(p.title, l)}</h2><p className="lead">{tx(p.tagline, l)}</p><p>📍 {tx(p.location, l)}</p>
        <div className="row"><a className="btn" href="#contact" onClick={go('contact')}>{t.hire}</a><a className="btn ghost" href={p.github} target="_blank" rel="noreferrer">GitHub</a><a className="btn ghost" href={p.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></div></div>
        {p.photo && <img className="avatar" src={p.photo} alt={tx(p.name, l)} />}</section>
      <section id="about"><h3>{t.about}</h3><p className="lead">{tx(p.summary, l)}</p></section>
      <section id="skills"><h3>{t.skills}</h3><div className="grid">{d.skills.map((s, i) => <div className="card" key={i}><h4>{tx(s.a, l)}</h4><div className="chips">{tx(s.b, l).split(',').map(x => <span key={x}>{x.trim()}</span>)}</div></div>)}</div></section>
      {d.projects.length > 0 && <section id="projects"><h3>{t.projects}</h3><div className="grid">{d.projects.map(x => <article className="card" key={x.id}>{x.image && <img src={x.image} alt="" />}<h4>{tx(x.title, l)}</h4><p>{tx(x.desc, l)}</p><small dir="ltr">{x.tech}</small>{x.link && <a className="link" href={x.link} target="_blank" rel="noreferrer" onClick={() => track('p:' + tx(x.title, 'en'))}>{t.visit}</a>}</article>)}</div></section>}
      <section id="education"><h3>{t.education}</h3><div className="timeline">{d.education.map((e, i) => <div className="card" key={i}><h4>{tx(e.a, l)}</h4><p>{tx(e.b, l)}</p><small>{e.c}</small></div>)}</div></section>
      <section id="platforms"><h3>{t.platforms}</h3><div className="chips big">{d.platforms.map(x => <a key={x.a} href={x.b} target="_blank" rel="noreferrer" onClick={() => track(x.a)}>{x.a} ↗</a>)}</div></section>
      <section id="contact"><h3>{t.contact}</h3><div className="grid two"><form className="card" onSubmit={send}><input required placeholder={t.name} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><input required type="email" dir="ltr" placeholder={t.email} value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /><textarea required rows="4" placeholder={t.msg} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} /><button className="btn">{t.send}</button>{st && <p>{st}</p>}</form>
        <div className="card contact"><a href={'mailto:' + p.email}>✉ {p.email}</a><a href={'tel:' + p.phone.replace(/\s/g, '')} dir="ltr">☎ {p.phone}</a></div></div></section>
    </main><footer>© {new Date().getFullYear()} {tx(p.name, l)}</footer></>
}

function Login() {
  const [u, su] = useState(''), [pw, sp] = useState(''), [err, se] = useState('')
  const go = async e => { e.preventDefault(); const { error } = await sb.auth.signInWithPassword({ email: u, password: pw }); if (error) se('بيانات الدخول غير صحيحة') }
  return <div className="login" dir="rtl"><form className="card" onSubmit={go}><h3>تسجيل الدخول للوحة التحكم</h3><input dir="ltr" type="email" placeholder="الإيميل" value={u} onChange={e => su(e.target.value)} /><input dir="ltr" type="password" placeholder="كلمة المرور" value={pw} onChange={e => sp(e.target.value)} />{err && <p className="err">{err}</p>}<button className="btn">دخول</button><Theme /></form></div>
}
const F = ({ l, v = {}, on, area }) => { const E = area ? 'textarea' : 'input'; return <div className="fld"><label>{l}</label><div className="two">{['ar', 'en'].map(k => <div key={k}><em>{k === 'ar' ? 'العربية' : 'English'}</em><E dir={k === 'ar' ? 'rtl' : 'ltr'} rows={area ? 5 : undefined} value={v[k] || ''} onChange={e => on({ ...v, [k]: e.target.value })} /></div>)}</div></div> }
const S = ({ l, v, on }) => <div className="fld"><label>{l}</label><input dir="ltr" value={v || ''} onChange={e => on(e.target.value)} /></div>
const List = ({ items, set, make, row }) => <>{items.map((x, i) => <div className="card" key={x.id || i}>{row(x, q => set(items.map((y, j) => j === i ? { ...y, ...q } : y)))}<button className="btn danger" onClick={() => set(items.filter((_, j) => j !== i))}>حذف</button></div>)}<button className="btn ghost" onClick={() => set([...items, make()])}>+ إضافة</button></>
const TABS = [['stats', '📊', 'الإحصائيات'], ['profile', '👤', 'الملف الشخصي'], ['projects', '📁', 'المشاريع'], ['skills', '🛠', 'المهارات'], ['edu', '🎓', 'الخبرات والتعليم'], ['plat', '🔗', 'منصات العمل'], ['msgs', '✉', 'الرسائل'], ['acct', '🔑', 'الحساب وكلمة المرور']]

function Admin({ d, setD, dirty, onSave, onRevert, email }) {
  const [tab, setTab] = useState('stats'), [ms, sMs] = useState(''), [stt, setStt] = useState({ visits: 0, days: {}, clicks: {} }), [msgs, setMsgs] = useState([]), [np, sNp] = useState({ e: '', p: '' }), [am, sAm] = useState('')
  useEffect(() => { fetchStats().then(setStt) }, []); useEffect(() => { if (tab === 'msgs') fetchMessages().then(setMsgs) }, [tab])
  const up = fn => { const n = structuredClone(d); fn(n); setD(n) }
  const save = async () => { sMs('جاري الحفظ...'); const e = await onSave(); sMs(e ? 'فشل: ' + e.message : 'تم الحفظ والنشر ✓') }
  const days = [...Array(7)].map((_, i) => { const k = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10); return [k.slice(5), stt.days[k] || 0] }), mx = Math.max(1, ...days.map(x => x[1]))
  const P = d.profile, sp = (k, v) => up(n => { n.profile[k] = v })
  const chg = async e => { e.preventDefault(); if (np.p && np.p.length < 6) return sAm('كلمة المرور قصيرة'); const { error } = await sb.auth.updateUser({ ...(np.e && { email: np.e }), ...(np.p && { password: np.p }) }); sAm(error ? error.message : 'تم التحديث ✓') }
  const title = TABS.find(t => t[0] === tab)[2]
  return <div className="admin" dir="rtl"><aside><div className="brand"><i>{tx(P.name, 'en')[0]}</i><b>لوحة التحكم</b></div>{TABS.map(([k, ic, v]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><span>{ic}</span>{v}</button>)}<div className="sp" /><a href="#/">↗ عرض الموقع</a><button onClick={() => sb.auth.signOut()}>⎋ تسجيل الخروج</button></aside>
    <div className="body"><div className="top"><Theme /><small dir="ltr">{email}</small><h2>{title}</h2></div>
      <section className="panel">
        {tab === 'stats' && <><div className="grid"><div className="card stat"><b>{stt.visits}</b>إجمالي الزيارات</div><div className="card stat"><b>{stt.days[today()] || 0}</b>زيارات اليوم</div><div className="card stat"><b>{d.projects.length}</b>المشاريع</div></div><div className="card"><h4>آخر 7 أيام</h4><div className="bars">{days.map(([k, v]) => <div key={k}><i style={{ height: v / mx * 100 + '%' }} title={v} /><small>{k}</small></div>)}</div></div><div className="card"><h4>النقرات</h4>{Object.entries(stt.clicks).sort((a, b) => b[1] - a[1]).map(([k, v]) => <p key={k}>{k}: <b>{v}</b></p>)}{!Object.keys(stt.clicks).length && <p>لا توجد نقرات بعد</p>}</div></>}
        {tab === 'profile' && <div className="card"><h4>البيانات الأساسية</h4><div className="fld"><label>صورتي الشخصية</label><input type="file" accept="image/*" onChange={async e => { const f = e.target.files[0]; if (!f) return; if (f.size > 3e6) return sMs('الصورة أكبر من 3MB'); try { sMs('جاري رفع الصورة...'); sp('photo', await uploadImage(f)); sMs('تم الرفع، اضغط حفظ ونشر') } catch (er) { sMs('فشل الرفع: ' + er.message) } }} />{P.photo && <div className="row"><img className="avatar sm" src={P.photo} alt="" /><button className="btn danger" onClick={() => sp('photo', '')}>إزالة</button></div>}</div>
          <F l="الاسم" v={P.name} on={v => sp('name', v)} /><F l="المسمى الوظيفي" v={P.title} on={v => sp('title', v)} /><F l="جملة تعريفية قصيرة" v={P.tagline} on={v => sp('tagline', v)} area /><F l="النبذة" v={P.summary} on={v => sp('summary', v)} area /><F l="المكان" v={P.location} on={v => sp('location', v)} />{[['phone', 'الهاتف'], ['email', 'الإيميل'], ['linkedin', 'LinkedIn'], ['github', 'GitHub']].map(([k, l]) => <S key={k} l={l} v={P[k]} on={v => sp(k, v)} />)}</div>}
        {tab === 'projects' && <><p className="hint">تظهر المشاريع في الموقع فقط عند وجود مشروع واحد على الأقل.</p><List items={d.projects} set={v => up(n => { n.projects = v })} make={() => ({ id: Date.now(), title: { ar: '', en: '' }, desc: { ar: '', en: '' }, tech: '', link: '', image: '' })} row={(x, s) => <><F l="العنوان" v={x.title} on={v => s({ title: v })} /><F l="الوصف" v={x.desc} on={v => s({ desc: v })} area /><S l="التقنيات" v={x.tech} on={v => s({ tech: v })} /><S l="رابط الموقع" v={x.link} on={v => s({ link: v })} /><S l="رابط الصورة" v={x.image} on={v => s({ image: v })} /></>} /></>}
        {tab === 'skills' && <List items={d.skills} set={v => up(n => { n.skills = v })} make={() => ({ a: { ar: '', en: '' }, b: { ar: '', en: '' } })} row={(x, s) => <><F l="العنوان" v={x.a} on={v => s({ a: v })} /><F l="المهارات (مفصولة بفاصلة)" v={x.b} on={v => s({ b: v })} /></>} />}
        {tab === 'edu' && <List items={d.education} set={v => up(n => { n.education = v })} make={() => ({ a: { ar: '', en: '' }, b: { ar: '', en: '' }, c: '' })} row={(x, s) => <><F l="العنوان" v={x.a} on={v => s({ a: v })} /><F l="الجهة" v={x.b} on={v => s({ b: v })} /><S l="التاريخ" v={x.c} on={v => s({ c: v })} /></>} />}
        {tab === 'plat' && <List items={d.platforms} set={v => up(n => { n.platforms = v })} make={() => ({ a: '', b: '' })} row={(x, s) => <><S l="الاسم" v={x.a} on={v => s({ a: v })} /><S l="الرابط" v={x.b} on={v => s({ b: v })} /></>} />}
        {tab === 'msgs' && <>{msgs.map(m => <div className="card" key={m.id}><h4>{m.name} <small dir="ltr">{m.email}</small></h4><p>{m.body}</p><small>{new Date(m.created_at).toLocaleString('ar-EG')}</small><br /><button className="btn danger" onClick={async () => { await deleteMessage(m.id); setMsgs(msgs.filter(x => x.id !== m.id)) }}>حذف</button></div>)}{!msgs.length && <p className="hint">لا توجد رسائل</p>}</>}
        {tab === 'acct' && <form className="card" onSubmit={chg}><S l="إيميل جديد (اختياري)" v={np.e} on={v => sNp({ ...np, e: v })} /><div className="fld"><label>كلمة مرور جديدة</label><input dir="ltr" type="password" value={np.p} onChange={e => sNp({ ...np, p: e.target.value })} /></div><button className="btn">حفظ</button>{am && <p>{am}</p>}</form>}
      </section>
      {tab !== 'stats' && tab !== 'msgs' && tab !== 'acct' && <div className="bar"><button className="btn" disabled={!dirty} onClick={save}>💾 حفظ ونشر</button><button className="btn ghost" disabled={!dirty} onClick={onRevert}>تراجع</button><small>{ms || (dirty ? 'تغييرات غير محفوظة' : 'كل التغييرات محفوظة')}</small></div>}</div></div>
}

export default function App() {
  const h = useHash(), [d, setD] = useState(null), [base, setBase] = useState(null), [ok, setOk] = useState(null), [email, setEmail] = useState('')
  const isAdmin = h.startsWith('#/admin')
  useEffect(() => { fetchData().then(x => { setD(x); setBase(x) }); sb.auth.getSession().then(({ data }) => { setOk(!!data.session); setEmail(data.session?.user.email || '') }); const { data: l } = sb.auth.onAuthStateChange((_, s) => { setOk(!!s); setEmail(s?.user.email || '') }); return () => l.subscription.unsubscribe() }, [])
  useEffect(() => { if (!isAdmin && !sessionStorage.getItem('v')) { sessionStorage.setItem('v', '1'); logEvent('visit') } }, [isAdmin])
  if (!d || ok === null) return <div className="login">...</div>
  if (isAdmin) return ok ? <Admin d={d} setD={setD} email={email} dirty={JSON.stringify(d) !== JSON.stringify(base)} onSave={async () => { const e = await saveData(d); if (!e) setBase(d); return e }} onRevert={() => setD(base)} /> : <Login />
  return <Public d={base} track={k => logEvent('click', k)} />
}
