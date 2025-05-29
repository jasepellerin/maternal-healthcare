import { useEffect, useRef, useState } from 'react'
import { scaleSequential } from 'd3-scale'
import { interpolateYlOrRd } from 'd3-scale-chromatic'
import { useMap } from 'react-leaflet'
import { hospitals, oregonPolygon } from '../data/mapData'
import { computeDistanceGrid, makeImageData, drawContours } from 'src/utils/contours'

export const HeatmapOverlay = () => {
	const map = useMap()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [updateKey, setUpdateKey] = useState(0)

	useEffect(() => {
		const onMove = () => setUpdateKey((k) => k + 1)
		map.on('moveend', onMove)
		map.on('zoomend', onMove)
		return () => {
			map.off('moveend', onMove)
			map.off('zoomend', onMove)
		}
	}, [map])

	useEffect(() => {
		const container = map.getContainer()
		const width = container.clientWidth
		const height = container.clientHeight

		const { grid, min, max } = computeDistanceGrid({
			width,
			height,
			map,
			polygon: oregonPolygon,
			hospitalList: hospitals
		})
		const color = scaleSequential(interpolateYlOrRd).domain([min, max])
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')!
		canvas.width = width
		canvas.height = height
		const img = makeImageData({
			grid,
			width,
			height,
			colorFn: (d) => {
				const rgba = color(color.domain()[0])
				const m = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
				if (!m) return [0, 0, 0, 0]
				const c = color(d)
				const m2 = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
				return [parseInt(m2[1]), parseInt(m2[2]), parseInt(m2[3]), Math.round(0.95 * 255)]
			}
		})
		ctx.putImageData(img, 0, 0)
		drawContours(ctx, grid, width, height)
	}, [map, updateKey])

	return (
		<canvas
			ref={canvasRef}
			style={{
				pointerEvents: 'none',
				zIndex: 400,
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			}}
		/>
	)
}
