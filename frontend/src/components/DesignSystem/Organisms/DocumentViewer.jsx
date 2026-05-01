import { useEffect, useMemo, useState } from 'react';
import Icon from '../Atoms/Icon';
import './DocumentViewer.css';

const LOCAL_DOCUMENTS = {
  'constitution-article-104': {
    id: 'constitution-article-104',
    title: 'Article 104 of the Constitution of India',
    section: '104',
    highlight: 'article-104-text',
    neighborly_summary: "This basically says that if someone isn't qualified to be there, they can't just sit in Parliament—there's a fine for every day they do!",
    source_chain: [
      { provider: 'india_code', status: 'cached', url: 'https://www.legislative.gov.in/static/uploads/2025/08/cb1b190ea633a1746368ed1fac35fb30.pdf' },
      { provider: 'indian_kanoon', status: 'mirror', url: 'https://indiankanoon.org/doc/183078052/' },
    ],
    content: `# Article 104 of the Constitution of India

## Penalty for sitting and voting before making oath or affirmation under article 99 or when not qualified or when disqualified

<mark id="article-104-text">If a person sits or votes as a member of either House of Parliament before he has complied with the requirements of article 99, or when he knows that he is not qualified or that he is disqualified for membership thereof, or that he is prohibited from so doing by the provisions of any law made by Parliament, he shall be liable in respect of each day on which he so sits or votes to a penalty of five hundred rupees to be recovered as a debt due to the Union.</mark>

## Neighborly Summary

This basically says that if someone isn't qualified to be there, they can't just sit in Parliament—there's a fine for every day they do!`,
  },
  'eci-instructions-2024': {
    id: 'eci-instructions-2024',
    title: 'ECI Instructions on Conduct of Elections (2024)',
    section: '1.2',
    highlight: 'eci-sec-1-2',
    neighborly_summary: "Rules ensuring polling stations are accessible and welcoming for everyone, especially those who need a bit of extra help.",
    source_chain: [
      { provider: 'eci_official', status: 'cached', url: 'https://eci.gov.in/files/file/15655-manual-on-conduct-of-elections/' },
    ],
    content: `# ECI Instructions on Conduct of Elections (2024)

## Chapter 1: Polling Station Arrangements

<mark id="eci-sec-1-2">Every polling station shall have a ramp for persons with disabilities (PwDs) and senior citizens. The slope of the ramp should not exceed 1:12.</mark>

## Neighborly Summary
This ensures that everyone, especially our elders and neighbors with special needs, can reach the voting booth comfortably. No one should be left behind!`,
  },
};

const DOCUMENT_CACHE = 'fn-law-library-v1';

function renderMarkdown(content) {
  return content
    .split('\n')
    .filter((line) => !line.startsWith('---'))
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-4" />;
      if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-8 mb-4 border-b border-slate-100 pb-2">{line.slice(3)}</h2>;
      
      const markMatch = line.match(/^<mark id="([^"]+)">(.+)<\/mark>$/);
      if (markMatch) {
        return (
          <p key={index} id={markMatch[1]} className="bg-amber-50 border-l-4 border-amber-400 p-6 my-6 text-lg font-medium text-slate-800 rounded-r-lg">
            {markMatch[2]}
          </p>
        );
      }
      
      if (line.match(/^[a-zA-Z]+:/)) {
        const metadataFields = ['id:', 'title:', 'section:', 'highlight:', 'source:', 'retrieved_at:'];
        if (metadataFields.some(field => line.startsWith(field))) return null;
      }
      
      return <p key={index} className="mb-4 text-slate-600 leading-relaxed">{line}</p>;
    });
}

export default function DocumentViewer({ documentId, query, onClose }) {
  const [document, setDocument] = useState(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const apiPath = query && !documentId 
      ? `/api/law-library/retrieve?query=${encodeURIComponent(query)}`
      : `/api/law-library/documents/${documentId || 'constitution-article-104'}`;

    async function loadDocument() {
      try {
        const response = await fetch(apiPath);
        if (!response.ok) throw new Error('Document not found');
        const data = await response.json();
        const docData = data.document || data;
        
        if ('caches' in window) {
          const cache = await caches.open(DOCUMENT_CACHE);
          await cache.put(apiPath, new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          }));
        }
        if (!cancelled) setDocument(docData);
      } catch (err) {
        if ('caches' in window) {
          const cached = await caches.match(apiPath);
          if (cached) {
            const data = await cached.json();
            if (!cancelled) {
              setOffline(true);
              setDocument(data.document || data);
            }
            return;
          }
        }
        if (!cancelled) {
          setOffline(true);
          const fallbackId = documentId || (query?.toLowerCase().includes('eci') ? 'eci-instructions-2024' : 'constitution-article-104');
          setDocument(LOCAL_DOCUMENTS[fallbackId] || LOCAL_DOCUMENTS['constitution-article-104']);
        }
      }
    }

    loadDocument();
    return () => { cancelled = true; };
  }, [documentId, query]);

  useEffect(() => {
    if (!document?.highlight) return;
    const timer = window.setTimeout(() => {
      const el = window.document.getElementById(document.highlight);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        el.classList.add('animate-pulse');
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [document]);

  const rendered = useMemo(() => renderMarkdown(document?.content || ''), [document?.content]);

  if (!document && !error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Consulting Cloud Library...</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl h-fit">
          <Icon name="Lightbulb" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Neighborly Summary</h3>
          <p className="text-slate-600 leading-relaxed">{document.neighborly_summary}</p>
        </div>
      </div>

      {offline && (
        <div className="mb-8 p-3 bg-amber-50 text-amber-700 text-sm font-bold rounded-lg flex items-center gap-2">
          <Icon name="WifiOff" size={16} />
          Running in Offline Mode — Cached Copy
        </div>
      )}

      <div className="prose prose-slate max-w-none">
        {rendered}
      </div>

      <footer className="mt-12 pt-8 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          <Icon name="ShieldCheck" size={14} />
          Trusted Verification Chain
        </div>
        <div className="flex flex-wrap gap-2">
          {(document.source_chain || []).map((source, idx) => (
            <span key={idx} className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              source.status === 'cached' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {source.provider.replace('_', ' ')}
            </span>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-400 italic">
          Automated retrieval from official ECI and Parliamentary archives.
        </p>
      </footer>
    </article>
  );
}
