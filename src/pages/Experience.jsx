import { Perf } from "r3f-perf"
import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"
import { useGLTF, Environment, Sparkles, useMask } from "@react-three/drei"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import Castle from "../assets/models/Castle"
import { CastleUi } from "../assets/models/CastleUi"
import { Flower } from "../assets/models/Flower"
import { Pole } from "../assets/models/Pole"
import { Stairs } from "../assets/models/Stairs"
import { CloudGroup } from "../assets/models/CloudsGroup"
import AtmIframe from "../assets/models/AtmIframe"
import MirrorIframe from "../assets/models/MirrorIframe"
import Orb from "../assets/models/Orb"

import { CAMERA_CONFIG } from "../components/cameraConfig"
import { EffectsTree } from "../components/helpers/EffectsTree"
import EnvMapLoader from "../components/helpers/EnvMapLoader"
import Canvasload from "../components/helpers/Canvasload"

// Componente de loading interno para Experience
const InternalLoadingScreen = ({ progress }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
      <div className="w-64 h-16 bg-black border border-pink-600 rounded-md flex flex-col items-center justify-center">
        <div className="text-white mb-2 text-sm font-medium">
          Carregando cenário...
        </div>
        <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-600 to-purple-600"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Canvas Configuration
const getCanvasConfig = isMobile => ({
  dpr: isMobile ? 1 : 1.5,
  gl: {
    antialias: false,
    powerPreference: isMobile ? "low-power" : "high-performance",
    alpha: false,
    depth: true,
    stencil: true,
  },
  performance: { min: 0.1 },
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [15.9, 6.8, -11.4],
  },
  shadows: !isMobile,
})

// Asset Preloader com sistema de progresso
const AssetPreloader = ({ onLoaded, onProgress }) => {
  useEffect(() => {
    // Configurar DRACOLoader
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.5.6/"
    )
    dracoLoader.setDecoderConfig({ type: "js" })

    // Configurar GLTFLoader com suporte DRACO
    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    // Lista de modelos para pré-carregar
    const models = ["/models/castleClouds.glb", "/models/Castle.glb"]

    let loadedCount = 0
    const totalCount = models.length

    // Função para pré-carregar modelos
    const preloadModels = async () => {
      try {
        // Função para carregar um modelo individual
        const loadModel = url => {
          return new Promise((resolve, reject) => {
            gltfLoader.load(
              url,
              gltf => {
                // Armazenar no cache
                const key = url.startsWith("./") ? url.slice(2) : url
                useGLTF.cache.set(key, gltf)

                // Atualizar progresso
                loadedCount++
                const progress = loadedCount / totalCount
                if (onProgress) onProgress(progress)

                console.log(`Modelo carregado: ${loadedCount}/${totalCount}`)
                resolve(gltf)
              },
              // Callback de progresso para cada modelo
              xhr => {
                if (xhr.lengthComputable) {
                  const modelProgress = xhr.loaded / xhr.total
                  const overallProgress =
                    (loadedCount + modelProgress) / totalCount
                  if (onProgress) onProgress(overallProgress)
                }
              },
              reject
            )
          })
        }

        // Carregar modelos em paralelo para maior eficiência
        await Promise.all(models.map(loadModel))

        console.log("🚀 Todos os modelos pré-carregados com sucesso!")
        onLoaded()
        window.dispatchEvent(new CustomEvent("scene-ready"))
      } catch (error) {
        console.error("❌ Erro ao pré-carregar modelos:", error)
        // Mesmo em caso de erro, continuar para não bloquear a experiência
        onLoaded()
        window.dispatchEvent(new CustomEvent("scene-ready"))
      }
    }

    // Iniciar pré-carregamento
    preloadModels()

    // Cleanup
    return () => {
      dracoLoader.dispose()
      models.forEach(url => {
        try {
          useGLTF.clear(url)
        } catch (e) {
          console.warn("Erro ao limpar modelo:", e)
        }
      })
    }
  }, [onLoaded, onProgress])

  return null
}

