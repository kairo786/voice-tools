'use client';

import React, { useEffect, useState } from 'react';

export default function TextToSpeech() {
  const [voices, setVoices] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [text, setText] = useState('');

  // Load voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      // Get unique languages
      const uniqueLangs = [...new Set(allVoices.map(v => v.lang))];
      setLanguages(uniqueLangs.sort());

      // Restore previous selections if any
      const storedLang = localStorage.getItem('lang');
      const storedVoice = localStorage.getItem('voice');
      if (storedLang) setSelectedLang(storedLang);
      if (storedVoice) setSelectedVoiceURI(storedVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // When selectedLang changes, update filtered voices
  useEffect(() => {
    const relatedVoices = voices.filter(v => v.lang === selectedLang);
    setFilteredVoices(relatedVoices);

    // Reset voice if not in new list
    if (!relatedVoices.find(v => v.voiceURI === selectedVoiceURI)) {
      setSelectedVoiceURI('');
    }

    // Save language
    if (selectedLang) localStorage.setItem('lang', selectedLang);
  }, [selectedLang, voices]);

  // Save voice selection
  useEffect(() => {
    if (selectedVoiceURI) {
      localStorage.setItem('voice', selectedVoiceURI);
    }
  }, [selectedVoiceURI]);

  const speak = () => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    utterance.pitch = 1;
    utterance.rate = 1;
  utterance.onpause = () => alert("बोलना शुरू");
utterance.onend = () => alert("बोलना पूरा");
utterance.resume = () => alert("roka gya");
    window.speechSynthesis.cancel(); // Clear previous
    window.speechSynthesis.speak(utterance);
  };


  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">🗣️ Text To Speech (Multi-Language)</h2>

      {/* Language Selection */}
      <div>
        <label className="block font-medium mb-1">Select Language:</label>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">-- Select Language --</option>
          {languages.map((lang, idx) => (
            <option key={idx} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Voice Selection */}
      <div>
        <label className="block font-medium mb-1">Select Voice:</label>
        <select
          value={selectedVoiceURI}
          onChange={(e) => setSelectedVoiceURI(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">-- Select Voice --</option>
          {filteredVoices.map((voice, idx) => (
            <option key={idx} value={voice.voiceURI}>
              {voice.name} {voice.default ? "(default)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Text Input */}
      <textarea
        className="border w-full p-2 man-h-auto h-60 overflow-y-auto"
        placeholder="Type something to speak..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={speak}
      >
        🔊 Speak
    </button>
      <div className="space-x-2 mt-4 flex flex-row gap-3 ">
      <button onClick={() => window.speechSynthesis.pause()} className="bg-yellow-400 px-4 py-1 rounded">⏸ Pause</button>
     <button onClick={() => window.speechSynthesis.resume()} className="bg-green-500 px-4 py-1 rounded text-white">▶️ Resume</button>
     <button onClick={() => window.speechSynthesis.cancel()} className="bg-red-500 px-4 py-1 rounded text-white">🛑 Stop</button>
</div>

    </div>
  );
}
