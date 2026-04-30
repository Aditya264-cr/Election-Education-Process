import { useEffect, useMemo, useState } from 'react';
import './DocumentViewer.css';

const LOCAL_DOCUMENTS = {
  'constitution-article-104': {
    id: 'constitution-article-104',
    title: 'Article 104 of the Constitution of India',
    section: '104',
    highlight: 'article-104-text',
    neighborly_summary: "This basically says that if someone isn't qualified to be there, they can't just sit in Parliament. There's a fine for every day they do.",
    source_chain: [
      {
        provider: 'india_code',
        status: 'cached',
        url: 'https://www.legislative.gov.in/static/uploads/2025/08/cb1b190ea633a1746368ed1fac35fb30.pdf',
      },
      {
        provider: 'indian_kanoon',
        status: 'mirror',
        url: 'https://indiankanoon.org/doc/183078052/',
      },
      {
        provider: 'prs_legislative_research',
        status: 'search-fallback',
        url: 'https://prsindia.org/',
      },
    ],
    content: `# Article 104 of the Constitution of India

## Penalty for sitting and voting before making oath or affirmation under article 99 or when not qualified or when disqualified

<mark id="article-104-text">If a person sits or votes as a member of either House of Parliament before he has complied with the requirements of article 99, or when he knows that he is not qualified or that he is disqualified for membership thereof, or that he is prohibited from so doing by the provisions of any law made by Parliament, he shall be liable in respect of each day on which he so sits or votes to a penalty of five hundred rupees to be recovered as a debt due to the Union.</mark>

## Neighborly Summary

This basically says that if someone isn't qualified to be there, they can't just sit in Parliament. There's a fine for every day they do.`,
  },
};

const DOCUMENT_CACHE = 'fn-law-library-v1';

function renderMarkdown(content) {
  return content
    .split('\n')
    .filter((line) => !line.startsWith('---'))
    .map((line, index) => {
      if (!line.trim()) return null;
      if (line.startsWith('# ')) return <h1 key={index}>{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>;
      const markMatch = line.match(/^<mark id="([^"]+)">(.+)<\/mark>$/);
      if (markMatch) {
        return <p key={index} id={markMatch[1]} className="reader-highlight">{markMatch[2]}</p>;
      }
      if (line.startsWith('id:') || line.startsWith('title:') || line.startsWith('section:') || line.startsWith('highlight:') || line.startsWith('source:') || line.startsWith('retrieved_at:')) {
        return null;
      }
      return <p key={index}>{line}</p>;
    });
}

export default function DocumentViewer({ documentId = 'constitution-article-104', query, onClose }) {
  const [document, setDocument] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `/api/law-library/documents/${documentId}`;

    async function loadDocument() {
      try {
        const response = await fetch(cacheKey);
        if (!response.ok) throw new Error('Document fetch failed');
        const data = await response.json();
        if ('caches' in window) {
          const cache = await caches.open(DOCUMENT_CACHE);
          await cache.put(cacheKey, new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }
        if (!cancelled) setDocument(data);
      } catch {
        if ('caches' in window) {
          const cached = await caches.match(cacheKey);
          if (cached) {
            const data = await cached.json();
            if (!cancelled) {
              setOffline(true);
              setDocument(data);
            }
            return;
          }
        }
        if (!cancelled) {
          setOffline(true);
          setDocument(LOCAL_DOCUMENTS[documentId] || LOCAL_DOCUMENTS['constitution-article-104']);
        }
      }
    }

    loadDocument();
    return () => { cancelled = true; };
  }, [documentId]);

  useEffect(() => {
    if (!document?.highlight) return;
    const timer = window.setTimeout(() => {
      window.document.getElementById(document.highlight)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [document]);

  const rendered = useMemo(() => renderMarkdown(document?.content || ''), [document?.content]);

  if (!document) {
    return (
      <div className="reader-overlay">
        <div className="reader-shell">
          <button className="reader-close" onClick={onClose} aria-label="Close reader">x</button>
          <p className="reader-loading">Loading Internal Law Library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reader-overlay">
      <article className="reader-shell" aria-label={document.title}>
        <header className="reader-header">
          <div>
            <span className="reader-kicker">Internal Law Library</span>
            <h1>{document.title}</h1>
            {query && <p>Matched request: {query}</p>}
          </div>
          <button className="reader-close" onClick={onClose} aria-label="Close reader">x</button>
        </header>

        <section className="reader-summary">
          <strong>Neighborly Summary</strong>
          <p>{document.neighborly_summary}</p>
        </section>

        {offline && <p className="reader-offline">Offline copy loaded from local cache.</p>}

        <section className="reader-content">
          {rendered}
        </section>

        <footer className="reader-sources">
          <strong>Retrieval Chain</strong>
          {(document.source_chain || []).map((source) => (
            <span key={`${source.provider}-${source.status}`}>
              {source.provider.replaceAll('_', ' ')}: {source.status}
            </span>
          ))}
        </footer>
      </article>
    </div>
  );
}
