'use client';
import { useState } from 'react';

export default function Translator() {
  const [text, setText] = useState('');
  const [translated, setTranslated] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source: 'en', target: 'hi' }),
      });

      if (!res.ok) throw new Error('Translation failed (Server error)');

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setTranslated(data.translated || 'No translation found');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <textarea
        className="border p-2 w-full rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type Hindi text..."
        rows={5}
      />

      <button
        onClick={handleTranslate}
        disabled={isLoading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 mt-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Translating...' : 'Translate'}
      </button>

      {error && (
        <div className="mt-2 text-red-500">
          Error: {error}
        </div>
      )}

      {translated && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Translated:</strong>
          <p className="mt-1">{translated}</p>
        </div>
      )}
    </div>
  );
}