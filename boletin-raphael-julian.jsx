import React, { useState, useEffect, useMemo } from 'react';
import {
  Palette, Atom, Monitor, Music, Dumbbell,
  Languages, Globe, Calculator, BookOpen,
  Pencil, Check, X, Heart, Sparkles, Trophy,
  RotateCcw, TrendingUp, Award, Star, GraduationCap
} from 'lucide-react';

const STORAGE_KEY = 'raphael_grades_ciem_2025_p4_v1';

const INITIAL_SUBJECTS = [
  { id: 'art',      name: 'Arte',              code: 'ART',               evaluations: Array(20).fill(0), nd: 0,   cnd: '' },
  { id: 'science',  name: 'Ciencias',          code: 'SCIENCE',           evaluations: [100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'computer', name: 'Computación',       code: 'COMPUTER',          evaluations: Array(20).fill(0), nd: 96,  cnd: 'A' },
  { id: 'baile',    name: 'Baile',             code: 'BAILE',             evaluations: Array(20).fill(0), nd: 100, cnd: 'A' },
  { id: 'pe',       name: 'Educación Física',  code: 'PHYSICAL EDUCATION',evaluations: Array(20).fill(0), nd: 0,   cnd: '' },
  { id: 'english',  name: 'Inglés',            code: 'ENGLISH',           evaluations: [98,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 99,  cnd: '' },
  { id: 'social',   name: 'Estudios Sociales', code: 'SOCIAL STUDIES',    evaluations: [72,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'math',     name: 'Matemáticas',       code: 'MATHEMATICS',       evaluations: [73,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
  { id: 'spanish',  name: 'Español',           code: 'SPANISH',           evaluations: [75,90,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], nd: 0,   cnd: '' },
];

const ICON_MAP = {
  art: Palette, science: Atom, computer: Monitor, baile: Music,
  pe: Dumbbell, english: Languages, social: Globe, math: Calculator, spanish: BookOpen,
};

const calcAverage = (subject) => {
  const grades = subject.evaluations.filter(v => v > 0);
  if (subject.nd > 0) grades.push(subject.nd);
  if (grades.length === 0) return null;
  return grades.reduce((a, b) => a + b, 0) / grades.length;
};

const gradeColor = (avg) => {
  if (avg === null) return { bg: '#EEEAE0', fg: '#8B8578', label: 'Sin calificar' };
  if (avg >= 95) return { bg: '#E8F0E6', fg: '#2D5F3F', label: 'Excelente' };
  if (avg >= 85) return { bg: '#F0EBD8', fg: '#8B6B1F', label: 'Notable' };
  if (avg >= 70) return { bg: '#F5E6D8', fg: '#A0562A', label: 'Bueno' };
  return { bg: '#F5D8D3', fg: '#A83F34', label: 'A mejorar' };
};

const cndLabel = (cnd) => {
  if (cnd === 'A') return 'Excelente';
  if (cnd === 'B') return 'Bueno';
  if (cnd === 'C') return 'Regular';
  if (cnd === 'D') return 'Deficiente';
  return '—';
};

export default function BoletinRaphaelJulian() {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);

  // Load from persistent storage
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(STORAGE_KEY);
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          if (Array.isArray(parsed) && parsed.length === INITIAL_SUBJECTS.length) {
            setSubjects(parsed);
          }
        }
      } catch (e) {
        // nothing stored yet — keep defaults
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Save to persistent storage whenever subjects change (after load)
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(subjects));
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 1200);
      } catch (e) { /* swallow */ }
    })();
  }, [subjects, loaded]);

  const overallAverage = useMemo(() => {
    const averages = subjects.map(calcAverage).filter(v => v !== null);
    if (averages.length === 0) return null;
    return averages.reduce((a, b) => a + b, 0) / averages.length;
  }, [subjects]);

  const stats = useMemo(() => {
    const withGrades = subjects.filter(s => calcAverage(s) !== null);
    const allGrades = subjects.flatMap(s => {
      const arr = [...s.evaluations.filter(v => v > 0)];
      if (s.nd > 0) arr.push(s.nd);
      return arr;
    });
    const perfect = allGrades.filter(g => g === 100).length;
    const highest = allGrades.length ? Math.max(...allGrades) : null;
    const best = withGrades.length
      ? withGrades.reduce((a, b) => calcAverage(a) >= calcAverage(b) ? a : b)
      : null;
    return {
      active: withGrades.length,
      total: subjects.length,
      perfect,
      highest,
      best,
    };
  }, [subjects]);

  const startEdit = (subject) => {
    setDraft(JSON.parse(JSON.stringify(subject)));
    setEditingId(subject.id);
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveEdit = () => {
    setSubjects(prev => prev.map(s => s.id === draft.id ? draft : s));
    setEditingId(null); setDraft(null);
  };

  const resetAll = () => {
    if (window.confirm('¿Restablecer todas las notas a los valores originales del boletín? Esta acción no se puede deshacer.')) {
      setSubjects(INITIAL_SUBJECTS);
    }
  };

  return (
    <div className="min-h-screen w-full" style={{
      background: 'radial-gradient(ellipse at top, #FBF7EE 0%, #F4EDE0 60%, #EFE6D4 100%)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      color: '#1F1B15',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,400..900&family=DM+Sans:opsz,wght@9..40,300..700&family=JetBrains+Mono:wght@300..600&display=swap');

        .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; font-variation-settings: "SOFT" 50, "WONK" 1; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; font-feature-settings: "tnum"; }

        .grain::before {
          content: "";
          position: fixed; inset: 0;
          pointer-events: none;
          opacity: 0.35;
          mix-blend-mode: multiply;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.09 0 0 0 0 0.07 0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          z-index: 0;
        }

        .card-lift { transition: transform .35s cubic-bezier(.2,.8,.2,1), box-shadow .35s ease, border-color .35s ease; }
        .card-lift:hover { transform: translateY(-3px); box-shadow: 0 18px 40px -18px rgba(31,27,21,.18), 0 2px 6px rgba(31,27,21,.04); }

        .fade-in { animation: fade-in .9s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .slide-up { animation: slide-up .7s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

        .pulse-save { animation: pulse-save 1.2s ease; }
        @keyframes pulse-save { 0%{transform:scale(1)} 40%{transform:scale(1.15); color:#2D5F3F} 100%{transform:scale(1)} }

        .tick {
          background: repeating-linear-gradient(90deg, rgba(31,27,21,0.08) 0 1px, transparent 1px 8px);
          height: 1px;
        }

        .eval-cell { transition: all .2s ease; }
        .eval-cell:hover { transform: scale(1.06); }

        input.eval-input {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          text-align: center;
          width: 100%;
          background: transparent;
          border: 1px solid rgba(31,27,21,0.2);
          border-radius: 4px;
          padding: 4px 2px;
          color: #1F1B15;
          outline: none;
        }
        input.eval-input:focus { border-color: #C08A1E; background: #FFFBF0; }

        .rule { border-top: 1px solid rgba(31,27,21,0.12); }
        .rule-gold { border-top: 2px solid #C08A1E; }

        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 3px 10px; border-radius: 999px;
          font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
          font-weight: 500;
        }

        .headline-num {
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 300;
          letter-spacing: -0.04em;
          line-height: 0.9;
          font-variation-settings: "SOFT" 100, "WONK" 1, "opsz" 144;
        }

        .eyebrow {
          font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #6B665D; font-weight: 500;
        }

        .progress-track { background: rgba(31,27,21,0.08); border-radius: 999px; height: 6px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(.2,.8,.2,1); }

        .btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 999px;
          font-size: 12px; font-weight: 500; letter-spacing: 0.04em;
          border: 1px solid rgba(31,27,21,0.15); background: #FDFAF2;
          color: #1F1B15; cursor: pointer; transition: all .2s ease;
        }
        .btn:hover { background: #1F1B15; color: #FBF7EE; border-color: #1F1B15; }
        .btn-primary { background: #1F1B15; color: #FBF7EE; border-color: #1F1B15; }
        .btn-primary:hover { background: #C08A1E; border-color: #C08A1E; color: #FFFBF0; }
        .btn-ghost { background: transparent; border-color: transparent; }
        .btn-ghost:hover { background: rgba(31,27,21,0.06); color: #1F1B15; border-color: transparent; }

        .serif-italic { font-family: 'Fraunces', Georgia, serif; font-style: italic; font-weight: 300; }

        @media (max-width: 768px) {
          .hero-name { font-size: 48px !important; }
          .hero-avg { font-size: 120px !important; }
        }
      `}</style>

      <div className="grain" />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* TOP BAR */}
        <header className="px-6 md:px-10 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(31,27,21,0.10)' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: '#1F1B15', color: '#FBF7EE',
              display: 'grid', placeItems: 'center',
            }}>
              <GraduationCap size={18} strokeWidth={1.8} />
            </div>
            <div>
              <div className="eyebrow">CIEM · Boletín Académico</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Año 2025 · 3er Grado · Grupo X · Período 4</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="eyebrow" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: saveFlash ? '#2D5F3F' : '#6B665D',
              transition: 'color .3s ease'
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: saveFlash ? '#2D5F3F' : '#C08A1E',
                boxShadow: saveFlash ? '0 0 0 4px rgba(45,95,63,0.15)' : '0 0 0 4px rgba(192,138,30,0.12)',
                transition: 'all .3s ease'
              }} />
              {saveFlash ? 'Guardado' : 'Sincronizado'}
            </span>
            <button className="btn btn-ghost" onClick={resetAll} title="Restablecer valores originales">
              <RotateCcw size={13} strokeWidth={1.8} />
              <span className="hidden md:inline">Restablecer</span>
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="px-6 md:px-10 pt-14 pb-10 fade-in">
          <div className="eyebrow mb-6">Estudiante · Expediente 2025-0078</div>
          <h1 className="font-display hero-name" style={{
            fontSize: 'clamp(56px, 9vw, 128px)',
            fontWeight: 300, lineHeight: 0.92, letterSpacing: '-0.035em',
            color: '#1F1B15', marginBottom: 8,
          }}>
            Raphael <span className="serif-italic" style={{ color: '#C08A1E' }}>Julian</span>
          </h1>
          <div className="font-display" style={{
            fontSize: 'clamp(22px, 3vw, 32px)', fontStyle: 'italic',
            fontWeight: 300, color: '#6B665D', letterSpacing: '-0.01em'
          }}>
            Castrillo Braffett
          </div>

          <div className="mt-10 rule-gold" style={{ maxWidth: 140 }} />
        </section>

        {/* OVERALL AVERAGE HERO */}
        <section className="px-6 md:px-10 pb-14">
          <div className="grid md:grid-cols-12 gap-8 items-end">
            <div className="md:col-span-7 slide-up">
              <div className="eyebrow mb-3">Promedio General</div>
              <div className="headline-num hero-avg" style={{
                fontSize: 'clamp(140px, 22vw, 280px)',
                color: overallAverage !== null ? '#1F1B15' : '#A89F8C',
              }}>
                {overallAverage !== null ? overallAverage.toFixed(1) : '—'}
              </div>
              {overallAverage !== null && (
                <div className="mt-4 serif-italic" style={{ fontSize: 22, color: '#6B665D' }}>
                  {overallAverage >= 95 ? 'Un desempeño excepcional.' :
                   overallAverage >= 90 ? 'Un desempeño sobresaliente.' :
                   overallAverage >= 80 ? 'Un desempeño muy sólido.' :
                   overallAverage >= 70 ? 'Progreso constante.' :
                   'En camino.'}
                </div>
              )}
            </div>
            <div className="md:col-span-5 grid grid-cols-2 gap-5 slide-up" style={{ animationDelay: '.15s' }}>
              <StatCard icon={<BookOpen size={16} strokeWidth={1.8} />} label="Asignaturas con notas" value={`${stats.active}/${stats.total}`} />
              <StatCard icon={<Star size={16} strokeWidth={1.8} />} label="Notas perfectas (100)" value={stats.perfect} />
              <StatCard icon={<TrendingUp size={16} strokeWidth={1.8} />} label="Nota más alta" value={stats.highest ?? '—'} />
              <StatCard icon={<Trophy size={16} strokeWidth={1.8} />} label="Mejor asignatura" value={stats.best ? stats.best.name : '—'} small />
            </div>
          </div>
        </section>

        <div className="px-6 md:px-10">
          <div className="rule" />
        </div>

        {/* SECTION HEADING */}
        <section className="px-6 md:px-10 pt-12 pb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="eyebrow mb-3">Las asignaturas</div>
            <h2 className="font-display" style={{
              fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300,
              letterSpacing: '-0.02em', lineHeight: 1, color: '#1F1B15'
            }}>
              Nueve materias, <span className="serif-italic" style={{ color: '#C08A1E' }}>un año.</span>
            </h2>
          </div>
          <div style={{ fontSize: 13, color: '#6B665D', maxWidth: 360 }}>
            Pulsa <span style={{ fontWeight: 500, color: '#1F1B15' }}>Editar</span> en cualquier asignatura para actualizar las evaluaciones conforme CIEM las publique. Los cambios se guardan automáticamente.
          </div>
        </section>

        {/* SUBJECT GRID */}
        <section className="px-6 md:px-10 pb-20 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {subjects.map((s, i) => (
            <SubjectCard
              key={s.id}
              subject={s}
              index={i}
              isEditing={editingId === s.id}
              draft={editingId === s.id ? draft : null}
              setDraft={setDraft}
              onStartEdit={() => startEdit(s)}
              onCancel={cancelEdit}
              onSave={saveEdit}
              canEditNow={editingId === null || editingId === s.id}
            />
          ))}
        </section>

        <div className="px-6 md:px-10">
          <div className="rule-gold" />
        </div>

        {/* FOOTER / LOVE NOTE */}
        <footer className="px-6 md:px-10 py-20 text-center slide-up">
          <Heart size={28} strokeWidth={1.5} style={{ margin: '0 auto', color: '#C08A1E' }} fill="#C08A1E" />
          <p className="font-display mt-6" style={{
            fontSize: 'clamp(22px, 3vw, 32px)',
            fontStyle: 'italic', fontWeight: 300,
            color: '#1F1B15', letterSpacing: '-0.01em',
            maxWidth: 680, margin: '24px auto 0', lineHeight: 1.3,
          }}>
            Creado con amor por el <span style={{ color: '#C08A1E' }}>papá</span> de Raphael Julian.
          </p>
          <p className="mt-5" style={{ fontSize: 13, color: '#6B665D', letterSpacing: '0.02em' }}>
            Cada nota cuenta una historia. Cada esfuerzo, un paso. Estamos orgullosos de ti, campeón.
          </p>
          <div className="eyebrow mt-10" style={{ opacity: 0.7 }}>
            CIEM · Año Académico 2025 · Período 4
          </div>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Stat Card ---------- */
function StatCard({ icon, label, value, small = false }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'rgba(255,252,244,0.6)',
      border: '1px solid rgba(31,27,21,0.08)',
      borderRadius: 14,
      backdropFilter: 'blur(6px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6B665D', marginBottom: 10 }}>
        {icon}
        <span className="eyebrow" style={{ fontSize: 9 }}>{label}</span>
      </div>
      <div className="font-display" style={{
        fontSize: small ? 20 : 32,
        fontWeight: 400,
        letterSpacing: '-0.02em', lineHeight: 1,
        color: '#1F1B15',
      }}>
        {value}
      </div>
    </div>
  );
}

/* ---------- Subject Card ---------- */
function SubjectCard({ subject, index, isEditing, draft, setDraft, onStartEdit, onCancel, onSave, canEditNow }) {
  const Icon = ICON_MAP[subject.id] || BookOpen;
  const avg = calcAverage(subject);
  const color = gradeColor(avg);
  const delay = `${index * 0.06}s`;

  const data = isEditing ? draft : subject;
  const dataAvg = calcAverage(data);

  const updateEval = (idx, val) => {
    const v = val === '' ? 0 : Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setDraft(d => ({ ...d, evaluations: d.evaluations.map((e, i) => i === idx ? v : e) }));
  };
  const updateNd = (val) => {
    const v = val === '' ? 0 : Math.max(0, Math.min(100, parseInt(val, 10) || 0));
    setDraft(d => ({ ...d, nd: v }));
  };
  const updateCnd = (val) => setDraft(d => ({ ...d, cnd: val.toUpperCase().slice(0, 1) }));

  return (
    <article className="card-lift slide-up" style={{
      background: '#FFFCF4',
      border: '1px solid rgba(31,27,21,0.09)',
      borderRadius: 18,
      padding: 24,
      animationDelay: delay,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* top color stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: color.fg, opacity: 0.9,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: color.bg, color: color.fg,
            display: 'grid', placeItems: 'center',
          }}>
            <Icon size={20} strokeWidth={1.6} />
          </div>
          <div>
            <div className="font-display" style={{
              fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', color: '#1F1B15',
            }}>
              {subject.name}
            </div>
            <div className="eyebrow" style={{ marginTop: 2, fontSize: 9 }}>{subject.code}</div>
          </div>
        </div>
        {!isEditing && canEditNow && (
          <button className="btn btn-ghost" onClick={onStartEdit} title="Editar notas">
            <Pencil size={12} strokeWidth={1.8} />
            Editar
          </button>
        )}
        {isEditing && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-ghost" onClick={onCancel}>
              <X size={13} strokeWidth={2} /> Cancelar
            </button>
            <button className="btn btn-primary" onClick={onSave}>
              <Check size={13} strokeWidth={2} /> Guardar
            </button>
          </div>
        )}
      </div>

      {/* Average display */}
      <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 12 }}>
        <div className="headline-num" style={{
          fontSize: 72, color: dataAvg !== null ? '#1F1B15' : '#B8AF9C',
        }}>
          {dataAvg !== null ? dataAvg.toFixed(1) : '—'}
        </div>
        <div>
          <span className="chip" style={{
            background: gradeColor(dataAvg).bg, color: gradeColor(dataAvg).fg,
          }}>
            {gradeColor(dataAvg).label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-track" style={{ marginTop: 14 }}>
        <div className="progress-fill" style={{
          width: `${dataAvg !== null ? Math.min(100, dataAvg) : 0}%`,
          background: dataAvg !== null ? gradeColor(dataAvg).fg : '#D8D0BF',
        }} />
      </div>

      {/* Evaluations */}
      <div style={{ marginTop: 22 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Evaluaciones</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
          gap: 4,
        }}>
          {data.evaluations.map((val, i) => {
            const isEmpty = val === 0;
            const c = gradeColor(val > 0 ? val : null);
            return (
              <div key={i} className="eval-cell" style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2,
              }}>
                <div style={{
                  fontSize: 8, color: '#A89F8C',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.05em',
                }}>
                  E{i + 1}
                </div>
                {isEditing ? (
                  <input
                    className="eval-input"
                    type="number" min="0" max="100"
                    value={val || ''}
                    onChange={(e) => updateEval(i, e.target.value)}
                    placeholder="—"
                  />
                ) : (
                  <div style={{
                    width: '100%', aspectRatio: '1',
                    display: 'grid', placeItems: 'center',
                    borderRadius: 5,
                    background: isEmpty ? 'rgba(31,27,21,0.04)' : c.bg,
                    color: isEmpty ? '#C0B8A3' : c.fg,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11, fontWeight: 500,
                  }}>
                    {isEmpty ? '—' : val}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ND & CND */}
      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <MetaBlock
          label="Nota Diaria"
          isEditing={isEditing}
          value={data.nd}
          display={data.nd > 0 ? data.nd : '—'}
          color={data.nd > 0 ? gradeColor(data.nd) : null}
          onChange={updateNd}
          type="number"
        />
        <MetaBlock
          label="Conducta"
          isEditing={isEditing}
          value={data.cnd}
          display={data.cnd || '—'}
          sub={data.cnd ? cndLabel(data.cnd) : null}
          color={data.cnd === 'A' ? gradeColor(100) : data.cnd === 'B' ? gradeColor(85) : data.cnd === 'C' ? gradeColor(75) : null}
          onChange={updateCnd}
          type="text"
          placeholder="A/B/C/D"
          maxLength={1}
        />
      </div>
    </article>
  );
}

/* ---------- Meta Block (ND / CND) ---------- */
function MetaBlock({ label, isEditing, value, display, sub, color, onChange, type, placeholder, maxLength }) {
  return (
    <div style={{
      padding: '12px 14px',
      background: color ? color.bg : 'rgba(31,27,21,0.03)',
      border: '1px solid rgba(31,27,21,0.06)',
      borderRadius: 10,
    }}>
      <div className="eyebrow" style={{ fontSize: 9, marginBottom: 6, color: color ? color.fg : '#8B8578' }}>
        {label}
      </div>
      {isEditing ? (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || '0'}
          maxLength={maxLength}
          style={{
            width: '100%', background: 'transparent', border: 'none', outline: 'none',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 500,
            color: color ? color.fg : '#1F1B15',
          }}
        />
      ) : (
        <div>
          <div className="font-mono" style={{
            fontSize: 22, fontWeight: 500,
            color: color ? color.fg : '#B8AF9C',
          }}>
            {display}
          </div>
          {sub && (
            <div style={{ fontSize: 10, color: color ? color.fg : '#8B8578', opacity: 0.75, marginTop: 2 }}>
              {sub}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
