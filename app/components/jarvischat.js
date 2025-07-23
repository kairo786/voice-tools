// app/components/JarvisChat.tsx
'use client';
import { useState ,useEffect} from 'react';

export default function JarvisChat() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null)
useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(voice => voice.lang === 'en-IN') || 
                          voices.find(voice => voice.lang.startsWith('en')) || 
                          voices[0];
      setSelectedVoice(indianVoice);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices(); // तुरंत चेक करें
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setChat(prev => [...prev, { text: message, user: true }]);
 
    setMessage('');

    try {
      const response = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      setChat(prev => [...prev, { text: data.response, user: false }]);

    } catch (error) {
      setChat(prev => [...prev, { text: 'Error getting response', user: false }]);
    } finally {
      setLoading(false);
    }
  };
 const speakText = (message) => {
    if (!selectedVoice) {
      alert('No voice available!');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang || 'en-IN'; // डिफ़ॉल्ट 'en-IN'
    utterance.pitch = 1.1;
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };
  const validItems = chat.filter(
    item => typeof item === "string" && item.trim() !== ""
  );
  return (
    <div className="w-full mx-auto p-10 m-4  relative h-screen flex flex-col gap-2">

      <div className={`overflow-y-auto h-19/20 mb-auto bg-blue-950 p-2 flex flex-col `}>
        {!chat.trim && <div className="text-green-500 text-4xl text cen">Your chats will be shown here</div>}
        {chat.map((msg, i) => (
          <div key={i} className={`mb-2 p-2 rounded ${msg.user ? 'bg-blue-100 w-50 ml-auto mr-2 pr-3 text-right' : 'bg-gray-100 '}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>

      <form onSubmit={handleSubmit} className="flex mb-4 ">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Type your message"
        />
        <button
          onClick={() => speakText(message)}
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-r disabled:bg-gray-400 "
        >
          Send
        </button>
      </form>
    </div>
  );
}