import { Heart, Star, Calendar, Sparkles, ArrowRight, Feather } from "lucide-react"

const CupidRoadmapPage = () => {
  return (
    <div className="min-h-screen  font-serif">
      {/* Pergaminho Header */}
      <div className="relative py-16 text-center">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full max-w-4xl h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwYXRoIGQ9Ik0gLTEwLDAgTCAxMCwwIE0gMCwtMTAgTCAwLDEwIiBzdHJva2U9IiNmZGJhNzQiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-25"></div>
        </div>
        <div className="relative">
          <div className="flex justify-center mb-4">
            <Feather className="text-pink-400" size={48} />
          </div>
          <h1 className="text-7xl font-bold text-pink-700 mb-6">Divine Roadmap</h1>
          <p className="text-xl text-white">The Celestial Plan for Cupid's Church</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Introdução */}
        <div className="relative mb-16 p-8 bg-gradient-to-r shadow-md">


          <h2 className="text-5xl font-bold text-black mb-4 text-center">The Divine Vision</h2>
          <p className="text-white leading-relaxed text-xl mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit
            voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis
            et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <p className="text-white leading-relaxed text-xl">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
            dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
            sit amet.
          </p>
        </div>

        {/* Roadmap 1 - Phase I */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Heart className="text-pink-500 mr-3" size={28} fill="currentColor" />
            <h2 className="text-5xl font-bold text-pink-700">Phase I: Divine Beginnings</h2>
          </div>

          <div className="relative pl-8 border-l-2 border-pink-200">
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-pink-600 mb-3">Celestial Foundation</h3>
              <p className="text-white leading-relaxed text-xl mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-lg">Core Architecture</span>
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-lg">Divine Interface</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-pink-600 mb-3">Sacred Algorithms</h3>
              <p className="text-white leading-relaxed text-xl mb-4">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-lg">Matchmaking</span>
                <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-lg">Compatibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap 2 - Phase II */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Star className="text-amber-500 mr-3" size={28} fill="currentColor" />
            <h2 className="text-5xl font-bold text-amber-700">Phase II: Heavenly Expansion</h2>
          </div>

          <div className="relative pl-8 border-l-2 border-amber-200">
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-amber-600 mb-3">Ethereal Realms</h3>
              <p className="text-white leading-relaxed text-xl mb-4">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam
                rem aperiam, eaque ipsa quae ab illo inventore veritatis.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-lg">3D Environments</span>
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-lg">Interactive Spaces</span>
              </div>
            </div>

            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-amber-600 mb-3">Divine Communication</h3>
              <p className="text-white leading-relaxed text-xl mb-4">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum
                deleniti atque corrupti quos dolores et quas molestias excepturi.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-lg">Messaging</span>
                <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-lg">Voice Interaction</span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap 3 - Phase III */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Sparkles className="text-purple-500 mr-3" size={28} />
            <h2 className="text-5xl font-bold text-purple-700">Phase III: Transcendent Evolution</h2>
          </div>

          <div className="relative pl-8 border-l-2 border-purple-200">
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-purple-600 mb-3">Angelic Intelligence</h3>
              <p className="text-white leading-relaxed text-xl mb-4">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni
                dolores eos qui ratione voluptatem sequi nesciunt.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg">Advanced AI</span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg">
                  Emotional Recognition
                </span>
              </div>
            </div>

            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-purple-600 mb-3">Celestial Connections</h3>
              <p className="text-white leading-relaxed text-xl mb-4">
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia
                non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg">Global Network</span>
                <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-lg">Destiny Matching</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Calendar className="text-pink-500 mr-3" size={28} />
            <h2 className="text-5xl font-bold text-pink-700">Divine Timeline</h2>
          </div>

          <div className="bg-gradient-to-r shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 text-center">
                <h3 className="text-3xl font-bold text-pink-600 mb-3">Genesis</h3>
                <p className="text-white">Q1-Q2 2025</p>
                <div className="mt-3 text-white text-sm">Foundation & Core Features</div>
              </div>

              <div className="p-4 text-center">
                <h3 className="text-3xl font-bold text-amber-600 mb-3">Ascension</h3>
                <p className="text-white">Q3-Q4 2025</p>
                <div className="mt-3 text-white text-sm">Expansion & Enhancement</div>
              </div>

              <div className="p-4 text-center">
                <h3 className="text-3xl font-bold text-purple-600 mb-3">Angel</h3>
                <p className="text-white">Q1-Q2 2026</p>
                <div className="mt-3 text-white text-sm">Advanced Features & Global Reach</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="relative p-8 bg-gradient-to-rshadow-md text-center">


          <h2 className="text-5xl font-bold text-pink-700 mb-4">Divine Blessing</h2>
          <p className="text-white leading-relaxed text-xl mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit
            voluptatem accusantium doloremque laudantium, totam rem aperiam.
          </p>
          <div className="flex justify-center">
            <button className="px-6 py-3 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-300 flex items-center">
              Join the Divine Journey
              <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
    </div>
  )
}

export default CupidRoadmapPage