// Cloud Mask Component - Modificado para suportar loadedAssets
const CloudMask = React.memo(({ loadedAssets }) => {
  const stencil = useMask(1, true)
  // Use pre-loaded model if available, otherwise load directly
  const { scene } =
    loadedAssets?.models?.clouds || useGLTF("/models/castleClouds.glb")

  useEffect(() => {
    if (!scene) return

    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshBasicMaterial({
          ...stencil,
          colorWrite: false,
        })
      }
    })
  }, [scene, stencil])

  return (
    <primitive object={scene} position={[0, 0, 0]} scale={1} visible={false} />
  )
})

// Camera Animation Hook
const useCameraAnimation = (section, cameraRef) => {
  const { camera } = useThree()
  const animationRef = React.useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startFov: 50,
    lastTime: 0,
    config: null,
  })

  useEffect(() => {
    if (!camera) return

    const config =
      CAMERA_CONFIG.sections[section] || CAMERA_CONFIG.sections["intro"]
    const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    const setAnimationStart = () => {
      animationRef.current = {
        ...animationRef.current,
        isActive: true,
        startPosition: camera.position.clone(),
        startFov: camera.fov,
        lastTime: performance.now(),
        config,
      }
    }

    const animate = now => {
      if (window.blockAllCameraMovement || !animationRef.current.isActive)
        return

      const { startPosition, startFov, config } = animationRef.current
      const delta = Math.min((now - animationRef.current.lastTime) / 1000, 0.1)
      animationRef.current.lastTime = now
      animationRef.current.progress += delta * 1.5

      const t = Math.min(animationRef.current.progress, 1)
      const k = ease(t)

      camera.position.lerpVectors(startPosition, config.position, k)
      camera.fov = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(startFov, Math.min(config.fov || 50, 55), k),
        35,
        60
      )
      camera.updateProjectionMatrix()

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        animationRef.current.isActive = false
        animationRef.current.progress = 0
        camera.fov = Math.min(config.fov || 50, 55)
        camera.updateProjectionMatrix()
      }
    }

    const timeout = setTimeout(() => {
      setAnimationStart()
      requestAnimationFrame(animate)
    }, 50)

    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          setAnimationStart()
          animationRef.current.config = {
            position: new THREE.Vector3(15.9, 6.8, -11.4),
            fov: 50,
            transition: { fovMultiplier: 0, zOffset: 0 },
          }
          requestAnimationFrame(animate)
        },
      }
    }

    return () => {
      clearTimeout(timeout)
      animationRef.current.isActive = false
    }
  }, [section, camera, cameraRef])
}

// Scene Controller Component
const SceneController = React.memo(({ section, cameraRef, onLevaReady }) => {
  const { camera } = useThree()
  useCameraAnimation(section, cameraRef)

  useEffect(() => {
    window.threeCamera = camera

    // Verificar se o Leva está disponível
    const checkLevaAvailability = () => {
      // Verificar se os controles Leva foram carregados
      if (
        window.__LEVA__ ||
        window.leva ||
        document.querySelector("[data-leva-theme]") ||
        document.querySelector(".leva-container")
      ) {
        console.log("✅ Scene Controller: Leva detectado!")
        if (onLevaReady) onLevaReady(true)

        // Disparar evento para o App.jsx
        window.dispatchEvent(new CustomEvent("leva-loaded"))
        return true
      }
      return false
    }

    // Verificar imediatamente
    if (!checkLevaAvailability()) {
      // Se não estiver pronto, verificar periodicamente
      const interval = setInterval(() => {
        if (checkLevaAvailability()) {
          clearInterval(interval)
        }
      }, 500)

      // Limpar interval
      return () => clearInterval(interval)
    }

    return () => {
      delete window.threeCamera
    }
  }, [camera, onLevaReady])

  return (
    <>
      <EnvMapLoader />
      {process.env.NODE_ENV !== "production" && <Perf position="top-left" />}
    </>
  )
})

