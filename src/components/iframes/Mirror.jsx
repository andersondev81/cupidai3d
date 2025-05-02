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
    <div className=" font-serif">
      {/* Pergaminho Header */}
      <div className="relative py-16 text-center">
        <div className="absolute inset-0 flex justify-center">
          <div className="w-full max-w-4xl h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxwYXRoIGQ9Ik0gLTEwLDAgTCAxMCwwIE0gMCwtMTAgTCAwLDEwIiBzdHJva2U9IiNmZGJhNzQiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-25"></div>
        </div>
        <div className="relative ">
          <h1 className="text-8xl font-bold text-pink-500 ">
            CUPIDAI
          </h1>
          <p className="text-3xl text-white">
          Dating Coach
          </p>
          <button className="bg-slate-700 hover:bg-slate-600 text-white border border-slate-500 border-dashed mt-5 px-10 py-6 rounded cursor-pointer transition-colors duration-200">
          <span className="text-xl font-bold">PRESS START</span>
          <span className="block text-xs text-slate-300 mt-1">BETA DEMO</span>
        </button>
        </div>
      </div>
      {/* Footer */}
    </div>
  )
}

export default CupidRoadmapPage
