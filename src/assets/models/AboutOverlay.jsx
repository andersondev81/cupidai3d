// AboutOverlay.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const AboutOverlay = ({ isVisible, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setMounted(true), 300);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 transition-opacity duration-500 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className={`relative w-full max-w-4xl p-8 mx-4 bg-gray-900 rounded-xl shadow-2xl transition-all duration-500 overflow-y-auto max-h-[90vh] ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-[60] cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <X size={24} />
        </button>

        <div className="space-y-12 text-white">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              The only dating tool for U.
            </h1>
            <p className="text-2xl font-semibold">NOT a dating app. Powered by AI.</p>
            <p className="text-xl text-blue-400">MAKE dating easy. Download now.</p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Turn Matches Into Dates</h3>
              <p className="text-gray-300">We make texting your crush easy. You've never got her attention like this.</p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Less Effort Higher Reward</h3>
              <p className="text-gray-300">Craft the perfect opener with our profile analyzer.</p>
            </div>
          </div>

          {/* Main Features */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">Features</h2>

            <div className="space-y-8">
              <div className="bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">Infinite Rizz</h3>
                <p className="text-gray-300">
                  U takes a personalized approach to craft the perfect texts for your dating conversations based on your dating preferences.
                  All you have to do is upload a screenshot of any conversation, could be on tinder, hinge, bumble, instagram, to the U app
                  and we will generate personalized responses to keep your crush engaged so that you can finally get a date scheduled with
                  your one and only.
                </p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">The Perfect Opener</h3>
                <p className="text-gray-300">
                  We want you to stand out online with openers that capture the attention of your crush. Openers are extremely important
                  for dating apps and even instagram. We offer a personalized approach with our profile analyzer to help you send the
                  perfect opener, every time.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold">FAQ</h2>

            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Why U?</h3>
                <p className="text-gray-300">U is a dating tool powered by AI for download on the app store. Use it to improve your love life.</p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Will it really help?</h3>
                <p className="text-gray-300">
                  U was made to help you crush your dates. Get clever, get funny, get dates. Infinite rizz for the perfect opener
                  and the perfect reply, whenever you need it.
                </p>
              </div>

              <div className="bg-gray-800/50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-2">Who is it meant for?</h3>
                <p className="text-gray-300">
                  U is for you if you don't have time for games. Stop getting ghosted and catch your crush.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-8">
            <p className="text-2xl font-bold text-blue-400">MAKE dating easy. Download now.</p>
          </div>
        </div>
      </div>
    </div>
  );
};