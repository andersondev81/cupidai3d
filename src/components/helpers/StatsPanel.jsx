import React, { useEffect, useRef } from "react"
import Stats from "stats.js"

const StatsPanel = ({ initialX = 10, initialY = 10 }) => {
  const statsRef = useRef()
  const containerRef = useRef(null)

  useEffect(() => {
    const panelStyles = {
      transform: "scale(1)",
      transformOrigin: "top left",
      padding: "10px",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: "8px",
      cursor: "move",
    }

    const applyStyles = (element, styles) => {
      Object.keys(styles).forEach(key => {
        element.style[key] = styles[key]
      })
    }

    const createStatsPanel = (type, marginLeft) => {
      const stats = new Stats()
      stats.showPanel(type)
      stats.dom.style.marginLeft = marginLeft
      applyStyles(stats.dom, panelStyles)
      return stats
    }

    const stats = createStatsPanel(0, "0px") // FPS
    const statsMS = createStatsPanel(1, "105px") // MS
    const statsMemory = createStatsPanel(2, "210px") // Memory

    const container = document.createElement("div")
    container.style.display = "flex"
    container.style.flexDirection = "row"
    container.style.position = "absolute"
    container.style.top = `${initialY}px`
    container.style.left = `${initialX}px`
    container.style.zIndex = "50"
    container.style.cursor = "move"

    container.appendChild(stats.dom)
    container.appendChild(statsMS.dom)
    container.appendChild(statsMemory.dom)
    document.body.appendChild(container)

    containerRef.current = container

    // Drag functionality
    let isDragging = false
    let startX, startY

    const onMouseDown = e => {
      isDragging = true
      startX = e.clientX - container.offsetLeft
      startY = e.clientY - container.offsetTop
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }

    const onMouseMove = e => {
      if (!isDragging) return
      const x = e.clientX - startX
      const y = e.clientY - startY
      container.style.left = `${x}px`
      container.style.top = `${y}px`
    }

    const onMouseUp = () => {
      isDragging = false
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    container.addEventListener("mousedown", onMouseDown)

    const animate = () => {
      stats.update()
      statsMS.update()
      statsMemory.update()
      requestAnimationFrame(animate)
    }

    statsRef.current = { stats, statsMS, statsMemory }
    animate()

    return () => {
      document.body.removeChild(container)
      container.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }
  }, [initialX, initialY])

  return null
}

export default StatsPanel
