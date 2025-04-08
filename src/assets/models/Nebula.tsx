import React from "react"
import { useTexture } from "@react-three/drei"
import { GroupProps } from "@react-three/fiber"
import { pipe } from "fp-ts/function"
import { composable, modules } from "material-composer-r3f"
import { bitmask, Layers, useRenderPipeline } from "render-composer"
import {
  Add,
  Float,
  Fract,
  GlobalTime,
  Input,
  InstanceID,
  Mul,
  Rotation3DZ,
  ScaleAndOffset,
  Sin,
  Cos,
  Sub,
  Abs,
  Vec3,
} from "shader-composer"
import { useUniformUnit } from "shader-composer-r3f"
import { Random } from "shader-composer-toybox"
import { Color } from "three"
import { Emitter } from "vfx-composer-r3f"
import { Particle } from "vfx-composer-r3f"

export type NebulaProps = {
  dimensions?: Input<"vec3">
  amount?: number
  rotationSpeed?: Input<"float">
  minSize?: Input<"float">
  maxSize?: Input<"float">
  opacity?: Input<"float">
  color?: Input<"vec3">
} & GroupProps

export const Nebula = ({
  amount = 30,
  dimensions = Vec3([10, 2, 10]),
  rotationSpeed = 0.03,
  minSize = 2,
  maxSize = 8,
  opacity = 1,
  color = new Color("#A53CE6"),
  ...props
}: NebulaProps) => {
  const texture = useTexture("/texture/smoke.png")
  const { depth } = useRenderPipeline()
  const u_depth = useUniformUnit("sampler2D", depth)

  const InstanceRandom = (offset: Input<"float">) =>
    Random(Add(Mul(Float(InstanceID), 1.23), offset))

  return (
    <group {...props}>
      <Particle layers={bitmask(Layers.TransparentFX)}>
        <planeGeometry />

        <composable.meshStandardMaterial
          map={texture}
          transparent
          depthWrite={false}
        >
          {/* Random rotation */}
          <modules.Rotate
            rotation={Rotation3DZ(Mul(InstanceRandom(9999), Math.PI))}
          />

          {/* Continuous rotation over time */}
          <modules.Rotate
            rotation={pipe(
              InstanceRandom(-87),
              v => ScaleAndOffset(v, 2, -1),
              v => Mul(v, rotationSpeed),
              v => Mul(v, GlobalTime),
              Rotation3DZ
            )}
          />

          <modules.Billboard />

          <modules.Scale
            scale={ScaleAndOffset(
              InstanceRandom(123),
              Sub(maxSize, minSize),
              minSize
            )}
          />

          {/* Organic spatial distribution */}
          <modules.Translate
            offset={pipe(
              Vec3([
                Mul(Sin(InstanceRandom(1)), 0.8),
                Mul(Cos(InstanceRandom(2)), 1),
                Mul(Sin(InstanceRandom(3)), 0.8),
              ]),
              v => Mul(v, dimensions)
            )}
            space="local"
          />

          {/* Color variation */}
          <modules.Color
            color={c =>
              Mul(
                c,
                Add(
                  color,
                  Vec3([
                    Mul(InstanceRandom(10), 0.2),
                    Mul(InstanceRandom(20), 0.2),
                    Mul(InstanceRandom(30), 0.2),
                  ])
                )
              )
            }
          />

          {/* Alpha with fade in/out cycle */}
          <modules.Alpha
            alpha={a =>
              Mul(
                a,
                Mul(
                  opacity,
                  Mul(
                    Sub(
                      1,
                      Abs(Sub(1, Fract(Add(GlobalTime, InstanceRandom(55)))))
                    ),
                    1.5
                  )
                )
              )
            }
          />

          <modules.Softness softness={5} depthTexture={u_depth} />
        </composable.meshStandardMaterial>

        <Emitter limit={amount} rate={Infinity} />
      </Particle>
    </group>
  )
}
