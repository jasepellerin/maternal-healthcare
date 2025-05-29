import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { hospitals, oregonPolygon } from '../data/mapData'
import { computeDistanceGrid, makeImageData } from 'src/utils/contours'

export const HeatmapOverlay = () => {
	const map = useMap()

	useEffect(() => {
		const canvas = L.DomUtil.create('canvas') as HTMLCanvasElement
		const draw = () => {
			const container = map.getContainer()
			const width = container.clientWidth
			const height = container.clientHeight
			canvas.width = width
			canvas.height = height
			canvas.style.pointerEvents = 'none'

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

		const CustomLayer = L.Layer.extend({
			onAdd() {
				const pane = map.getPane('overlayPane')
				pane.appendChild(canvas)
				draw()
				map.on('moveend zoomend resize', draw)
			},
			onRemove() {
				if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
				map.off('moveend zoomend resize', draw)
			}
		})

		const layer = new CustomLayer()
		layer.addTo(map)

		return () => {
			layer.remove()
		}
	}, [map])

	return null
}
