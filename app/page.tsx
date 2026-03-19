import { supabase } from '@/lib/supabase';
import SummaryCard from './SummaryCard';

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const { data: summaries, error } = await supabase
    .from('summaries')
    .select('*')
    .order('published_at', { ascending: false });

  return (
    <main className="container">
      <header className="header">
        <div className="logo-section">
          <span className="logo-emoji">📺</span>
          <h1>Tagesschau Summary</h1>
        </div>
        <p className="subtitle">Präzise Themenübersicht, visuelle Beschreibung und wörtliche Transkription – alles an einem Ort.</p>
      </header>

      <section className="summaries-grid">
        {error && (
          <div className="error-card">
            <p>Fehler beim Laden: {error.message}</p>
          </div>
        )}

        {summaries && summaries.length > 0 ? (
          summaries.map((item) => (
            <SummaryCard key={item.id} item={item} />
          ))
        ) : !error ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p>Noch keine Zusammenfassungen vorhanden.</p>
          </div>
        ) : null}
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Tagesschau Summary App</p>
      </footer>
    </main>
  );
}
