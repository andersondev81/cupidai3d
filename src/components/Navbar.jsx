import React from "react"
import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="flex justify-center items-center  gap-4 px-4 py-4">
      <Link to="/">Portfolio</Link>
      <Link to="/about">Resume</Link>
    </nav>
  )
}

export default Navbar
