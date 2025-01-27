import React from "react"
import { Link } from "react-router-dom"

function PortfolioButton({ image, projectLink, text }) {
  return (
    <div
      className="relative w-24 h-24 sm:w-48 sm:h-48 overflow-hidden"
      style={{
        WebkitMaskImage: `url(./images/ButtonAlpha.png)`,
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "cover",
        maskImage: `url(/images/ButtonAlpha.png)`,
        maskRepeat: "no-repeat",
        maskSize: "cover",
      }}
    >
      <Link to={projectLink} className="w-full h-full block">
        {/* Background image */}
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${image})`,
          }}
        ></div>

        {/* Overlay text */}
        <div className="absolute bottom-0 w-full bg-black bg-opacity-50 text-white text-center py-3  sm:block hidden">
          {text}
        </div>
      </Link>
    </div>
  )
}

export default PortfolioButton