// Scene Content Components
const PrimaryContent = React.memo(
  ({ activeSection, onSectionChange, loadedAssets }) => (
    <>
      <Environment
        files="/images/CloudsBG1.hdr"
        background
        resolution={256}
        ground={{ height: 5, radius: 20, scale: 100 }}
      />

      <EffectsTree />
      <Castle
        activeSection={activeSection}
        scale={[2, 1.6, 2]}
        loadedAssets={loadedAssets}
      />
      <Flower />
      <Stairs />
      <Orb loadedAssets={loadedAssets} />
      <Pole
        position={[-0.8, 0, 5.8]}
        scale={[0.6, 0.6, 0.6]}
        onSectionChange={onSectionChange}
      />
    </>
  )
)

const SecondaryContent = React.memo(({ loadedAssets }) => {
  const cloudGroupRef = useRef()
  const { camera } = useThree()

  useFrame(() => {
    const castleCenter = new THREE.Vector3(0, 0, 0)
    const distance = camera.position.distanceTo(castleCenter)

    const minDistance = 5
    const maxDistance = 8
    const minOpacity = 0.7
    const maxOpacity = 1.8

    const t = THREE.MathUtils.clamp(
      (distance - minDistance) / (maxDistance - minDistance),
      0,
      1
    )
    const targetOpacity = THREE.MathUtils.lerp(maxOpacity, minOpacity, t)

    if (cloudGroupRef.current) {
      cloudGroupRef.current.traverse(obj => {
        if (obj.isMesh && obj.material) {
          obj.material.opacity = targetOpacity
          obj.material.transparent = true
          obj.material.depthWrite = false
          obj.material.needsUpdate = true
        }
      })
    }
  })

  return (
    <>
      <ambientLight intensity={3} color="#ffffff" />
      <group ref={cloudGroupRef}>
        <CloudGroup
          commonProps={{
            concentration: 1.2,
            sizeAttenuation: true,
            color: "#ffffff",
            depthWrite: false,
            stencilRef: 1,
            stencilWrite: true,
            stencilFunc: THREE.EqualStencilFunc,
            cloudLightIntensity: 0.5,
            opacity: 1.0,
            transparent: true,
          }}
          clouds={[
            //Front clouds
        { position: [-0.1, 0, 4.3], fade: 20 },
        { position: [0, 0, 4.5], segments: 25, bounds: [10,1,1.2], fade: 5, opacity: 1.3  },
        { position: [-0.6, -0.15, 5], segments: 8, bounds: [1.5,1,1], opacity: 1.5  },
       //far front
        { position: [0, 0, 5.6], density:1, segments: 30, bounds: [10,1,6]  },
        { position: [-2.8, 0, 3.3], density:1, segments: 35, bounds: [12,1,5]  },
        { position: [-3.0, 0, 5.0], density:1, segments: 30, bounds: [10,1,5]  },
        { position: [2.8, 0, 3.3], density:1, segments: 35, bounds: [12,1,5]  },
        { position: [3.0, 0, 5.0], density:1, segments: 30, bounds: [10,1,5]  },
        // right side
        { position: [0.2, 0, 3.95], rotation: [0, 1.7, 3.3]},
        { position: [1.6, 0.2, 2.6], rotation: [0, 0.15, 0] },
        { position: [2.05, 0.15, 2.2], rotation: [0, 1, 0] },
        { position: [2.65, 0.15, 1.1], rotation: [0, 1.7, 0] },
        { position: [2.8, 0.1, -0.6], rotation: [0, 1.4, 0] },
        // far right
        { position: [6.6, 0, 2], density:1, segments: 30, bounds: [10,1,5], rotation: [0, 3.14, 0]  },
        { position: [6.6, 0, -1.5], density:1, segments: 30, bounds: [10,1,5], rotation: [0, 3.14, 0]  },
        { position: [6.0, 0, -4.8], density:1, segments: 30, bounds: [10,1,5], rotation: [0, 3.14, 0]  },
        // rear side
        { position: [2.9, 0.15, -2.0], rotation: [0, 2, 0] },
        { position: [1.4, 0.2, -3.35], rotation: [3.14, 0.15, 0] },
        { position: [-0.1, 0.2, -3.45], rotation: [3.14, 0, 0] },
        { position: [-1.5, 0.2, -3.35], rotation: [3.14, -0.1, 0] },
        { position: [-1.75, 0.15, -2.55], rotation: [0, 0.8, 0] },
        // far back
        { position: [0, 0, -6.0], density:1, segments: 30, bounds: [12,1,5], rotation: [0, 3.14, 0]  },
        { position: [3, 0, -8.3], density:1, segments: 20, bounds: [10,1,3], rotation: [0, 3.14, 0]  },
        { position: [-3, 0, -8.0], density:1, segments: 20, bounds: [10,1,3], rotation: [0, 3.14, 0]  },
        //{ position: [3.5, 0, -10.0], density:1, segments: 20, bounds: [8,1,6], rotation: [0, 5.2, 0]  },
        //{ position: [-3.5, 0, -9.0], density:1, segments: 30, bounds: [10,1,6], rotation: [0, 3.14, 0]  },
        //left side
        { position: [-2.55, 0.15, -1], rotation: [0, 1.65, 3.14] },
        { position: [-2.7, 0.15, 0.1], rotation: [3.14, 1.7, 3.14] },
        { position: [-2, 0.15, 2.4], rotation: [0, -1.1, 0] },
        { position: [-1, 0.15, 2.75], rotation: [0, -0.4, 0] },
        { position: [-0.25, 0, 4.2], rotation: [0, -1.9, 0] },
        // far left
        { position: [-6.6, 0, 2.0], density:1, segments: 30, bounds: [10,1,5], rotation: [0, 3.14, 0]  },
        { position: [-6.6, 0, -1.5], density:1, segments: 30, bounds: [10,1,5], rotation: [0, 3.14, 0]  },
        { position: [-6.0, 0, -4.8], density:1, segments: 30, bounds: [10,1,5], rotation: [0, 3.14, 0]  },

          ]}
        />
      </group>
    </>
  )
})

