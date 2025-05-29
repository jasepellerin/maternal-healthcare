import { useEffect, useRef, useState } from 'react'
import { useMap } from 'react-leaflet'
import isochrone from '../data/hospitals_isochrone.json'
import L from 'leaflet'
import { oregonPolygon } from '../data/mapData'

const colorStops = [
	{ max: 15, color: [0, 100, 0, 242] },
	{ max: 30, color: [102, 205, 102, 242] },
	{ max: 45, color: [255, 255, 0, 242] },
	{ max: 60, color: [255, 165, 0, 242] },
	{ max: 75, color: [255, 0, 0, 242] }
]

export const HeatmapOverlay = () => {
	const map = useMap()
	const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))
	const [isochrones, setIsochrones] = useState<any>(null)

	useEffect(() => {
		setIsochrones(isochrone)
	}, [])

	console.log(isochrones)

	useEffect(() => {
		if (!isochrones) return
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
			canvas.style.opacity = '0.6'

			const ctx = canvas.getContext('2d')!
			ctx.clearRect(0, 0, width, height)
			// Draw Oregon polygon in red everywhere not covered by isochrone
			ctx.save()
			ctx.globalCompositeOperation = 'destination-over'
			ctx.beginPath()
			oregonPolygon.forEach((ring) => {
				ring.forEach(([lng, lat], i) => {
					const point = map.latLngToContainerPoint([lat, lng])
					if (i === 0) ctx.moveTo(point.x, point.y)
					else ctx.lineTo(point.x, point.y)
				})
				ctx.closePath()
			})
			ctx.fillStyle = 'rgba(255,0,0,0.5)'
			ctx.fill()
			ctx.restore()
			// Draw each isochrone polygon
			const sortedFeatures = [...isochrones.features].sort(
				(a, b) => b.properties.value - a.properties.value
			)
			for (const feature of sortedFeatures) {
				const value = feature.properties?.value
				console.log('Feature value (seconds):', value)
				let color = [255, 0, 0, 242]
				for (const stop of colorStops) {
					if (value <= stop.max * 60) {
						// value is in seconds
						color = stop.color
						break
					}
				}
				ctx.beginPath()
				const coords = feature.geometry.coordinates
				// Handle MultiPolygon or Polygon
				const polys = feature.geometry.type === 'MultiPolygon' ? coords : [coords]
				for (const poly of polys) {
					for (const ring of poly) {
						ring.forEach(([lng, lat], i) => {
							const point = map.latLngToContainerPoint([lat, lng])
							if (i === 0) ctx.moveTo(point.x, point.y)
							else ctx.lineTo(point.x, point.y)
						})
						ctx.closePath()
					}
				}
				ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`
				ctx.fill()
			}
		}

		draw()
		map.on('moveend zoomend resize', draw)
		return () => {
			map.off('moveend zoomend resize', draw)
			if (canvas.parentNode === overlayPane) {
				overlayPane.removeChild(canvas)
			}
		}
	}, [map, isochrones])

	const HeatmapLegend = () => (
		<div
			style={{
				position: 'absolute',
				bottom: 20,
				left: 20,
				background: 'rgba(255,255,255,0.9)',
				padding: 8,
				borderRadius: 4,
				zIndex: 1000,
				boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 4 }}>Travel Time (min)</div>
			{colorStops.map((stop, i) => (
				<div key={stop.max} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
					<div
						style={{
							width: 24,
							height: 12,
							background: `rgba(${stop.color[0]},${stop.color[1]},${stop.color[2]},${stop.color[3] / 255})`,
							marginRight: 8,
							border: '1px solid #aaa'
						}}
					/>
					<span>
						{i === 0 ? 0 : colorStops[i - 1].max}–{stop.max} min
					</span>
				</div>
			))}
		</div>
	)

	return (
		<>
			<HeatmapLegend />
		</>
	)
}
