import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { hospitals, oregonPolygon } from '../data/mapData'
import { computeDistanceGrid, makeImageData } from 'src/utils/contours'
import L from 'leaflet'

export const HeatmapOverlay = () => {
	const map = useMap()
	const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))

	useEffect(() => {
		const canvas = canvasRef.current
		const overlayPane = map.getPane('overlayPane')
		if (!overlayPane) return

		if (!overlayPane.contains(canvas)) {
			overlayPane.appendChild(canvas)
		}

		const draw = () => {
			const container = map.getContainer()
			const width = container.clientWidth
			const height = container.clientHeight
			canvas.width = width
			canvas.height = height
			const topLeft = map.containerPointToLayerPoint([0, 0])
			L.DomUtil.setPosition(canvas, topLeft)
			canvas.style.pointerEvents = 'none'
			canvas.style.zIndex = '400'

			const { grid } = computeDistanceGrid({
				width,
				height,
				map,
				polygon: oregonPolygon,
				hospitalList: hospitals
			})
			const colorStops = [
				{ max: 15, color: [0, 100, 0, 242] },
				{ max: 30, color: [102, 205, 102, 242] },
				{ max: 45, color: [255, 255, 0, 242] },
				{ max: 60, color: [255, 165, 0, 242] },
				{ max: 75, color: [255, 0, 0, 242] }
			]
			const ctx = canvas.getContext('2d')!
			const img = makeImageData({
				grid,
				width,
				height,
				colorFn: (d) => {
					for (const stop of colorStops) {
						if (d <= stop.max) return stop.color
					}
					return [255, 0, 0, 242]
				}
			})
			ctx.putImageData(img, 0, 0)
		}

		draw()
		map.on('moveend zoomend resize', draw)
		return () => {
			map.off('moveend zoomend resize', draw)
			if (canvas.parentNode === overlayPane) {
				overlayPane.removeChild(canvas)
			}
		}
	}, [map])

	return null
}
