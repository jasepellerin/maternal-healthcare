import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import censustracts from '../data/CensusTracts_Oregon_2020.json'
import { scaleThreshold } from 'd3-scale'
import { jenks } from 'simple-statistics'

export const PopDensityOverlay = () => {
	const map = useMap()
	const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))

	// They have a coordinates property, let's type it
	const censusTracts = censustracts as GeoJSON.FeatureCollection<
		GeoJSON.Polygon | GeoJSON.MultiPolygon,
		GeoJSON.GeoJsonProperties
	>

	useEffect(() => {
		if (!censusTracts) return
		const domain = jenks(
			censusTracts.features.map((d) => d.properties.POPDENS20),
			8
		)
		const colorScale = scaleThreshold(domain, [
			'#ffffff',
			'#d6d6d6',
			'#bdbdbd',
			'#8f8f8f',
			'#737373',
			'#525252',
			'#252525',
			'#0a0a0a',
			'#000000'
		])
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
			canvas.style.zIndex = '401'
			canvas.style.opacity = '0.5'

			const ctx = canvas.getContext('2d')!
			ctx.clearRect(0, 0, width, height)
			// Draw Oregon polygon in red everywhere not covered by isochrone
			ctx.save()

			// Draw each census tract polygon
			for (const feature of censusTracts.features) {
				const value = feature.properties?.POPDENS20
				ctx.beginPath()
				const coords = feature.geometry.coordinates
				// Handle MultiPolygon or Polygon
				const polys = feature.geometry.type === 'MultiPolygon' ? coords : [coords]
				for (const poly of polys) {
					for (const ring of poly) {
						const ringArray = ring as GeoJSON.Position[]
						ringArray.forEach(([lng, lat], i) => {
							const point = map.latLngToContainerPoint([lat, lng])
							if (i === 0) ctx.moveTo(point.x, point.y)
							else ctx.lineTo(point.x, point.y)
						})
						ctx.closePath()
					}
				}
				ctx.globalCompositeOperation = 'saturation'
				ctx.fillStyle = value > 1 ? colorScale(value) : 'transparent'
				ctx.fill()
				ctx.strokeStyle = '#fff'
				ctx.stroke()
			}
			ctx.restore()
		}

		draw()
		map.on('moveend zoomend resize', draw)

		// --- Add smooth transition for overlay on zoom ---
		const handleZoomAnim = () => {
			canvas.style.transition = 'opacity 0.3s'
			canvas.style.opacity = '0.1'
		}
		const handleZoomEnd = () => {
			canvas.style.transition = 'opacity 0.3s'
			canvas.style.opacity = '0.6'
		}
		map.on('zoomanim', handleZoomAnim)
		map.on('zoomend', handleZoomEnd)
		// --- End smooth transition ---

		return () => {
			map.off('moveend zoomend resize', draw)
			map.off('zoomanim', handleZoomAnim)
			map.off('zoomend', handleZoomEnd)
			if (canvas.parentNode === overlayPane) {
				overlayPane.removeChild(canvas)
			}
		}
	}, [map, censusTracts])

	return <></>
}
