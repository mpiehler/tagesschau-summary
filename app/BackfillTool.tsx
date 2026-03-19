'use client';
import { useState } from 'react';

export default function BackfillTool() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleProcess = async () => {
    setLoading(true);
    setMessage('Verarbeite... Bitte warten (ca. 1-2 Minuten)');
    try {
      const res = await fetch('/api/process-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.message) {
        setMessage('Erfolg! Lade die Seite neu.');
        setUrl('');
      } else {
        setMessage(`Fehler: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Fehler: ${e.message}`);
    }
    setLoading(false);
  };

  if (!showForm) {
    return (
      <div className="backfill-toggle">
        <button onClick={() => setShowForm(true)} className="btn-secondary">+ Ältere Folge hinzufügen</button>
      </div>
    );
  }

  return (
    <div className="backfill-card animation-slide-down" style={{padding: '20px', border: '1px solid #ccc', borderRadius: '10px', marginTop: '20px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <h3>Historische Folge hinzufügen</h3>
        <button onClick={() => setShowForm(false)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px'}}>×</button>
      </div>
      <p style={{fontSize: '0.9rem', color: '#666'}}>Gib den YouTube-Link einer alten 20-Uhr-Tagesschau ein.</p>
      <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
        <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={url} onChange={(e) => setUrl(e.target.value)} style={{flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ddd'}} />
        <button onClick={handleProcess} disabled={loading || !url} style={{padding: '8px 15px', background: '#004d99', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
          {loading ? 'Lädt...' : 'Verarbeiten'}
        </button>
      </div>
      {message && <p style={{marginTop: '10px', fontSize: '0.85rem'}}>{message}</p>}
    </div>
  );
}
