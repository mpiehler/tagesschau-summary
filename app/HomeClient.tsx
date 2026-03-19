// @ts-nocheck
'use client';
import { useState } from 'react';
import SummaryCard from './SummaryCard';
import BackfillTool from './BackfillTool';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export default function HomeClient({ initialSummaries }) {
  const getDateStr = (iso) => (iso ? iso.split('T')[0] : '');
  const allDays = Array.from(new Set(initialSummaries.map(s => getDateStr(s.published_at)).filter(Boolean)));
  const [selectedDateStr, setSelectedDateStr] = useState(allDays[0] || null);
  const filtered = selectedDateStr ? initialSummaries.filter(s => getDateStr(s.published_at) === selectedDateStr) : initialSummaries;
  const recentDays = allDays.slice(0, 3);
  const olderDays = allDays.slice(3);

  return (
    <main className="container">
      <header className="header">
        <div className="logo-section"><span className="logo-emoji">📺</span><h1>Tagesschau Summary</h1></div>
      </header>
      <div className="top-controls">
        <div className="day-selector">
          {recentDays.map((dayStr, i) => (
            <button key={dayStr} className={selectedDateStr === dayStr ? 'btn-day active' : 'btn-day'} onClick={() => setSelectedDateStr(dayStr)}>
              {i === 0 ? 'Aktuelle Ausgabe' : format(parseISO(dayStr), 'eeee', { locale: de })}
            </button>
          ))}
          {olderDays.length > 0 && (
            <select className="btn-day select-day" value={selectedDateStr || ''} onChange={(e) => setSelectedDateStr(e.target.value || null)}>
              <option value="" disabled>Ältere Folgen...</option>
              {olderDays.map(dayStr => <option key={dayStr} value={dayStr}>{format(parseISO(dayStr), 'dd.MM.yyyy')}</option>)}
              <option value="">Archiv (Alle)</option>
            </select>
          )}
        </div>
        <BackfillTool />
      </div>
      <section className="summaries-grid">
        {filtered.map(item => <SummaryCard key={item.id} item={item} />)}
      </section>
    </main>
  );
}
