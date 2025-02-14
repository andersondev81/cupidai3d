import React from "react"

export const sections = [
  "nav",
  "about",
  "aidatingcoach",
  "download",
  "token",
  "roadmap",
]

const Section = ({ children, isActive, className = "" }) => (
  <section
    className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${className} ${
      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
  >
    {children}
  </section>
)

const NavigationButton = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center rounded-md px-6 py-3 transition-all ${className}`}
  >
    {children}
  </button>
)

export const CastleUi = ({ section = 0, onSectionChange, cameraRef }) => {
  const currentSectionKey = sections[section]

  const handleHomeNavigation = () => {
    if (cameraRef) {
      cameraRef.goToHome()
      onSectionChange(0, "nav")
    }
  }

  return (
    <main className="relative h-full w-full">
      {/* Seção About */}
      <Section isActive={currentSectionKey === "about"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">
            About this Project
          </h1>
          <p className="text-stone-200 max-w-2xl text-lg">
            Discover the innovative features behind our castle-inspired
            platform...
          </p>
          <NavigationButton
            onClick={handleHomeNavigation}
            className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
          >
            Back to Main
          </NavigationButton>
        </div>
      </Section>

      {/* Seção AI Dating Coach */}
      <Section isActive={currentSectionKey === "aidatingcoach"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">AI Dating Coach</h1>
          <div className="flex gap-4">
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back to Main
            </NavigationButton>
          </div>
        </div>
      </Section>

      {/* Seção Download */}
      <Section isActive={currentSectionKey === "download"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">
            Download the App
          </h1>
          <div className="flex gap-4">
            <NavigationButton
              onClick={() => window.open("#download-link", "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white pointer-events-auto"
            >
              iOS Version
            </NavigationButton>
            <NavigationButton
              onClick={() => window.open("#download-link", "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white pointer-events-auto"
            >
              Android Version
            </NavigationButton>
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back
            </NavigationButton>
          </div>
        </div>
      </Section>

      {/* Seção Token */}
      <Section isActive={currentSectionKey === "token"}>
        <div className="flex flex-col items-center gap-6 pb-60">
          <h1 className="text-4xl font-bold text-stone-100">
            Token Information
          </h1>
          <NavigationButton
            onClick={handleHomeNavigation}
            className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
          >
            Back to Main
          </NavigationButton>
        </div>
      </Section>

      {/* Seção Roadmap */}
      <Section isActive={currentSectionKey === "roadmap"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">
            Development Roadmap
          </h1>
          <div className="flex gap-4">
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Main Menu
            </NavigationButton>
          </div>
        </div>
      </Section>
    </main>
  )
}
