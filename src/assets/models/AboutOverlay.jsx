"use client"

import { useState, useEffect } from "react"
import { X, Heart } from "lucide-react"
import audioManager from "./AudioManager"

export const AboutOverlay = ({ isVisible, onClose }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isVisible) {

      const timer = setTimeout(() => setMounted(true), 300)
      return () => clearTimeout(timer)
    } else {
      audioManager.play("transition")
      setMounted(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 transition-opacity duration-500"
      style={{
        pointerEvents: "auto",
        opacity: mounted ? 1 : 0,
      }}
    >
      <div
        className={`relative w-full h-full p-8 bg-gradient-to-b from-pink-50 to-white overflow-y-auto transition-all duration-500 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-pink-500 hover:text-pink-700 transition-colors z-[60] cursor-pointer bg-white rounded-full hover:bg-pink-100 shadow-md"
          style={{ pointerEvents: "auto" }}
        >
          <X size={24} />
        </button>

        <div className="space-y-12 text-gray-800 max-w-4xl mx-auto mt-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-pink-600">Welcome to Cupid's Church</h1>
            <p className="text-2xl font-semibold text-pink-400">Where Love Meets Innovation in 3D</p>
            <Heart className="mx-auto text-pink-500" size={48} />
          </div>

          {/* Immersive Experience */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-pink-600">An Immersive Journey to Love</h2>
            <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
              <p className="text-gray-700 leading-relaxed">
                Step into our magical 3D church, crafted with Three.js technology, where every corner holds the promise
                of finding your perfect match. Our digital sanctuary combines cutting-edge web technology with the
                timeless quest for love, creating an enchanting experience unlike any other dating platform.
              </p>
            </div>
          </div>

          {/* Technical Marvel */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
              <h3 className="text-2xl font-bold mb-4 text-pink-600">Architectural Wonder</h3>
              <p className="text-gray-700">
                Built with Three.js, our church features stunning 3D graphics, dynamic lighting, and interactive
                elements that respond to your journey through love's digital cathedral.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
              <h3 className="text-2xl font-bold mb-4 text-pink-600">Sacred Technology</h3>
              <p className="text-gray-700">
                Experience real-time 3D rendering, smooth animations, and an atmosphere that adapts to your presence,
                creating a truly magical environment for finding love.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-pink-600">Divine Features</h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                <h3 className="text-2xl font-bold mb-4 text-pink-600">Interactive Love Sanctuary</h3>
                <p className="text-gray-700">
                  Navigate through our beautifully crafted 3D environment, where each area is designed to enhance your
                  journey to finding true love. From the glowing orbs of potential matches to the sacred halls of
                  connection, every element is crafted to create an unforgettable experience.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-pink-100">
                <h3 className="text-2xl font-bold mb-4 text-pink-600">Cupid's Digital Blessing</h3>
                <p className="text-gray-700">
                  Our church isn't just a beautiful 3D space – it's powered by advanced AI that works like a modern-day
                  Cupid, helping you find and connect with your perfect match through divine digital intervention.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Specs */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-pink-600">Technical Enchantment</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-md border border-pink-100 text-center">
                <p className="text-pink-600 font-semibold">Three.js Powered</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md border border-pink-100 text-center">
                <p className="text-pink-600 font-semibold">Real-time 3D Graphics</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md border border-pink-100 text-center">
                <p className="text-pink-600 font-semibold">Interactive Elements</p>
              </div>
            </div>
          </div>

          {/* Back to Main Button */}
          <div className="text-center py-8">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-300"
            >
              Return to Cupid's Church
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutOverlay