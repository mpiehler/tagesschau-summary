'use client';

import { useState } from 'react';
import { format } from 'date-fns';
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

  // Helper to extract content between XML-like tags
  const extract = (tag: string, text: string) => {
    const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return match ? match[1].trim() : null;
  };

  const sections = {
    summary: extract('themen', item.summary) || item.summary.split('<')[0].trim() || 'Zusammenfassung lädt...',
    visual: extract('visuelles', item.summary) || 'Visuelle Beschreibung nicht verfügbar.',
    verbatim: extract('transkript', item.summary) || 'Transkript nicht verfügbar.',
  };

  return (
    <article className="summary-card">
      <div className="card-header">
        <h2>{item.title}</h2>
        <time dateTime={item.published_at}>
          {format(new Date(item.published_at), 'PPPP', { locale: de })}
        </time>
      </div>

      <div className="tabs">
        <button 
          className={activeTab === 'summary' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('summary')}
        >
          Themen
        </button>
        <button 
          className={activeTab === 'visual' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('visual')}
        >
          Visuelles
        </button>
        <button 
          className={activeTab === 'verbatim' ? 'tab active' : 'tab'} 
          onClick={() => setActiveTab('verbatim')}
        >
          Transkript
        </button>
      </div>

      <div className="card-content">
        <div className="summary-section">
          {sections[activeTab].split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>

      <div className="card-footer">
        <a 
          href={`https://www.youtube.com/watch?v=${item.video_id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-link"
        >
          Original Video
        </a>
      </div>
    </article>
  );
}
