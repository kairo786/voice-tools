'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { SpeakerWaveIcon, SpeakerXMarkIcon, PauseIcon, PlayIcon, StopIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

export default function TextToSpeech() {
  const { theme } = useTheme();
  const [voices, setVoices] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedLang, setSelectedLang] = useState('');
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);

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

    return () => {
      window.speechSynthesis.cancel();
    };
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

  // Handle speech events
  useEffect(() => {
    const handleStart = () => setIsSpeaking(true);
    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    const handlePause = () => setIsPaused(true);
    const handleResume = () => setIsPaused(false);

    speechSynthesis.addEventListener('start', handleStart);
    speechSynthesis.addEventListener('end', handleEnd);
    speechSynthesis.addEventListener('pause', handlePause);
    speechSynthesis.addEventListener('resume', handleResume);

    return () => {
      speechSynthesis.removeEventListener('start', handleStart);
      speechSynthesis.removeEventListener('end', handleEnd);
      speechSynthesis.removeEventListener('pause', handlePause);
      speechSynthesis.removeEventListener('resume', handleResume);
    };
  }, []);

  const speak = () => {
    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
  };

  const refreshVoices = () => {
    const allVoices = window.speechSynthesis.getVoices();
    setVoices(allVoices);
    const uniqueLangs = [...new Set(allVoices.map(v => v.lang))];
    setLanguages(uniqueLangs.sort());
  };

  return (
    <div className={`p-6 space-y-6 max-w-3xl mx-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg`}>
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
        🗣️ Text To Speech (Multi-Language)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Selection */}
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Language:
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">-- Select Language --</option>
            {languages.map((lang, idx) => (
              <option key={idx} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        {/* Voice Selection */}
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Voice:
            <button 
              onClick={refreshVoices}
              className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Refresh voices"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </label>
          <select
            value={selectedVoiceURI}
            onChange={(e) => setSelectedVoiceURI(e.target.value)}
            className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <option value="">-- Select Voice --</option>
            {filteredVoices.map((voice, idx) => (
              <option key={idx} value={voice.voiceURI}>
                {voice.name} {voice.default ? "(default)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Speech Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Pitch: {pitch.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Speed: {rate.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        <div>
          <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Volume: {volume.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Text Input */}
      <div>
        <label className={`block font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Enter Text:
        </label>
        <textarea
          className={`w-full p-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} min-h-[200px]`}
          placeholder="Type something to speak..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={speak}
          disabled={isSpeaking || !text.trim()}
          className={`flex items-center px-6 py-3 rounded-lg ${isSpeaking || !text.trim() 
            ? 'bg-gray-400 cursor-not-allowed' 
            : theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-500 hover:bg-blue-600'} text-white`}
        >
          <SpeakerWaveIcon className="h-5 w-5 mr-2" />
          Speak
        </button>

        <button
          onClick={handlePause}
          disabled={!isSpeaking || isPaused}
          className={`flex items-center px-6 py-3 rounded-lg ${!isSpeaking || isPaused 
            ? 'bg-gray-400 cursor-not-allowed' 
            : theme === 'dark' 
              ? 'bg-yellow-600 hover:bg-yellow-700' 
              : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
        >
          <PauseIcon className="h-5 w-5 mr-2" />
          Pause
        </button>

        <button
          onClick={handleResume}
          disabled={!isPaused}
          className={`flex items-center px-6 py-3 rounded-lg ${!isPaused 
            ? 'bg-gray-400 cursor-not-allowed' 
            : theme === 'dark' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-green-500 hover:bg-green-600'} text-white`}
        >
          <PlayIcon className="h-5 w-5 mr-2" />
          Resume
        </button>

        <button
          onClick={handleStop}
          disabled={!isSpeaking && !isPaused}
          className={`flex items-center px-6 py-3 rounded-lg ${!isSpeaking && !isPaused 
            ? 'bg-gray-400 cursor-not-allowed' 
            : theme === 'dark' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-red-500 hover:bg-red-600'} text-white`}
        >
          <StopIcon className="h-5 w-5 mr-2" />
          Stop
        </button>
      </div>

      {/* Status Indicator */}
      <div className={`text-center p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        {isSpeaking && !isPaused && (
          <p className={`flex items-center justify-center ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
            <SpeakerWaveIcon className="h-5 w-5 mr-2 animate-pulse" />
            Currently speaking...
          </p>
        )}
        {isPaused && (
          <p className={`flex items-center justify-center ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
            <PauseIcon className="h-5 w-5 mr-2" />
            Speech paused
          </p>
        )}
        {!isSpeaking && !isPaused && (
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Ready to speak
          </p>
        )}
      </div>
    </div>
  );
}