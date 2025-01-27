import React from "react"
import { IoLogoLinkedin } from "react-icons/io5"
import { IoLogoDribbble } from "react-icons/io"
import { IoLogoGithub } from "react-icons/io"

function Hero() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 pt-6 pb-8">
      <h1>Anderson Silva Dev</h1>
      <div className="flex flex-row  gap-2">
        <IoLogoGithub className="size-6" />
        <IoLogoLinkedin className="size-6" />
        <IoLogoDribbble className="size-6" />
      </div>
    </div>
  )
}

export default Hero
