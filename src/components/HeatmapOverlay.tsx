import {useEffect, useRef, useState} from 'react'
import {scaleSequential} from 'd3-scale'
import {interpolateYlOrRd} from 'd3-scale-chromatic'
import {contours} from 'd3-contour'
import {useMap} from 'react-leaflet'
import {hospitals, oregonPolygon} from '../data/mapData'

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
	const toRad = (d: number) => (d * Math.PI) / 180
	const R = 6371 // km
	const dLat = toRad(lat2 - lat1)
	const dLng = toRad(lng2 - lng1)
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
	return 2 * R * Math.asin(Math.sqrt(a))
}

function colorStringToRgba(str: string, alpha: number) {
	const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
	if (!m) return [0, 0, 0, 0]
	return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), Math.round(alpha * 255)]
}

function pointInPolygon([lng, lat]: [number, number], polygon: number[][][]) {
	let inside = false
	for (const ring of polygon) {
		for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
			const xi = ring[i][0],
				yi = ring[i][1]
			const xj = ring[j][0],
				yj = ring[j][1]
			const intersect =
				yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi
			if (intersect) inside = !inside
		}
	}
	return inside
}

const RasterAndContoursOverlay = () => {
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
		const values: number[][] = []
		let min = Infinity,
			max = -Infinity
		for (let y = 0; y < height; y++) {
			values[y] = []
			for (let x = 0; x < width; x++) {
				const latlng = map.containerPointToLatLng([x, y])
				if (!pointInPolygon([latlng.lng, latlng.lat], oregonPolygon)) {
					values[y][x] = undefined
					continue
				}
				const d = Math.min(
					...hospitals.map((h) => haversine(latlng.lat, latlng.lng, h.position[0], h.position[1]))
				)
				values[y][x] = d
				if (d < min) min = d
				if (d > max) max = d
			}
		}
		const color = scaleSequential(interpolateYlOrRd).domain([min, max])
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')!
		canvas.width = width
		canvas.height = height
		const img = ctx.createImageData(width, height)
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const idx = (y * width + x) * 4
				if (values[y][x] === undefined) {
					img.data[idx + 3] = 0
					continue
				}
				const d = values[y][x]
				const c = colorStringToRgba(color(d), 0.95)
				img.data[idx] = c[0]
				img.data[idx + 1] = c[1]
				img.data[idx + 2] = c[2]
				img.data[idx + 3] = c[3]
			}
		}
		ctx.putImageData(img, 0, 0)

		// Optional: draw very subtle contour lines for accent
		const flat = values.flat()
		const contourGen = contours()
			.size([width, height])
			.thresholds([...Array(6)].map((_, i) => 10 * (i + 1)))
		const contourPaths = contourGen(flat)
		ctx.save()
		ctx.lineWidth = 1
		ctx.strokeStyle = 'rgba(0,0,0,0.15)'
		contourPaths.forEach((contour) => {
			ctx.beginPath()
			contour.coordinates.forEach((poly) => {
				poly.forEach((ring) => {
					ring.forEach(([x, y], i) => {
						if (i === 0) ctx.moveTo(x, y)
						else ctx.lineTo(x, y)
					})
				})
			})
			ctx.stroke()
		})
		ctx.restore()
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

export default RasterAndContoursOverlay
