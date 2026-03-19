// @ts-nocheck
'use client';
import { useState } from 'react';
import SummaryCard from './SummaryCard';
import BackfillTool from './BackfillTool';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export default function HomeClient({ initialSummaries }) {
  // Tage robuster berechnen
  const days = Array.from(new Set(initialSummaries.map(s => s.published_at ? s.published_at.substring(0, 10) : null).filter(Boolean)))
    .sort().reverse();

  // IMMER den ersten verfügbaren Tag vorwählen
  const [selectedDay, setSelectedDay] = useState(days[0] || null);

  // Filterung: Wenn ein Tag gewählt ist, zeige nur diesen. Sonst alle.
  const filtered = selectedDay 
    ? initialSummaries.filter(s => s.published_at && s.published_at.startsWith(selectedDay))
    : initialSummaries;

  return (
    <main className="container">
      <header className="header">
        <div className="logo-section">
          <span className="logo-emoji">📺</span>
          <h1>Tagesschau Summary</h1>
        </div>
        <p style={{textAlign: 'center', opacity: 0.8}}>Die tagesaktuelle Zusammenfassung der 20-Uhr-Sendung.</p>
      </header>

      <div className="top-controls" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginBottom: '40px'}}>
        <div className="day-selector" style={{display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center'}}>
          {days.slice(0, 3).map((d, i) => (
            <button 
              key={d} 
              className={selectedDay === d ? 'btn-day active' : 'btn-day'} 
              onClick={() => setSelectedDay(d)}
            >
              {i === 0 ? 'Heute' : format(parseISO(d), 'eeee', { locale: de })}
            </button>
          ))}
          {days.length > 3 && (
            <select className="btn-day" value={selectedDay || ''} onChange={(e) => setSelectedDay(e.target.value || null)}>
              <option value="" disabled>Archiv...</option>
              {days.slice(3).map(d => <option key={d} value={d}>{format(parseISO(d), 'dd.MM.yyyy')}</option>)}
              <option value="">Alle anzeigen</option>
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
