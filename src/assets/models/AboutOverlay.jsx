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
      <div className={`relative w-full max-w-4xl p-8 mx-4 bg-gradient-to-b from-pink-950 to-gray-900 rounded-xl shadow-2xl transition-all duration-500 overflow-y-auto max-h-[90vh] ${
        mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-pink-200 hover:text-white transition-colors z-[60] cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <X size={24} />
        </button>

        <div className="space-y-12 text-white">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-300 to-pink-500 bg-clip-text text-transparent">
              Welcome to Cupid's Church
            </h1>
            <p className="text-2xl font-semibold text-pink-100">Where Love Meets Innovation in 3D</p>
            <p className="text-xl text-pink-400">Experience the magic of finding true love in our enchanted digital sanctuary</p>
          </div>

          {/* Immersive Experience */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-pink-200">An Immersive Journey to Love</h2>
            <div className="bg-pink-950/30 p-6 rounded-xl border border-pink-800/20">
              <p className="text-pink-100 leading-relaxed">
                Step into our magical 3D church, crafted with Three.js technology, where every corner holds the promise of finding your perfect match. Our digital sanctuary combines cutting-edge web technology with the timeless quest for love, creating an enchanting experience unlike any other dating platform.
              </p>
            </div>
          </div>

          {/* Technical Marvel */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-pink-950/30 p-6 rounded-xl border border-pink-800/20">
              <h3 className="text-2xl font-bold mb-4 text-pink-200">Architectural Wonder</h3>
              <p className="text-pink-100">Built with Three.js, our church features stunning 3D graphics, dynamic lighting, and interactive elements that respond to your journey through love's digital cathedral.</p>
            </div>
            <div className="bg-pink-950/30 p-6 rounded-xl border border-pink-800/20">
              <h3 className="text-2xl font-bold mb-4 text-pink-200">Sacred Technology</h3>
              <p className="text-pink-100">Experience real-time 3D rendering, smooth animations, and an atmosphere that adapts to your presence, creating a truly magical environment for finding love.</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-pink-200">Divine Features</h2>
            <div className="space-y-6">
              <div className="bg-pink-950/30 p-6 rounded-xl border border-pink-800/20">
                <h3 className="text-2xl font-bold mb-4 text-pink-200">Interactive Love Sanctuary</h3>
                <p className="text-pink-100">
                  Navigate through our beautifully crafted 3D environment, where each area is designed to enhance your journey to finding true love. From the glowing orbs of potential matches to the sacred halls of connection, every element is crafted to create an unforgettable experience.
                </p>
              </div>

              <div className="bg-pink-950/30 p-6 rounded-xl border border-pink-800/20">
                <h3 className="text-2xl font-bold mb-4 text-pink-200">Cupid's Digital Blessing</h3>
                <p className="text-pink-100">
                  Our church isn't just a beautiful 3D space – it's powered by advanced AI that works like a modern-day Cupid, helping you find and connect with your perfect match through divine digital intervention.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Specs */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-pink-200">Technical Enchantment</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-pink-950/30 p-4 rounded-xl border border-pink-800/20 text-center">
                <p className="text-pink-200 font-semibold">Three.js Powered</p>
              </div>
              <div className="bg-pink-950/30 p-4 rounded-xl border border-pink-800/20 text-center">
                <p className="text-pink-200 font-semibold">Real-time 3D Graphics</p>
              </div>
              <div className="bg-pink-950/30 p-4 rounded-xl border border-pink-800/20 text-center">
                <p className="text-pink-200 font-semibold">Interactive Elements</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-8">
            <h2 className="text-3xl font-bold text-pink-300 mb-4">Begin Your Journey to True Love</h2>
            <p className="text-xl text-pink-100">Step into Cupid's Church and let our digital sanctuary guide you to your soulmate</p>
          </div>
        </div>
      </div>
    </div>
  );
};