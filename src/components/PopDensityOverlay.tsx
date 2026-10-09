import { useEffect, useRef } from 'react'
import { useMap } from 'react-map-gl/maplibre'
import censustracts from '../data/CensusTracts_Oregon_2020.json'
import { scaleThreshold } from 'd3-scale'
import { jenks } from 'simple-statistics'

export const PopDensityOverlay = () => {
	const { current: mapRef } = useMap()
	const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'))

	// They have a coordinates property, let's type it
	const censusTracts = censustracts as GeoJSON.FeatureCollection<
		GeoJSON.Polygon | GeoJSON.MultiPolygon,
		GeoJSON.GeoJsonProperties
	>

	useEffect(() => {
		if (!censusTracts || !mapRef) return
		const map = mapRef.getMap()
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
		const overlayPane = map.getCanvasContainer()
		if (!overlayPane.contains(canvas)) {
			overlayPane.appendChild(canvas)
		}
		canvas.style.position = 'absolute'
		canvas.style.top = '0'
		canvas.style.left = '0'
		canvas.style.pointerEvents = 'none'
		canvas.style.zIndex = '2'
		canvas.style.opacity = '0.5'

		const draw = () => {
			canvas.style.visibility = 'visible'
			const container = map.getContainer()
			const width = container.clientWidth
			const height = container.clientHeight
			canvas.width = width
			canvas.height = height
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
							const point = map.project([lng, lat])
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
		// Hide the overlay while moving rather than reprojecting the full dataset every frame.
		const hide = () => {
			canvas.style.visibility = 'hidden'
		}
		map.on('movestart', hide)
		map.on('moveend', draw)
		map.on('resize', draw)

		return () => {
			map.off('movestart', hide)
			map.off('moveend', draw)
			map.off('resize', draw)
			if (canvas.parentNode === overlayPane) {
				overlayPane.removeChild(canvas)
			}
		}
	}, [mapRef, censusTracts])

	return <></>
}
