'use client';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface Summary { id: string; video_id: string; title: string; summary: string; published_at: string; }

function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const lines = html.split('\n');
  const renderedLines = lines.map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ')) return <li key={i} dangerouslySetInnerHTML={{ __html: trimmed.substring(2) }} style={{ marginLeft: '20px', marginBottom: '8px', listStyleType: 'disc' }} />;
    if (trimmed === '') return <div key={i} style={{ height: '10px' }} />;
    return <p key={i} dangerouslySetInnerHTML={{ __html: trimmed }} style={{ marginBottom: '10px' }} />;
  });
  return <div className="markdown-content">{renderedLines}</div>;
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
        if (keywords.some(k => lines[0].toLowerCase().includes(k.toLowerCase()))) return lines.slice(1).join('\n').trim();
      }
      return null;
    };
    const parsed = {
      summary: findContent(['themen', 'zusammenfassung', 'summary']),
      visual: findContent(['visuell', 'bild', 'visual']),
      verbatim: findContent(['transkript', 'wörtlich', 'verbatim', 'text', 'sprecher']),
    };
    if (!parsed.summary && chunks[0]) parsed.summary = chunks[0].trim().split('\n').slice(1).join('\n').trim();
    return parsed;
  };
  const sections = parseSections(item.summary);
  const activeContent = activeTab === 'summary' ? (sections.summary || item.summary) : activeTab === 'visual' ? (sections.visual || 'Nicht verfügbar.') : (sections.verbatim || 'Nicht verfügbar.');
  return (
    <article className="summary-card">
      <div className="card-header">
        <h2>{item.title}</h2>
        <time>{format(item.published_at ? parseISO(item.published_at) : new Date(), 'PPPP', { locale: de })}</time>
      </div>
      <div className="tabs-container">
        <div className="tabs">
          <button className={activeTab === 'summary' ? 'tab active' : 'tab'} onClick={() => setActiveTab('summary')}>Themen</button>
          <button className={activeTab === 'visual' ? 'tab active' : 'tab'} onClick={() => setActiveTab('visual')}>Visuelles</button>
          <button className={activeTab === 'verbatim' ? 'tab active' : 'tab'} onClick={() => setActiveTab('verbatim')}>Transkript</button>
        </div>
      </div>
      <div className="card-content"><SimpleMarkdown text={activeContent} /></div>
      <div className="card-footer">
        <a href={`https://www.youtube.com/watch?v=${item.video_id}`} target="_blank" rel="noopener noreferrer" className="btn-link">Sendung auf YouTube ansehen</a>
      </div>
    </article>
  );
}
