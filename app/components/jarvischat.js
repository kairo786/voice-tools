'use client';
import { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon, PaperAirplaneIcon, StopIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';

export default function JarvisChat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const { theme } = useTheme();
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition and voices
  useEffect(() => {
    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => voice.lang === 'en-IN') || 
                         voices.find(voice => voice.lang.startsWith('en')) || 
                         voices[0];
      setSelectedVoice(indianVoice);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    const userMessage = { text: message, user: true };
    setChat(prev => [...prev, userMessage]);
    setMessage('');

    try {
      const response = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      const botMessage = { text: data.response, user: false };
      setChat(prev => [...prev, botMessage]);
      speakText(data.response);
    } catch (error) {
      setChat(prev => [...prev, { text: 'Error getting response', user: false }]);
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!selectedVoice) {
      alert('No voice available!');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || 'en-IN';
    utterance.pitch = 1.1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-4rem)] p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Chat Header */}
      <div className={`p-4 rounded-t-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <h1 className="text-2xl font-bold text-center">
          <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>JARVIS</span> Chat
        </h1>
      </div>

      {/* Chat Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        {chat.length === 0 ? (
          <div className={`text-center p-8 rounded-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <p className="text-xl">Your chat with JARVIS will appear here</p>
            <p className="mt-2">Ask me anything!</p>
          </div>
        ) : (
          chat.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3/4 p-4 rounded-lg ${msg.user 
                  ? (theme === 'dark' ? 'bg-blue-900 text-white' : 'bg-blue-100 text-gray-800') 
                  : (theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800')
                }`}
              >
                <p>{msg.text}</p>
                {!msg.user && (
                  <button 
                    onClick={() => speakText(msg.text)}
                    className={`mt-2 p-1 rounded-full ${theme === 'dark' ? 'text-blue-300 hover:text-blue-400' : 'text-blue-600 hover:text-blue-700'}`}
                    title="Speak this message"
                  >
                    <SpeakerWaveIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-4 rounded-b-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full p-3 rounded-lg border ${theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                : 'bg-white border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full ${isListening 
                ? 'text-red-500' 
                : theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <StopIcon className="h-6 w-6" />
              ) : (
                <MicrophoneIcon className="h-6 w-6" />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className={`p-3 rounded-lg flex items-center justify-center ${loading || !message.trim() 
              ? 'bg-gray-400 cursor-not-allowed' 
              : theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}