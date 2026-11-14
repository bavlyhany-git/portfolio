import { useState, useEffect } from 'react'
import { sb, fetchData, saveData, logEvent, fetchStats } from './store'

const useHash = () => { const [h, s] = useState(location.hash); useEffect(() => { const f = () => s(location.hash); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, []); return h }
const today = () => new Date().toISOString().slice(0, 10)

function Theme() {
  const [t, setT] = useState(localStorage.getItem('theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
  useEffect(() => { document.documentElement.dataset.theme = t; localStorage.setItem('theme', t) }, [t])
  return <button className="icon" onClick={() => setT(t === 'dark' ? 'light' : 'dark')} aria-label="theme">{t === 'dark' ? '☀️' : '🌙'}</button>
}

function Public({ d, track }) {
  const p = d.profile
  return <>
    <header className="nav"><b>{p.name}</b>
      <nav>{['about', 'skills', d.projects.length ? 'projects' : null, 'education', 'platforms', 'contact'].filter(Boolean).map(s => <a key={s} href={'#' + s} onClick={e => { e.preventDefault(); document.getElementById(s)?.scrollIntoView({ behavior: 'smooth' }) }}>{s}</a>)}</nav>
      <Theme /></header>
    <main>
      <section className="hero"><span className="tag">Available for freelance</span><h1>Hi, I'm <em>{p.name}</em></h1><h2>{p.title}</h2><p>{p.location}</p>
        <div className="row"><a className="btn" href="#contact" onClick={e => { e.preventDefault(); document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }) }}>Contact me</a><a className="btn ghost" href={p.github} target="_blank" rel="noreferrer">GitHub</a></div></section>
      <section id="about"><h3>About</h3><p className="lead">{p.summary}</p></section>
      <section id="skills"><h3>Skills</h3><div className="grid">{d.skills.map(s => <div className="card" key={s.a}><h4>{s.a}</h4><div className="chips">{s.b.split(',').map(x => <span key={x}>{x.trim()}</span>)}</div></div>)}</div></section>
      {d.projects.length > 0 && <section id="projects"><h3>Projects</h3><div className="grid">{d.projects.map(x => <article className="card" key={x.id}>{x.image && <img src={x.image} alt={x.title} />}<h4>{x.title}</h4><p>{x.desc}</p><small>{x.tech}</small>{x.link && <a className="link" href={x.link} target="_blank" rel="noreferrer" onClick={() => track('p:' + x.title)}>Visit →</a>}</article>)}</div></section>}
      <section id="education"><h3>Education & Training</h3><div className="timeline">{d.education.map(e => <div className="card" key={e.a}><h4>{e.a}</h4><p>{e.b}</p><small>{e.c}</small></div>)}</div></section>
      <section id="platforms"><h3>Hire me on</h3><div className="chips big">{d.platforms.map(x => <a key={x.a} href={x.b} target="_blank" rel="noreferrer" onClick={() => track(x.a)}>{x.a} ↗</a>)}</div></section>
      <section id="contact"><h3>Contact</h3><div className="card contact"><a href={'mailto:' + p.email}>✉ {p.email}</a><a href={'tel:' + p.phone.replace(/\s/g, '')}>☎ {p.phone}</a><a href={p.linkedin} target="_blank" rel="noreferrer">in LinkedIn</a><a href={p.github} target="_blank" rel="noreferrer">GitHub</a></div></section>
    </main><footer>© {new Date().getFullYear()} {p.name}</footer></>
}

function Login() {
  const [u, su] = useState(''), [pw, sp] = useState(''), [err, se] = useState('')
  const go = async e => { e.preventDefault(); const { error } = await sb.auth.signInWithPassword({ email: u, password: pw }); if (error) se('بيانات الدخول غير صحيحة') }
  return <div className="login" dir="rtl"><form className="card" onSubmit={go}><h3>تسجيل الدخول للوحة التحكم</h3><input dir="ltr" type="email" placeholder="الإيميل" value={u} onChange={e => su(e.target.value)} /><input dir="ltr" type="password" placeholder="كلمة المرور" value={pw} onChange={e => sp(e.target.value)} />{err && <p className="err">{err}</p>}<button className="btn">دخول</button><Theme /></form></div>
}

const Lines = ({ rows, keys, onChange, hint }) => <><textarea rows={Math.max(4, rows.length + 1)} value={rows.map(r => keys.map(k => r[k]).join(' | ')).join('\n')} onChange={e => onChange(e.target.value.split('\n').filter(l => l.trim()).map(l => Object.fromEntries(keys.map((k, i) => [k, (l.split('|')[i] || '').trim()]))))} /><small>{hint}</small></>

function Admin({ d, set, out, save }) {
  const [ms, sMs] = useState('')
  const doSave = async () => { sMs('جاري الحفظ...'); const e = await save(); sMs(e ? 'فشل: ' + e.message : 'تم الحفظ ✓') }
  const [st, setSt] = useState({ visits: 0, days: {}, clicks: {} }); useEffect(() => { fetchStats().then(setSt) }, [])
  const [tab, setTab] = useState('dash'), [np, sNp] = useState({ u: '', old: '', p: '' }), [msg, sMsg] = useState('')
  const up = fn => { const n = structuredClone(d); fn(n); set(n) }
  const tabs = { dash: 'الداشبورد', profile: 'بياناتي', skills: 'المهارات', projects: 'مشاريعي', edu: 'التعليم', plat: 'المنصات', sec: 'الأمان' }
  const days = [...Array(7)].map((_, i) => { const k = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10); return [k.slice(5), st.days[k] || 0] }), mx = Math.max(1, ...days.map(x => x[1]))
  const chg = async e => { e.preventDefault(); if (np.p.length < 6) return sMsg('كلمة المرور الجديدة قصيرة'); const { error } = await sb.auth.updateUser({ ...(np.u && { email: np.u }), password: np.p }); sMsg(error ? error.message : 'تم التحديث ✓ (لو غيرت الإيميل هيوصلك تأكيد)') }
  return <div className="admin" dir="rtl"><aside><b>لوحة التحكم</b><button className="btn" onClick={doSave}>💾 حفظ التغييرات</button>{ms && <small>{ms}</small>}{Object.entries(tabs).map(([k, v]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{v}</button>)}<a href="#/">عرض الموقع</a><button onClick={out}>خروج</button><Theme /></aside>
    <section className="panel">
      {tab === 'dash' && <><h3>الداشبورد</h3><div className="grid"><div className="card stat"><b>{st.visits}</b>إجمالي الزيارات</div><div className="card stat"><b>{st.days[today()] || 0}</b>زيارات اليوم</div><div className="card stat"><b>{d.projects.length}</b>المشاريع</div></div>
        <div className="card"><h4>آخر 7 أيام</h4><div className="bars">{days.map(([k, v]) => <div key={k}><i style={{ height: v / mx * 100 + '%' }} title={v} /><small>{k}</small></div>)}</div></div>
        <div className="card"><h4>النقرات على الروابط</h4>{Object.entries(st.clicks).sort((a, b) => b[1] - a[1]).map(([k, v]) => <p key={k}>{k}: <b>{v}</b></p>)}{!Object.keys(st.clicks).length && <p>لا توجد نقرات بعد</p>}</div></>}
      {tab === 'profile' && <><h3>بياناتي</h3>{[['name', 'الاسم'], ['title', 'المسمى الوظيفي'], ['location', 'المكان'], ['phone', 'الهاتف'], ['email', 'الإيميل'], ['linkedin', 'LinkedIn'], ['github', 'GitHub']].map(([k, l]) => <label key={k}>{l}<input dir="ltr" value={d.profile[k]} onChange={e => up(n => { n.profile[k] = e.target.value })} /></label>)}<label>نبذة<textarea dir="ltr" rows="6" value={d.profile.summary} onChange={e => up(n => { n.profile.summary = e.target.value })} /></label></>}
      {tab === 'skills' && <><h3>المهارات</h3><Lines rows={d.skills} keys={['a', 'b']} hint="كل سطر: العنوان | المهارات مفصولة بفاصلة" onChange={v => up(n => { n.skills = v })} /></>}
      {tab === 'edu' && <><h3>التعليم والكورسات</h3><Lines rows={d.education} keys={['a', 'b', 'c']} hint="كل سطر: العنوان | الجهة | التاريخ" onChange={v => up(n => { n.education = v })} /></>}
      {tab === 'plat' && <><h3>منصات العمل</h3><Lines rows={d.platforms} keys={['a', 'b']} hint="كل سطر: الاسم | الرابط" onChange={v => up(n => { n.platforms = v })} /></>}
      {tab === 'projects' && <><h3>مشاريعي (تظهر في الموقع فقط عند وجود مشروع)</h3><button className="btn" onClick={() => up(n => { n.projects.push({ id: Date.now(), title: 'مشروع جديد', tech: '', desc: '', link: '', image: '' }) })}>+ إضافة موقع</button>
        {d.projects.map((x, i) => <div className="card" key={x.id}>{[['title', 'العنوان'], ['tech', 'التقنيات'], ['link', 'رابط الموقع'], ['image', 'رابط الصورة']].map(([k, l]) => <label key={k}>{l}<input dir="ltr" value={x[k]} onChange={e => up(n => { n.projects[i][k] = e.target.value })} /></label>)}<label>الوصف<textarea rows="3" value={x.desc} onChange={e => up(n => { n.projects[i].desc = e.target.value })} /></label><button className="btn danger" onClick={() => up(n => { n.projects.splice(i, 1) })}>حذف</button></div>)}</>}
      {tab === 'sec' && <><h3>تغيير بيانات الدخول</h3><form className="card" onSubmit={chg}><input dir="ltr" placeholder="إيميل جديد (اختياري)" value={np.u} onChange={e => sNp({ ...np, u: e.target.value })} /><input type="password" placeholder="كلمة المرور الجديدة" value={np.p} onChange={e => sNp({ ...np, p: e.target.value })} /><button className="btn">حفظ</button>{msg && <p>{msg}</p>}</form></>}
    </section></div>
}

export default function App() {
  const h = useHash(), [d, setD] = useState(null), [ok, setOk] = useState(false), [ready, setReady] = useState(false)
  const isAdmin = h.startsWith('#/admin')
  useEffect(() => { fetchData().then(setD); sb.auth.getSession().then(({ data }) => { setOk(!!data.session); setReady(true) }); const { data: l } = sb.auth.onAuthStateChange((_, s) => setOk(!!s)); return () => l.subscription.unsubscribe() }, [])
  useEffect(() => { if (!isAdmin && !sessionStorage.getItem('v')) { sessionStorage.setItem('v', '1'); logEvent('visit') } }, [isAdmin])
  const save = () => saveData(d)
  if (!d || !ready) return <div className="login">...</div>
  if (isAdmin) return ok ? <Admin d={d} set={setD} save={save} out={() => sb.auth.signOut()} /> : <Login />
  return <Public d={d} track={k => logEvent('click', k)} />
}
