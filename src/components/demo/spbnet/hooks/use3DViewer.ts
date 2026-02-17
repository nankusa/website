import { useEffect, useRef, MutableRefObject } from 'react'
import { findPercentile } from '../utils'

export function useMoleculeViewer(
  xyz: string,
  spin: boolean,
  molViewerRef: MutableRefObject<HTMLDivElement | null>
) {
  const molViewer = useRef<any>(null)

  useEffect(() => {
    const loadLibraries = () => {
      if (!window.$3Dmol) {
        const script = document.createElement('script')
        script.src = '/3Dmol.js'
        script.async = true
        document.head.appendChild(script)
      }

      if (!window.nj) {
        const script = document.createElement('script')
        script.src = '/numjs.js'
        script.async = true
        document.head.appendChild(script)
      }
    }
    loadLibraries()
  }, [])

  useEffect(() => {
    if (xyz && molViewerRef.current && window.$3Dmol) {
      const element = molViewerRef.current
      if (!element.viewer) {
        const viewer = window.$3Dmol.createViewer(element)
        element.viewer = viewer
        molViewer.current = viewer
      }
      const viewer = molViewer.current
      viewer.removeAllModels()
      viewer.addModel(xyz, 'xyz')
      viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.1 } })
      viewer.zoomTo()
      viewer.render()
      viewer.spin(spin)
    }
  }, [xyz, spin, molViewerRef])

  useEffect(() => {
    if (molViewer.current) {
      molViewer.current.spin(spin)
    }
  }, [spin])
}

export function useAttentionViewer(
  xyz: string,
  attns: Record<string, number[]>,
  attnTask: string,
  ratio: number,
  percentile: number,
  max: number,
  attnViewerRef: MutableRefObject<HTMLDivElement | null>
) {
  const attnViewer = useRef<any>(null)
  const lastXyz = useRef<string>('')

  useEffect(() => {
    if (!xyz || !attnViewerRef.current || !window.$3Dmol || !window.nj) return

    const element = attnViewerRef.current
    if (!element.viewer) {
      const viewer = window.$3Dmol.createViewer(element)
      element.viewer = viewer
      attnViewer.current = viewer
    }
    const viewer = attnViewer.current

    if (lastXyz.current !== xyz) {
      viewer.removeAllModels()
      viewer.addModel(xyz, 'xyz')
      viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.1 } })
      viewer.zoomTo()
      viewer.render()
      lastXyz.current = xyz
    }

    const attn = attns[attnTask]
    if (!attn || viewer.models.length === 0) {
      return
    }

    viewer.setStyle({}, { stick: { radius: 0.15 }, sphere: { radius: 0.1 } })

    let nj_attn = window.nj.array(attn)
    const threshold = findPercentile(attn, percentile)
    const [mean, std] = [nj_attn.mean(), nj_attn.std()]

    const adjustedRatio = (ratio / 100) * 5 * 1.3 / (std / mean)
    const processedAttn = attn.map((val) => (val > threshold ? val : 0))
    nj_attn = window.nj.array(processedAttn)
    nj_attn = nj_attn.divide(mean)
    nj_attn = nj_attn.pow(adjustedRatio)

    const data = viewer.models[0].selectedAtoms({})
    const adjustedMax = (max / 100) * 5

    for (let i = 0; i < data.length; i++) {
      let a = nj_attn.get(i)
      if (a > adjustedMax) {
        a = adjustedMax
      }
      if (data[i].atom === 'H') continue
      data[i].style.sphere.radius = 0.5 * a
    }

    viewer.zoomTo()
    viewer.render()
  }, [xyz, attns, attnTask, ratio, percentile, max, attnViewerRef])
}
