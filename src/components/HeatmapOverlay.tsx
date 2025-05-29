import {useEffect, useRef, useState} from 'react'
import {useMap} from 'react-leaflet'
import {hospitals, oregonPolygon} from '../data/mapData'
import {computeDistanceGrid, makeImageData, drawContours} from 'src/utils/contours'

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

		const {grid} = computeDistanceGrid({
			width,
			height,
			map,
			polygon: oregonPolygon,
			hospitalList: hospitals
		})
		const colorStops = [
			{max: 15, color: [0, 100, 0, 242]}, // dark green
			{max: 30, color: [102, 205, 102, 242]}, // light green
			{max: 45, color: [255, 255, 0, 242]}, // yellow
			{max: 60, color: [255, 165, 0, 242]}, // orange
			{max: 75, color: [255, 0, 0, 242]} // red
		]
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
				for (const stop of colorStops) {
					if (d <= stop.max) return stop.color
				}
				return [255, 0, 0, 242] // red for >75
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
