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

  // Robust parsing: Looks for any header level and matches keywords
  const getSectionContent = (keywords: string[], text: string) => {
    // Regex matches: # (one or more) + optional space + a line containing one of the keywords
    // Then captures everything until the next # (header)
    const keywordsEscaped = keywords.join('|');
    const regex = new RegExp(`#{1,6}\\s*.*(${keywordsEscaped}).*[\\s\\S]*?(\\n(?=#{1,6}\\s)|$)`, 'i');
    const match = text.match(regex);
    
    if (!match) return null;
    
    // Remove the header line from the matched content
    const fullMatch = match[0];
    const lines = fullMatch.split('\n');
    return lines.slice(1).join('\n').trim();
  };

  const sections = {
    summary: getSectionContent(['themen', 'zusammenfassung'], item.summary) || item.summary.split(/^#+/m)[0].trim() || item.summary,
    visual: getSectionContent(['visuell', 'bild'], item.summary) || 'Visuelle Beschreibung nicht verfügbar.',
    verbatim: getSectionContent(['transkript', 'wörtlich', 'text', 'sprecher'], item.summary) || 'Transkript nicht verfügbar.',
  };

  // Safe date parsing to handle UTC
  const displayDate = item.published_at ? parseISO(item.published_at) : new Date();

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
          Original Video ansehen
        </a>
      </div>
    </article>
  );
}
