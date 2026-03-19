// @ts-nocheck
'use client';
import { useState, useMemo } from 'react';
import SummaryCard from './SummaryCard';
import BackfillTool from './BackfillTool';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export default function HomeClient({ initialSummaries }) {
  // Tage extrem robust berechnen
  const allDays = useMemo(() => {
    const days = initialSummaries
      .map(s => (s.published_at ? s.published_at.split('T')[0] : null))
      .filter(Boolean);
    return Array.from(new Set(days)).sort().reverse();
  }, [initialSummaries]);

  // Immer den ersten verfügbaren Tag vorwählen
  const [selectedDateStr, setSelectedDateStr] = useState(allDays[0] || null);

  // Filterung: Wenn ein Tag gewählt ist, zeige nur diesen. Sonst (Archiv) alle.
  const filtered = selectedDateStr 
    ? initialSummaries.filter(s => s.published_at && s.published_at.startsWith(selectedDateStr))
    : initialSummaries;

  const recentDays = allDays.slice(0, 3);
  const olderDays = allDays.slice(3);

  return (
    <main className="container">
      <header className="header">
        <div className="logo-section">
          <span className="logo-emoji">📺</span>
          <h1>Tagesschau Summary</h1>
        </div>
      </header>

      <div className="top-controls">
        <div className="day-selector">
          {recentDays.map((dayStr, i) => {
            const date = parseISO(dayStr);
            return (
              <button 
                key={dayStr} 
                className={selectedDateStr === dayStr ? 'btn-day active' : 'btn-day'} 
                onClick={() => setSelectedDateStr(dayStr)}
              >
                {i === 0 ? 'Aktuell' : format(date, 'eeee', { locale: de })}
              </button>
            );
          })}
          
          {olderDays.length > 0 && (
            <select 
              className="btn-day select-day" 
              value={selectedDateStr || ''} 
              onChange={(e) => setSelectedDateStr(e.target.value || null)}
            >
              <option value="" disabled>Archive...</option>
              {olderDays.map(dayStr => (
                <option key={dayStr} value={dayStr}>{format(parseISO(dayStr), 'dd.MM.yyyy')}</option>
              ))}
              <option value="">Alle anzeigen</option>
            </select>
          )}
        </div>
        <BackfillTool />
      </div>

      <section className="summaries-grid">
        {filtered.length > 0 ? (
          filtered.map(item => <SummaryCard key={item.id} item={item} />)
        ) : (
          <div className="empty-state"><p>Keine Einträge gefunden.</p></div>
        )}
      </section>
    </main>
  );
}
