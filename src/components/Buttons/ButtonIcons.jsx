import React from "react"
import Image from "next/image"
import Link from "next/link"

const ButtonIcons = ({ text, href, onClick }) => {
  const ButtonContent = (
    <div className="flex items-center justify-center">
      <Image
        src="/svgs/icon/ArrowRight.svg"
        alt="Botão com animação"
        width={45}
        height={45}
      />
      <button
        className="flex flex-col items-center text-white hover:px-2 transition-all duration-300 ease-out group"
        onClick={onClick}
      >
        <div className="flex flex-col items-center">
          <span className="text-center pt-1 hover:tracking-wide transition-all ease-out duration-300">
            {text}
          </span>
          <div className="relative w-full mt-0.5 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out">
            <Image
              src="/svgs/LineSmall.svg"
              alt=""
              width={0}
              height={0}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      </button>

      <Image
        src="/svgs/icon/ArrowLeft.svg"
        alt="Botão com animação"
        width={45}
        height={45}
      />
    </div>
  )

  return href ? <Link href={href}>{ButtonContent}</Link> : ButtonContent
}

export default ButtonIcons
