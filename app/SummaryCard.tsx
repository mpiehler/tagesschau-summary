'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface Summary {
  id: string;
  video_id: string;
  title: string;
  summary: string;
  published_at: string;
}

export default function SummaryCard({ item }: { item: Summary }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'visual' | 'verbatim'>('summary');

  const parseSections = (text: string) => {
    const rawText = (text || '').replace(/\r\n/g, '\n');
    const normalizedText = '\n' + rawText;
    const chunks = normalizedText.split(/\n(?=#+)/).filter(c => c.trim() !== '');

    const findContent = (keywords: string[]) => {
      for (const chunk of chunks) {
        const lines = chunk.trim().split('\n');
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('#') && keywords.some(k => firstLine.includes(k.toLowerCase()))) {
          return lines.slice(1).join('\n').trim();
        }
      }
      return null;
    };

    const parsed = {
      summary: findContent(['themen', 'zusammenfassung', 'summary']),
      visual: findContent(['visuell', 'bild', 'visual']),
      verbatim: findContent(['transkript', 'wörtlich', 'verbatim', 'text', 'sprecher']),
    };

    if (!parsed.summary && chunks[0]) {
      const lines = chunks[0].trim().split('\n');
      parsed.summary = lines.slice(1).join('\n').trim();
    }

    return parsed;
  };

  const sections = parseSections(item.summary);
  const activeContent = activeTab === 'summary' ? (sections.summary || item.summary) : activeTab === 'visual' ? (sections.visual || 'Nicht verfügbar.') : (sections.verbatim || 'Nicht verfügbar.');

  let displayDate = new Date();
  if (item.published_at) {
    try { displayDate = parseISO(item.published_at); } catch (e) { }
  }

  return (
    <article className="summary-card">
      <div className="card-header">
        <h2>{item.title}</h2>
        <time>{format(displayDate, 'PPPP', { locale: de })}</time>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button className={activeTab === 'summary' ? 'tab active transition' : 'tab transition'} onClick={() => setActiveTab('summary')}>Themen</button>
          <button className={activeTab === 'visual' ? 'tab active transition' : 'tab transition'} onClick={() => setActiveTab('visual')}>Visuelles</button>
          <button className={activeTab === 'verbatim' ? 'tab active transition' : 'tab transition'} onClick={() => setActiveTab('verbatim')}>Transkript</button>
        </div>
      </div>

      <div className="card-content">
        <div className="markdown-body" style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', minHeight: '200px' }}>
          {activeContent}
        </div>
      </div>

      <div className="card-footer">
        <a href={`https://www.youtube.com/watch?v=${item.video_id}`} target="_blank" rel="noopener noreferrer" className="btn-link">Video auf YouTube ansehen</a>
      </div>
    </article>
  );
}
