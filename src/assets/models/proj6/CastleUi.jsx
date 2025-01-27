// CastleUi.jsx (em um arquivo separado)
import React from "react"

export const sections = [
  "intro",
  "about",
  "aidatingcoach",
  "download",
  "token",
  "roadmap",
]

export const CastleUi = ({ section = 0, onSectionChange }) => {
  return (
    <main className="w-full h-full flex flex-col items-center justify-center">
      <div>
        {/* Intro */}
        <section
          className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${
            sections[section] === "intro" ? "" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl font-medium text-stone-100">
            Intro to the project
          </h1>
        </section>
        {/* About */}
        <section
          className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${
            sections[section] === "about" ? "" : "opacity-0"
          }`}
        >
          <h1 className="text-3xl text-center font-medium text-stone-100 drop-shadow-md pt-48 ">
            About this project
          </h1>
        </section>
        {/* AIDatingCoach */}
        <section
          className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${
            sections[section] === "aidatingcoach" ? "" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl font-medium text-stone-100 pt-60">
            A IDating Coach
          </h1>
        </section>
        {/* Download */}
        <section
          className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${
            sections[section] === "download" ? "" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl font-medium text-stone-100 pt-60">
            Donload the app
          </h1>
        </section>
        {/* Token */}
        <section
          className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${
            sections[section] === "token" ? "" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl font-medium text-stone-100 pt-60">Token</h1>
        </section>
        {/* Roadmap */}
        <section
          className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${
            sections[section] === "roadmap" ? "" : "opacity-0"
          }`}
        >
          <h1 className="text-2xl font-medium text-stone-100 pt-60">Roadmap</h1>
        </section>
      </div>

      {/* -------- Butons -------- */}

      <div className="absolute top-4 flex gap-4 pt-16">
        <button
          onClick={() => onSectionChange(0, "intro")}
          className={`px-4 py-2 rounded-md ${
            section === 0 ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          Intro
        </button>
        <button
          onClick={() => onSectionChange(1, "about")}
          className={`px-4 py-2 rounded-md ${
            section === 1 ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          About
        </button>
        <button
          onClick={() => onSectionChange(2, "aidatingcoach")}
          className={`px-4 py-2 rounded-md ${
            section === 2 ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          AI Dating Coach
        </button>
        <button
          onClick={() => onSectionChange(3, "download")}
          className={`px-4 py-2 rounded-md ${
            section === 3 ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          Download
        </button>
        <button
          onClick={() => onSectionChange(4, "token")}
          className={`px-4 py-2 rounded-md ${
            section === 4 ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          Token
        </button>
        <button
          onClick={() => onSectionChange(5, "roadmap")}
          className={`px-4 py-2 rounded-md ${
            section === 5 ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
          }`}
        >
          RoadMap
        </button>
      </div>
    </main>
  )
}
