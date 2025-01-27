import React from "react"

const ButtonText = ({ text, onClick, href }) => {
  const ButtonContent = (
    <div className="flex items-center justify-center">
      <button
        className="flex flex-col items-center text-white transition-all duration-300 ease-out group"
        onClick={onClick}
      >
        {/* Container para alinhar o texto e a linha */}
        <div className="flex flex-col items-center pt-1">
          {/* Espaçamento do texto com transição */}
          <span className="text-center text-body-small tracking-normal">
            {text}
          </span>
          {/* Linha com menor espaço */}
          <div className="relative w-full mt-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
            <img
              src="/svgs/LineSmall.svg"
              alt="Line decoration"
              style={{ objectFit: "cover", width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </button>
    </div>
  )

  return href ? (
    <a href={href} style={{ textDecoration: "none" }}>
      {ButtonContent}
    </a>
  ) : (
    ButtonContent
  )
}

export default ButtonText
