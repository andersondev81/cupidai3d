"use client"

import { useState, useEffect } from "react"
import {
  X,
  Heart,
  Apple,
  SmartphoneIcon as Android,
  Star,
  MessageCircle,
  Image,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react"
import AudioManager from "./AudioManager"

export const DownloadOverlay = ({ isVisible, onClose }) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setMounted(true), 300)
      return () => clearTimeout(timer)
    } else {
      AudioManager.play("transition")
      setMounted(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500"
      style={{
        pointerEvents: "auto",
        opacity: mounted ? 1 : 0,
        backgroundImage: `
          linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,192,203,0.6) 100%),
          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ff69b4' fillOpacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
        `,
      }}
    >
      <div
        className={`relative w-full h-full p-8 overflow-y-auto transition-all duration-500 ${
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

        <div className="space-y-12 max-w-5xl mx-auto mt-16">
          {/* Hero Section */}
          <div className="text-center space-y-6 relative">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
              <div className="relative h-16 w-full">
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-64 h-16 bg-gradient-to-r from-pink-200/0 via-pink-200/50 to-pink-200/0 rounded-full blur-xl"></div>
              </div>
            </div>

            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-yellow-100 rounded-full blur-md opacity-70"></div>
              </div>
            </div>

            <h1 className="text-6xl font-bold text-pink-600">CupidAI</h1>
            <p className="text-2xl font-semibold text-pink-500">Your Divine Dating Assistant</p>

            <div className="flex justify-center">
              <div className="relative">
                <Heart className="text-pink-500" size={48} fill="currentColor" />
                <div className="absolute inset-0 animate-ping">
                  <Heart className="text-pink-300" size={48} />
                </div>
              </div>
            </div>

            <div className="max-w-2xl mx-auto mt-6">
              <p className="text-xl text-amber-900">
                Struggling with dating? Let AI help you! CupidAI is your celestial wingman, helping you craft witty,
                engaging, and personalized responses that capture attention.
              </p>
            </div>
          </div>

          {/* App Preview Section */}
          <div className="relative bg-gradient-to-r from-pink-50 to-amber-50 rounded-xl p-8 shadow-lg border border-pink-100">
            <div className="absolute top-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDAgTDEwLDAgUzE1LDAsIDE1LDUgUzEwLDEwLCAxNSwxNSBTMjAsMTUsIDI1LDEwIFMzMCw1LCAzNSwxMCBTNDAsMTUsIDQ1LDEwIFM1MCw1LCA1NSwxMCBTNjAsMTUsIDY1LDEwIFM3MCw1LCA3NSwxMCBTODAsMTUsIDg1LDEwIFM5MCw1LCA5NSwxMCBTMTAwLDE1LCAxMDUsMTAgUzExMCw1LCAxMTUsMTAgUzEyMCwxNSwgMTI1LDEwIFMxMzAsNSwgMTM1LDEwIFMxNDAsMTUsIDE0NSwxMCBTMTUwLDUsIDE1NSwxMCBTMTYwLDE1LCAxNjUsMTAgUzE3MCw1LCAxNzUsMTAgUzE4MCwxNSwgMTg1LDEwIFMxOTAsNSwgMTk1LDEwIFMyMDAsMTUsIDIwMCwxMCBMMjAwLDAgTDAsMAoiIGZpbGw9IiNmZGJhNzQiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDEwIEwxMCwxMCBTMTUsMTAsIDE1LDUgUzEwLDAsIDE1LC01IFMyMCwtNSwgMjUsMCBTMzAsNSwgMzUsMCBTNDAsLTUsIDQ1LDAgUzUwLDUsIDU1LDAgUzYwLC01LCA2NSwwIFM3MCw1LCA3NSwwIFM4MCwtNSwgODUsMCBTOTAsNSwgOTUsMCBTMTAwLC01LCAxMDUsMCBTMTEwLDUsIDExNSwwIFMxMjAsLTUsIDEyNSwwIFMxMzAsNSwgMTM1LDAgUzE0MCwtNSwgMTQ1LDAgUzE1MCw1LCAxNTUsMCBTMTYwLC01LCAxNjUsMCBTMTcwLDUsIDE3NSwwIFMxODAsLTUsIDE4NSwwIFMxOTAsNSwgMTk1LDAgUzIwMCwtNSwgMjAwLDAgTDIwMCwxMCBMMCwxMAoiIGZpbGw9IiNmZGJhNzQiIG9wYWNpdHk9IjAuMyIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDEwMCA1KSIvPjwvc3ZnPg==')] opacity-50"></div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h2 className="text-4xl font-bold text-pink-600 mb-4">
                  NOT a Dating App. <span className="text-amber-600">THE Dating Tool.</span>
                </h2>
                <p className="text-lg text-amber-900 mb-6">
                  CupidAI works with Tinder, Bumble, Hinge, and all your favorite dating apps. We're not here to replace
                  them—we're here to make them work better for you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Zap className="text-amber-500" size={20} fill="currentColor" />
                    <p className="text-amber-900">Less effort, higher reward</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-amber-500" size={20} fill="currentColor" />
                    <p className="text-amber-900">Turn matches into actual dates</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-amber-500" size={20} fill="currentColor" />
                    <p className="text-amber-900">Make dating easy with divine AI assistance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="text-amber-500" size={20} fill="currentColor" />
                    <p className="text-amber-900">Crush your love life with heavenly guidance</p>
                  </div>
                </div>
              </div>

              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  {/* Phone mockup */}
                  <div className="w-64 h-[500px] bg-gray-800 rounded-[36px] p-3 shadow-xl border-4 border-gray-700">
                    <div className="w-full h-full bg-gradient-to-b from-pink-300 to-purple-400 rounded-[28px] overflow-hidden relative">
                      {/* App content mockup */}
                      <div className="absolute top-12 left-0 w-full px-4">
                        <div className="w-full h-12 bg-white/20 backdrop-blur-md rounded-full mb-4 flex items-center justify-center">
                          <Brain className="text-white mr-2" size={16} />
                          <span className="text-white font-semibold">CupidAI</span>
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 mb-3">
                          <div className="text-white text-sm mb-2">Profile Analysis</div>
                          <div className="h-20 bg-white/10 rounded-lg mb-2"></div>
                          <div className="flex justify-end">
                            <div className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full">Analyze</div>
                          </div>
                        </div>

                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                          <div className="text-white text-sm mb-2">Perfect Opener</div>
                          <div className="h-32 bg-white/10 rounded-lg mb-2"></div>
                          <div className="flex justify-end">
                            <div className="bg-pink-500 text-white text-xs px-3 py-1 rounded-full">Generate</div>
                          </div>
                        </div>
                      </div>

                      {/* App navigation */}
                      <div className="absolute bottom-0 left-0 w-full h-16 bg-white/20 backdrop-blur-md flex items-center justify-around px-4">
                        {["message", "image", "sparkles", "heart"].map((icon, i) => (
                          <div key={i} className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-5 h-5 bg-white rounded-full"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-4 -right-4 w-12 h-12">
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-yellow-100 rounded-full blur-md opacity-70"></div>
                      <Sparkles className="absolute inset-0 text-pink-300" size={48} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-xl shadow-lg border border-pink-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16">
                <div className="w-full h-full bg-pink-200 rounded-full opacity-30 blur-xl"></div>
              </div>

              <div className="relative">
                <div className="flex items-center mb-4">
                  <MessageCircle className="text-pink-600 mr-3" size={32} />
                  <h3 className="text-3xl font-bold text-pink-600">Divine Messaging</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-pink-600 mb-2">Instant Openers</h4>
                    <p className="text-gray-700">
                      Get AI-generated funny, flirty, or confident openers that match your style and capture attention.
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-pink-600 mb-2">Personalized Messages</h4>
                    <p className="text-gray-700">
                      CupidAI adapts to your tone, humor, and communication style to keep it natural yet charming.
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-pink-600 mb-2">Profile Analyzer</h4>
                    <p className="text-gray-700">
                      Our AI analyzes profiles to craft the perfect opener that resonates with your match's interests.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-block bg-pink-500/10 text-pink-600 font-semibold px-4 py-2 rounded-full">
                    You've never got her attention like this.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-xl shadow-lg border border-amber-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16">
                <div className="w-full h-full bg-amber-200 rounded-full opacity-30 blur-xl"></div>
              </div>

              <div className="relative">
                <div className="flex items-center mb-4">
                  <Image className="text-amber-600 mr-3" size={32} />
                  <h3 className="text-3xl font-bold text-amber-600">Perfect Profile</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-amber-600 mb-2">Perfect Pics</h4>
                    <p className="text-gray-700">
                      Get influencer A+ pictures for your profile to stand out, 10x your matches, and get dates.
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-amber-600 mb-2">AI Dating Coach</h4>
                    <p className="text-gray-700">
                      Get expert tips and conversation guidance for both online & offline dating situations.
                    </p>
                  </div>

                  <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                    <h4 className="font-bold text-amber-600 mb-2">Dating Made Easy</h4>
                    <p className="text-gray-700">
                      We make texting your crush easy with our AI-powered Rizz. Dating isn't getting any easier... until
                      now.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="inline-block bg-amber-500/10 text-amber-600 font-semibold px-4 py-2 rounded-full">
                    Less Effort, Higher Reward
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compatible Apps */}
          <div className="relative bg-gradient-to-r from-pink-50 to-amber-50 rounded-xl p-8 shadow-lg border border-pink-100">
            <div className="absolute top-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDAgTDEwLDAgUzE1LDAsIDE1LDUgUzEwLDEwLCAxNSwxNSBTMjAsMTUsIDI1LDEwIFMzMCw1LCAzNSwxMCBTNDAsMTUsIDQ1LDEwIFM1MCw1LCA1NSwxMCBTNjAsMTUsIDY1LDEwIFM3MCw1LCA3NSwxMCBTODAsMTUsIDg1LDEwIFM5MCw1LCA5NSwxMCBTMTAwLDE1LCAxMDUsMTAgUzExMCw1LCAxMTUsMTAgUzEyMCwxNSwgMTI1LDEwIFMxMzAsNSwgMTM1LDEwIFMxNDAsMTUsIDE0NSwxMCBTMTUwLDUsIDE1NSwxMCBTMTYwLDE1LCAxNjUsMTAgUzE3MCw1LCAxNzUsMTAgUzE4MCwxNSwgMTg1LDEwIFMxOTAsNSwgMTk1LDEwIFMyMDAsMTUsIDIwMCwxMCBMMjAwLDAgTDAsMAoiIGZpbGw9IiNmZGJhNzQiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDEwIEwxMCwxMCBTMTUsMTAsIDE1LDUgUzEwLDAsIDE1LC01IFMyMCwtNSwgMjUsMCBTMzAsNSwgMzUsMCBTNDAsLTUsIDQ1LDAgUzUwLDUsIDU1LDAgUzYwLC01LCA2NSwwIFM3MCw1LCA3NSwwIFM4MCwtNSwgODUsMCBTOTAsNSwgOTUsMCBTMTAwLC01LCAxMDUsMCBTMTEwLDUsIDExNSwwIFMxMjAsLTUsIDEyNSwwIFMxMzAsNSwgMTM1LDAgUzE0MCwtNSwgMTQ1LDAgUzE1MCw1LCAxNTUsMCBTMTYwLC01LCAxNjUsMCBTMTcwLDUsIDE3NSwwIFMxODAsLTUsIDE4NSwwIFMxOTAsNSwgMTk1LDAgUzIwMCwtNSwgMjAwLDAgTDIwMCwxMCBMMCwxMAoiIGZpbGw9IiNmZGJhNzQiIG9wYWNpdHk9IjAuMyIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDEwMCA1KSIvPjwvc3ZnPg==')] opacity-50"></div>

            <h2 className="text-4xl font-bold text-center text-pink-600 mb-8">Works With All Dating Apps</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Tinder", "Bumble", "Hinge", "OkCupid", "Coffee Meets Bagel", "Match", "Plenty of Fish", "Grindr"].map(
                (app, i) => (
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md border border-pink-100 text-center"
                  >
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-200 to-amber-200 rounded-full flex items-center justify-center mb-2">
                      <Heart className="text-white" size={24} fill="currentColor" />
                    </div>
                    <p className="text-pink-600 font-semibold">{app}</p>
                  </div>
                ),
              )}
            </div>

            <div className="text-center mt-8">
              <p className="text-lg text-amber-900">
                Stop overthinking your texts! Whether you're looking for love, casual dating, or just fun interactions,
                CupidAI is your ultimate AI wingman!
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div className="relative bg-gradient-to-r from-pink-50 to-amber-50 rounded-xl p-8 shadow-lg border border-pink-100">
            <div className="absolute top-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDAgTDEwLDAgUzE1LDAsIDE1LDUgUzEwLDEwLCAxNSwxNSBTMjAsMTUsIDI1LDEwIFMzMCw1LCAzNSwxMCBTNDAsMTUsIDQ1LDEwIFM1MCw1LCA1NSwxMCBTNjAsMTUsIDY1LDEwIFM3MCw1LCA3NSwxMCBTODAsMTUsIDg1LDEwIFM5MCw1LCA5NSwxMCBTMTAwLDE1LCAxMDUsMTAgUzExMCw1LCAxMTUsMTAgUzEyMCwxNSwgMTI1LDEwIFMxMzAsNSwgMTM1LDEwIFMxNDAsMTUsIDE0NSwxMCBTMTUwLDUsIDE1NSwxMCBTMTYwLDE1LCAxNjUsMTAgUzE3MCw1LCAxNzUsMTAgUzE4MCwxNSwgMTg1LDEwIFMxOTAsNSwgMTk1LDEwIFMyMDAsMTUsIDIwMCwxMCBMMjAwLDAgTDAsMAoiIGZpbGw9IiNmZGJhNzQiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDEwIEwxMCwxMCBTMTUsMTAsIDE1LDUgUzEwLDAsIDE1LC01IFMyMCwtNSwgMjUsMCBTMzAsNSwgMzUsMCBTNDAsLTUsIDQ1LDAgUzUwLDUsIDU1LDAgUzYwLC01LCA2NSwwIFM3MCw1LCA3NSwwIFM4MCwtNSwgODUsMCBTOTAsNSwgOTUsMCBTMTAwLC01LCAxMDUsMCBTMTEwLDUsIDExNSwwIFMxMjAsLTUsIDEyNSwwIFMxMzAsNSwgMTM1LDAgUzE0MCwtNSwgMTQ1LDAgUzE1MCw1LCAxNTUsMCBTMTYwLC01LCAxNjUsMCBTMTcwLDUsIDE3NSwwIFMxODAsLTUsIDE4NSwwIFMxOTAsNSwgMTk1LDAgUzIwMCwtNSwgMjAwLDAgTDIwMCwxMCBMMCwxMAoiIGZpbGw9IiNmZGJhNzQiIG9wYWNpdHk9IjAuMyIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDEwMCA1KSIvPjwvc3ZnPg==')] opacity-50"></div>

            <h2 className="text-4xl font-bold text-center text-pink-600 mb-8">Divine Success Stories</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: "Alex M.",
                  text: "I was getting zero responses before CupidAI. The openers it generates are amazing—my match rate has gone up 300% and I've had 5 dates in the last month!",
                  stars: 5,
                },
                {
                  name: "Jordan T.",
                  text: "The profile pic advice was a game-changer. CupidAI helped me choose photos that actually show my best self, and the conversation starters keep things flowing naturally.",
                  stars: 5,
                },
                {
                  name: "Taylor R.",
                  text: "Dating was always stressful for me—I never knew what to say. CupidAI gives me the confidence to message anyone and keep the conversation interesting. Now I'm dating someone amazing!",
                  stars: 5,
                },
              ].map((testimonial, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-pink-100">
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(testimonial.stars)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <p className="text-pink-600 font-semibold">{testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Download Section */}
          <div className="text-center py-8">
            <h2 className="text-5xl font-bold text-pink-600 mb-6">MAKE Dating Easy</h2>
            <p className="text-2xl text-amber-800 mb-8">Download now and upgrade your dating game!</p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button className="flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 text-xl">
                <Apple size={24} />
                <span>iOS Download</span>
              </button>
              <button className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-all duration-300 text-xl">
                <Android size={24} />
                <span>Android Download</span>
              </button>
            </div>

            <div className="mt-8">
              <button
                onClick={onClose}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-full font-bold text-lg hover:bg-gray-300 transition-all duration-300 shadow-lg"
              >
                Return to Cupid's Church
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DownloadOverlay

