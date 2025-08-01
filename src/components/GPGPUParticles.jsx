import { extend, useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { smoothstep } from 'three/src/math/MathUtils.js'
import { color, deltaTime, Fn, hash, If, instancedArray, instanceIndex, length, mul, range, sub, uniform, uv, vec3 } from 'three/tsl'
import { AdditiveBlending, SpriteNodeMaterial } from 'three/webgpu'

const randValue = /*#__PURE__*/ Fn(({min,max,seed = 42}) => {
    return hash(instanceIndex.add(seed)).mul(max.sub(min)).add(min)
})

export const GPGPUParticles = ({ nbParticles = 1000 }) => {

    const gl = useThree((state) => state.gl)

    const { nodes, uniforms, computeUpdate } = useMemo(() => {
        // uniforms
        const uniforms = {
            color: uniform(color('white')),
        }

        // buffers
        const spawnPositionsBuffer = instancedArray(nbParticles, 'vec3')
        const offsetPositionsBuffer = instancedArray(nbParticles, 'vec3')
        const agesBuffer = instancedArray(nbParticles, 'float')

        const spawnPosition = spawnPositionsBuffer.element(instanceIndex)
        const offsetPosition = offsetPositionsBuffer.element(instanceIndex)
        const age = agesBuffer.element(instanceIndex)

        // initfn
        const lifetime = randValue({ min: 0.1, max: 6, seed: 13 })

        const computeInit = Fn(() => {
            spawnPosition.assign(vec3(randValue({ min: -3, max: 3, seed: 0 }), randValue({ min: -3, max: 3, seed: 1 }), randValue({ min: -3, max: 3, seed: 2 })))
            offsetPosition.assign(0)
            age.assign(randValue({ min: 0, max: lifetime, seed: 11 }))
        })().compute(nbParticles)

        gl.computeAsync(computeInit)

        //updateFn
        const instanceSpeed = randValue({ min: 0.01, max: 0.05, seed: 12 })

        const computeUpdate = Fn(() => {
            age.addAssign(deltaTime)

            If(age.greaterThan(lifetime), () => {
                age.assign(0)
                offsetPosition.assign(0)
            })
            offsetPosition.addAssign(vec3(instanceSpeed, instanceSpeed, instanceSpeed))
        })().compute(nbParticles)

        const scale = vec3(range(0.001, 0.01))

        // Transform particles into circles
        const dist = length(uv().sub(0.5))
        const circle = smoothstep(0.5, 0.49, dist)
        const finalColor = uniforms.color.mul(circle)

        return {
            uniforms,
            computeUpdate,
            nodes: {
                positionNode: spawnPosition.add(offsetPosition),
                colorNode: uniforms.color,
                scaleNode: scale,
            },
        }
    }, [])

    useFrame(() => {
        gl.compute(computeUpdate)
    })

    return (
        <>
            <sprite count={nbParticles}>
                <spriteNodeMaterial {...nodes} transparent depthWrite={false} blending={AdditiveBlending} />
            </sprite>
        </>
    )
}

extend({ SpriteNodeMaterial })