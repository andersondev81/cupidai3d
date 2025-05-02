import {
  Heart,
  Star,
  Calendar,
  Sparkles,
  ArrowRight,
  Feather,
} from "lucide-react"

const CupidRoadmapPage = () => {
  return (
    <div className="font-serif">
      {/* Pergaminho Header */}
      <div className="relative py-16 text-center">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full max-w-4xl h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwYXRoIGQ9Ik0gLTEwLDAgTCAxMCwwIE0gMCwtMTAgTCAwLDEwIiBzdHJva2U9IiNmZGJhNzQiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-25"></div>
        </div>
        <div className="relative">
          <div className="flex justify-center mb-4">
            <Feather className="text-pink-400" size={60} />
          </div>
          <h1 className="text-8xl font-bold text-pink-700 mb-6">
            Divine Roadmap
          </h1>
          <p className="text-3xl text-white">
            The Celestial Plan for Cupid's Church
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-20">
        {/* Introdução */}
        <div className="relative mb-16 p-8 bg-gradient-to-r shadow-md">
          <h2 className="text-5xl font-bold text-black mb-4 text-center">
            The Divine Vision
          </h2>
          <p className="text-white leading-relaxed text-2xl mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut
            perspiciatis unde omnis iste natus error sit voluptatem accusantium
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
            inventore veritatis et quasi architecto beatae vitae dicta sunt
            explicabo.
          </p>
          <p className="text-white leading-relaxed text-3xl">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem
            ipsum quia dolor sit amet.
          </p>
        </div>

        {/* Roadmap 1 - Phase I */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Heart
              className="text-pink-500 mr-3"
              size={38}
              fill="currentColor"
            />
            <h2 className="text-6xl font-bold text-pink-700">
              Phase I: Divine Beginnings
            </h2>
          </div>

          <div className="relative pl-8 border-l-2 border-pink-200">
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-pink-600 mb-3">
                Celestial Foundation
              </h3>
              <p className="text-white leading-relaxed text-3xl mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                ut aliquip ex ea commodo consequat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-5 py-2 bg-pink-100 text-pink-700 rounded-full text-2xl">
                  Core Architecture
                </span>
                <span className="px-5 py-2 bg-pink-100 text-pink-700 rounded-full text-2xl">
                  Divine Interface
                </span>
              </div>
            </div>

            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-pink-100 border-2 border-pink-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-pink-600 mb-3">
                Sacred Algorithms
              </h3>
              <p className="text-white leading-relaxed text-3xl mb-4">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-5 py-2 bg-pink-100 text-pink-700 rounded-full text-2xl">
                  Matchmaking
                </span>
                <span className="px-5 py-2 bg-pink-100 text-pink-700 rounded-full text-2xl">
                  Compatibility
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap 2 - Phase II */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Star
              className="text-amber-500 mr-3"
              size={38}
              fill="currentColor"
            />
            <h2 className="text-6xl font-bold text-amber-700">
              Phase II: Cupid's Expansion
            </h2>
          </div>

          <div className="relative pl-8 border-l-2 border-amber-200">
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-amber-600 mb-3">
                Divine Connections
              </h3>
              <p className="text-white leading-relaxed text-3xl mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                ut aliquip ex ea commodo consequat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-5 py-2 bg-amber-100 text-amber-700 rounded-full text-2xl">
                  Community
                </span>
                <span className="px-5 py-2 bg-amber-100 text-amber-700 rounded-full text-2xl">
                  Gatherings
                </span>
              </div>
            </div>
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-amber-600 mb-3">
                Love Networks
              </h3>
              <p className="text-white leading-relaxed text-3xl mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                ut aliquip ex ea commodo consequat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-5 py-2 bg-amber-100 text-amber-700 rounded-full text-2xl">
                  Global Reach
                </span>
                <span className="px-5 py-2 bg-amber-100 text-amber-700 rounded-full text-2xl">
                  Divine API
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap 3 - Phase III */}
        <div className="mb-16">
          <div className="flex items-center mb-6">
            <Sparkles className="text-purple-500 mr-3" size={38} />
            <h2 className="text-6xl font-bold text-purple-700">
              Phase III: Ethereal Ascension
            </h2>
          </div>

          <div className="relative pl-8 border-l-2 border-purple-200">
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-purple-600 mb-3">
                Transcendent Features
              </h3>
              <p className="text-white leading-relaxed text-3xl mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                ut aliquip ex ea commodo consequat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-2xl">
                  Soul Matching
                </span>
                <span className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-2xl">
                  Destiny Path
                </span>
              </div>
            </div>
            <div className="mb-8">
              <div className="absolute -left-3 top-0">
                <div className="w-6 h-6 rounded-full bg-purple-100 border-2 border-purple-400 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                </div>
              </div>
              <h3 className="text-4xl font-bold text-purple-600 mb-3">
                Celestial Integration
              </h3>
              <p className="text-white leading-relaxed text-3xl mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi
                ut aliquip ex ea commodo consequat.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-2xl">
                  Universal Love
                </span>
                <span className="px-5 py-2 bg-purple-100 text-purple-700 rounded-full text-2xl">
                  Eternal Bond
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-pink-200">
          <p className="text-white text-3xl mb-6">With Divine Love ♥</p>
        </div>
      </div>
    </div>
  )
}

export default CupidRoadmapPage
