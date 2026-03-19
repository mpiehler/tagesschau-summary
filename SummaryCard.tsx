'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

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
    // Add a newline at the start to ensure the first header is caught by the split
    const normalizedText = '\n' + text;
    // Split by newline followed by any markdown header
    const chunks = normalizedText.split(/\n(?=#{1,6}\s)/).filter(c => c.trim() !== '');

    const findContent = (keywords: string[]) => {
      for (const chunk of chunks) {
        const firstLine = chunk.trim().split('\n')[0].toLowerCase();
        if (keywords.some(k => firstLine.includes(k.toLowerCase()))) {
          const lines = chunk.trim().split('\n');
          return lines.slice(1).join('\n').trim();
        }
      }
      return null;
    };

    return {
      summary: findContent(['themen', 'zusammenfassung', 'summary']) || (chunks[0] ? chunks[0].trim() : 'Keine Themenübersicht verfügbar.'),
      visual: findContent(['visuell', 'bild', 'visual']) || 'Visuelle Beschreibung nicht verfügbar.',
      verbatim: findContent(['transkript', 'wörtlich', 'verbatim', 'text', 'sprecher']) || 'Transkript nicht verfügbar.',
    };
  };

  const sections = parseSections(item.summary);

  // Safe date parsing
  let displayDate = new Date();
  try {
    if (item.published_at) {
      displayDate = parseISO(item.published_at);
    }
  } catch (e) {}

  return (
    <article className="summary-card animation-fade-in">
      <div className="card-header">
        <h2>{item.title}</h2>
        <time dateTime={item.published_at}>
          {format(displayDate, 'PPPP', { locale: de })}
        </time>
      </div>

      <div className="tabs-container">
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
      </div>

      <div className="card-content">
        <div className="markdown-body">
          <ReactMarkdown>{sections[activeTab]}</ReactMarkdown>
        </div>
      </div>

      <div className="card-footer">
        <a 
          href={`https://www.youtube.com/watch?v=${item.video_id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-link"
        >
          Auf YouTube ansehen
        </a>
      </div>
    </article>
  );
}
