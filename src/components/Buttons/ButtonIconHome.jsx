import React from "react"

function ButtonIconHome({ text, onClick, href }) {
  const ButtonContent = (
    <div onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <img
        src="/svgs/ButtonHomeIcon.svg"
        width={24}
        height={24}
        alt="Button Home Icon"
      />
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

export default ButtonIconHome
