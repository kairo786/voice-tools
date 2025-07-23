'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

export default function EmotionDetector() {
  const videoRef = useRef(null);
  const [emoji, setEmoji] = useState('😐');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const emojiMap = {
    happy: "😁",
    sad: "😭",
    angry: "😡",
    surprised: "😮",
    disgusted: "🤢",
    fearful: "😨",
    neutral: "😐",
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Model loading failed:", error);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startVideo();
  }, [modelsLoaded]);

  useEffect(() => {
    if (!modelsLoaded) return;

    const detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,       // Faster processing
      scoreThreshold: 0.2   // More sensitive detection
    });

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 4) return;

      try {
        const result = await faceapi
          .detectSingleFace(videoRef.current, detectionOptions)
          .withFaceExpressions();

        if (result?.expressions) {
          // Boost expression sensitivity
          const boosted = {
            angry: result.expressions.angry * 1.5,
            happy: result.expressions.happy * 1.3,
            surprised: result.expressions.surprised * 1.4,
            neutral: result.expressions.neutral * 0.7,
            sad: result.expressions.sad,
            disgusted: result.expressions.disgusted,
            fearful: result.expressions.fearful
          };
          
          const maxEmotion = Object.keys(boosted).reduce((a, b) => 
            boosted[a] > boosted[b] ? a : b
          );
          
          setEmoji(emojiMap[maxEmotion]);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    }, 300); // Faster checking interval

    return () => clearInterval(interval);
  }, [modelsLoaded,emojiMap]);

  return (
       <div className="relative p-4 flex flex-col items-center h-[1000px]">
      <video
        ref={videoRef}
        autoPlay
        muted
        className="rounded shadow-lg border border-gray-300 w-[1000px] h-[1000px]"
      />
      
      {emoji && (
        <div className="absolute bottom-26 text-5xl emoji-transition animate-bounce bg-white/30 p-2 rounded-full z-50">
          {emoji}
          {emoji}
          {emoji}
          {emoji}
          {emoji}
          {emoji}
          {emoji}
          {emoji}
          {emoji}
          {emoji}
        </div>
      )}
    </div>
  );
}