/**
 * Volumetric Cloud material component by Anderson Mancini - Jan 2024.
 */

import React, { useRef, useMemo } from "react"
import { shaderMaterial } from "@react-three/drei"
import { extend, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { ImprovedNoise } from "three/addons/math/ImprovedNoise.js"

export default function VolumetricCloudMaterial({
  threshold = 0.4,
  opacity = opacity * 0.8,
  range = range * 0.2,
  side = THREE.BackSide,
  depthTest,
  color = "#e0f4ff",
  steps = 32,
  ...props
}) {
  const texture = useMemo(() => {
    const size = 128
    const data = new Uint8Array(size * size * size)

    let i = 0
    const scale = 0.15
    const perlin = new ImprovedNoise()
    const vector = new THREE.Vector3()

    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const d =
            1.0 -
            vector
              .set(x, y, z)
              .subScalar(size / 2)
              .divideScalar(size)
              .length()
          data[i] =
            (128 + 128 * perlin.noise(x * scale, y * scale, z * scale)) *
            d *
            d *
            2
          i++
        }
      }
    }

    const textureMap = new THREE.Data3DTexture(data, size, size, size)
    textureMap.format = THREE.RedFormat
    textureMap.minFilter = THREE.LinearFilter
    textureMap.magFilter = THREE.LinearFilter
    textureMap.unpackAlignment = 1
    textureMap.needsUpdate = true

    return textureMap
  }, [])

  const VolumetricCloudMaterial = useMemo(() => {
    return shaderMaterial(
      {
        base: new THREE.Color(color),
        map: texture,
        cameraPos: new THREE.Vector3(),
        threshold: threshold,
        opacity: opacity,
        range: range,
        steps: steps,
        frame: 0,
      },
      /*GLSL */
      `
        uniform vec3 cameraPos;
        out vec3 vOrigin;
        out vec3 vDirection;

        void main() {
          vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
          vOrigin = vec3( inverse( modelMatrix ) * vec4( cameraPos, 1.0 ) ).xyz;
          vDirection = position - vOrigin;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      /*GLSL */
      `
      precision highp float;
      precision highp sampler3D;


      in vec3 vOrigin;
      in vec3 vDirection;

      out vec4 color;

      uniform vec3 base;
      uniform sampler3D map;

      uniform float threshold;
      uniform float range;
      uniform float opacity;
      uniform float steps;
      uniform float frame;

      uint wang_hash(uint seed)
      {
        seed = (seed ^ 61u) ^ (seed >> 16u);
        seed *= 9u;
        seed = seed ^ (seed >> 4u);
        seed *= 0x27d4eb2du;
        seed = seed ^ (seed >> 15u);
        return seed;
      }

      float randomFloat(inout uint seed)
      {
        return float(wang_hash(seed)) / 4294967296.;
      }

      vec2 hitBox( vec3 orig, vec3 dir ) {
        const vec3 box_min = vec3( - 1.0, - 1, - 1.0 );
        const vec3 box_max = vec3( 1.0, 1.0, 1.0 );
        vec3 inv_dir = 1.0 / dir;
        vec3 tmin_tmp = ( box_min - orig ) * inv_dir;
        vec3 tmax_tmp = ( box_max - orig ) * inv_dir;
        vec3 tmin = min( tmin_tmp, tmax_tmp );
        vec3 tmax = max( tmin_tmp, tmax_tmp );
        float t0 = max( tmin.x, max( tmin.y, tmin.z ) );
        float t1 = min( tmax.x, min( tmax.y, tmax.z ) );
        return vec2( t0, t1 );
      }

      float sample1( vec3 p ) {
        return texture( map, p).r;
      }

      float shading( vec3 coord ) {
        float step = 0.01;
        return sample1( coord + vec3( - step )) - sample1(fract( coord * 3. - frame * 0.02 )) * 0.3 - sample1( coord + vec3( step ));
      }

      void main(){
        vec3 rayDir = normalize( vDirection );
        vec3 scale_factor = vec3( 2., 2., 2. );
        vec2 bounds = hitBox( vOrigin, rayDir );
        if ( bounds.x > bounds.y ) discard;
        bounds.x = max( bounds.x, 0.0 );
        vec3 p = vOrigin + bounds.x * rayDir;
        vec3 inc = 1.0 / abs( rayDir ) ;
        float delta = min( inc.x, min( inc.y, inc.z )) ;
        delta /= steps;

        p /= scale_factor;

        // Jitter
        // Nice little seed from
        // https://blog.demofox.org/2020/05/25/casual-shadertoy-path-tracing-1-basic-camera-diffuse-emissive/
        uint seed = uint( gl_FragCoord.x ) * uint( 1973 ) + uint( gl_FragCoord.y ) * uint( 9277 ) + uint( frame ) * uint( 26699 );
        vec3 size = vec3( textureSize( map, 0 ));
        float randNum = randomFloat( seed ) * 2.0 - 1.0;
        p += rayDir * randNum * ( 1.0 / size );

        vec4 ac = vec4( base, 0.0 );

    for (float t = bounds.x; t < bounds.y; t += delta * 1.5) { // Passos mais espaçados (otimizado)
  float d = sample1(p + 0.5);
  d = smoothstep(threshold - range, threshold + range, d) * opacity;
  float col = shading(p + 0.5) * 2.0 + ((p.x + p.y) * 0.25 * sin(frame)) * 0.5; // Reduz efeitos dinâmicos
  ac.rgb += (1.0 - ac.a) * d * col;
  ac.a += (1.0 - ac.a) * d;
  if (ac.a >= 0.95) break; // Early exit para transparência total
  p += rayDir * delta;
}

        color = ac;
        if ( color.a < 0.001 ) discard;
      }
      `
    )
  }, [threshold, opacity, range, steps, color])

  extend({ VolumetricCloudMaterial })

  useFrame((state, delta) => {
    ref.current.frame += delta
    ref.current.cameraPos.copy(state.camera.position)
  })

  const ref = useRef()

  return (
    <volumetricCloudMaterial
      key={VolumetricCloudMaterial.key}
      side={THREE.BackSide}
      transparent={true}
      depthTest={depthTest}
      depthWrite={false}
      ref={ref}
      glslVersion={THREE.GLSL3}
    />
  )
}
