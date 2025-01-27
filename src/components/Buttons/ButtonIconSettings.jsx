import React, { useState } from "react"
import Image from "next/image"
import MusicPlayerDisk from "./ButtonMusicDisk"
import ButtonLanguage from "./ButtonLanguage"

// Componente do Menu
const Menu = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="backdrop-blur-md p-6 rounded-3xl w-60 relative">
            {/* Conteúdo do Menu */}
            <ul className="space-y-4">
              <li>
                <button className="flex items-center space-x-2  text-white">
                  <span>Music</span>
                  <MusicPlayerDisk />
                </button>
              </li>

              <li>
                <button className="flex items-center space-x-2  text-white">
                  <span>Language</span>
                  <ButtonLanguage />
                </button>
              </li>
            </ul>
            {/* Botão de Fechar */}
            <button onClick={onClose} className="absolute top-4 right-4 ">
              <Image
                src="/svgs/icon/Close.svg"
                width={24}
                height={24}
                alt="Close Icon"
              />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Componente principal que inclui o botão de imagem e o menu
const ImageMenuButton = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen(prev => !prev)
  }

  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  return (
    <div>
      {/* Botão de Imagem para abrir o menu */}
      <button onClick={handleMenuToggle} className="p-2">
        <Image
          src="/svgs/icon/Settings.svg"
          width={32}
          height={32}
          alt="Menu Icon"
        />
      </button>

      {/* Menu */}
      <Menu isOpen={isMenuOpen} onClose={handleCloseMenu} />
    </div>
  )
}

export default ImageMenuButton