const TertiaryContent = React.memo(() => <MirrorIframe />)

// Scene Content Wrapper
const SceneContent = React.memo(
  ({ activeSection, onSectionChange, onSceneLoaded, loadedAssets }) => {
    // Signal that the scene content is ready
    useEffect(() => {
      if (onSceneLoaded) {
        onSceneLoaded()
      }
    }, [onSceneLoaded])

    return (
      <>
        <PrimaryContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          loadedAssets={loadedAssets}
        />
        <SecondaryContent loadedAssets={loadedAssets} />
        <TertiaryContent />
      </>
    )
  }
)

// Main Experience Component - Com sistema de loading e detecção do Leva
const Experience = ({ onSceneReady, loadedAssets, isReady, onLevaReady }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")
  const [internalLoadProgress, setInternalLoadProgress] = useState(0)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [showInternalLoader, setShowInternalLoader] = useState(true)
  const [levaLoaded, setLevaLoaded] = useState(false)
  const cameraRef = useRef(null)

  const isMobile = useMobileDetection()
  const canvasConfig = getCanvasConfig(isMobile)

  // Callback para progresso do carregamento interno
  const handleInternalProgress = useCallback(progress => {
    setInternalLoadProgress(progress)
  }, [])

  // Callback para quando o Leva estiver carregado
  const handleLevaReady = useCallback(
    isReady => {
      console.log("🎛️ Leva carregado e pronto!")
      setLevaLoaded(true)

      // Notificar App.jsx que Leva está pronto
      if (onLevaReady) {
        onLevaReady(true)
      }
    },
    [onLevaReady]
  )

  // Callback para quando assets internos terminarem de carregar
  const handleAssetsLoaded = useCallback(() => {
    setAssetsLoaded(true)

    // Esconder o loader interno após um pequeno delay para transição suave
    setTimeout(() => {
      setShowInternalLoader(false)
    }, 500)

    console.log("✅ Assets internos carregados")
  }, [])

  // Callback para quando a cena terminar de ser montada
  const handleSceneLoaded = useCallback(() => {
    setSceneLoaded(true)

    if (onSceneReady) {
      onSceneReady()
    }

    console.log("✅ Cena completamente montada")
  }, [onSceneReady])

  // Notificar quando tudo estiver carregado
  useEffect(() => {
    if (assetsLoaded && sceneLoaded && levaLoaded && onSceneReady) {
      console.log("🎮 Experience.jsx: Tudo pronto! (incluindo Leva)")
      onSceneReady()

      // Iniciar áudio ambiente se necessário
      if (window.audioManager && !window.audioManager.muteAll) {
        setTimeout(() => {
          if (window.audioManager.startAmbient) {
            window.audioManager.startAmbient()
            console.log("🔊 Áudio ambiente iniciado")
          }
        }, 1000)
      }
    }
  }, [assetsLoaded, sceneLoaded, levaLoaded, onSceneReady])

  // Handler para mudança de seção
  const handleSectionChange = useCallback((index, sectionName) => {
    setCurrentSection(index)
    setActiveSection(sectionName)
  }, [])

  // Handler para posicionamento personalizado da câmera
  const handleCustomCameraPosition = useCallback((position, target) => {
    if (cameraRef.current?.camera) {
      cameraRef.current.camera.position.set(...position)
      cameraRef.current.camera.lookAt(...target)
      cameraRef.current.camera.updateProjectionMatrix()
    }
  }, [])

  // Setup de eventos globais
  useEffect(() => {
    window.customCameraNavigation = handleCustomCameraPosition
    window.onSectionChange = handleSectionChange

    const handleSectionChangeEvent = event => {
      if (event.detail?.sectionIndex !== undefined) {
        handleSectionChange(event.detail.sectionIndex, event.detail.sectionName)
      }
    }

    window.addEventListener("sectionChange", handleSectionChangeEvent)

    return () => {
      window.removeEventListener("sectionChange", handleSectionChangeEvent)
      delete window.customCameraNavigation
      delete window.onSectionChange
    }
  }, [handleSectionChange, handleCustomCameraPosition])

  // Handler para erros de WebGL
  const handleWebGLContextLost = useCallback(event => {
    event.preventDefault()
    console.error("WebGL context lost - Tentando recuperar...")

    // Exibir mensagem ao usuário
    alert(
      "Houve um problema com o renderizador 3D. A página será recarregada automaticamente."
    )

    // Recarregar a página após timeout para tentar recuperar
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }, [])

  // Configurar listener para erros de WebGL
  useEffect(() => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      canvas.addEventListener("webglcontextlost", handleWebGLContextLost)

      return () => {
        canvas.removeEventListener("webglcontextlost", handleWebGLContextLost)
      }
    }
  }, [handleWebGLContextLost])

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0">
        <Canvas {...canvasConfig} className="w-full h-full">
          {/* Se não tiver loadedAssets vindos do App.jsx, usar o preloader interno */}
          {!loadedAssets && (
            <AssetPreloader
              onLoaded={handleAssetsLoaded}
              onProgress={handleInternalProgress}
            />
          )}

          {/* Scene controller e conteúdo principal */}
          <Suspense fallback={null}>
            <SceneController
              section={currentSection}
              cameraRef={cameraRef}
              onLevaReady={handleLevaReady}
            />
            <SceneContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              onSceneLoaded={handleSceneLoaded}
              loadedAssets={loadedAssets}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Loading UI interno (mostrado apenas quando necessário) */}
      {showInternalLoader && !loadedAssets && (
        <InternalLoadingScreen progress={internalLoadProgress} />
      )}

      {/* Interface do usuário */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="w-full h-full">
          <CastleUi
            section={currentSection}
            onSectionChange={handleSectionChange}
            cameraRef={cameraRef.current}
            className="pointer-events-auto"
          />
          <AtmIframe section={currentSection} />
        </div>
      </div>
    </div>
  )
}

export default Experience
