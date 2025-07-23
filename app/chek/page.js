'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { useTheme } from 'next-themes';
import { CameraIcon, FaceSmileIcon, MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export default function EmotionDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [emoji, setEmoji] = useState('😐');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(true);
  const [detectionActive, setDetectionActive] = useState(true);
  const [expressionData, setExpressionData] = useState(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const emojiMap = {
    happy: "😁",
    sad: "😭",
    angry: "😡",
    surprised: "😮",
    disgusted: "🤢",
    fearful: "😨",
    neutral: "😐",
  };

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

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
    if (!modelsLoaded || !cameraActive) return;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded, cameraActive]);

  useEffect(() => {
    if (!modelsLoaded || !detectionActive) return;

    const detectionOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.2
    });

    const detectEmotions = async () => {
      if (!videoRef.current || videoRef.current.readyState < 4) return;

      try {
        const result = await faceapi
          .detectSingleFace(videoRef.current, detectionOptions)
          .withFaceExpressions();

        if (result?.expressions) {
          // Draw face detection box
          if (canvasRef.current) {
            const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
            const resizedResult = faceapi.resizeResults(result, dims);
            faceapi.draw.drawDetections(canvasRef.current, resizedResult);
          }

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
          setExpressionData(result.expressions);
        }
      } catch (err) {
        console.error("Detection error:", err);
      }
    };

    const interval = setInterval(detectEmotions, 300);
    return () => clearInterval(interval);
  }, [modelsLoaded, detectionActive, emojiMap]);

  const toggleCamera = () => {
    setCameraActive(!cameraActive);
    if (!cameraActive && videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const toggleDetection = () => {
    setDetectionActive(!detectionActive);
  };

  if (!mounted) return null;

  return (
    <div className={`flex flex-col items-center min-h-screen p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className={`flex justify-between items-center mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <h1 className="text-2xl font-bold">
            <span className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}>Emotion</span> Detector
          </h1>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full focus:outline-none"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6 text-yellow-300" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Camera Feed */}
        <div className="relative rounded-lg overflow-hidden shadow-lg mb-4">
          {cameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                className={`w-full ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} border-2 rounded-lg`}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </>
          ) : (
            <div className={`flex items-center justify-center h-64 ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'} rounded-lg`}>
              <CameraIcon className="h-12 w-12 mr-2" />
              <span>Camera is disabled</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={`flex justify-center space-x-4 mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-lg flex items-center ${cameraActive 
              ? (theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600') 
              : (theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600')} text-white`}
          >
            <CameraIcon className="h-5 w-5 mr-2" />
            {cameraActive ? 'Stop Camera' : 'Start Camera'}
          </button>
          <button
            onClick={toggleDetection}
            disabled={!cameraActive}
            className={`px-4 py-2 rounded-lg flex items-center ${!cameraActive 
              ? 'bg-gray-400 cursor-not-allowed' 
              : detectionActive 
                ? (theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600') 
                : (theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600')} text-white`}
          >
            <FaceSmileIcon className="h-5 w-5 mr-2" />
            {detectionActive ? 'Pause Detection' : 'Resume Detection'}
          </button>
        </div>

        {/* Results */}
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
          <div className="flex flex-col items-center">
            <div className="text-9xl mb-6 emoji-transition animate-pulse">
              {emoji}
            </div>
            
            {expressionData && (
              <div className="w-full max-w-md">
                <h3 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expression Probabilities:
                </h3>
                <div className="space-y-2">
                  {Object.entries(expressionData).map(([emotion, value]) => (
                    <div key={emotion} className="flex items-center">
                      <span className={`w-24 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}:
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full ${value > 0.6 ? 'bg-green-500' : value > 0.3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${value * 100}%` }}
                        ></div>
                      </div>
                      <span className={`ml-2 w-12 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}