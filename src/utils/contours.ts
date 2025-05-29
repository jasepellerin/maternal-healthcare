import { contours } from 'd3-contour'

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

export function computeDistanceGrid({ width, height, map, polygon, hospitalList }) {
	let min = Infinity,
		max = -Infinity
	const grid: (number | undefined)[][] = Array.from({ length: height }, () => Array(width))

	const bounds = map.getPixelBounds()
	const zoom = map.getZoom()

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			// Convert canvas pixel to global pixel coordinates
			const globalX = bounds.min.x + x
			const globalY = bounds.min.y + y
			const latlng = map.unproject([globalX, globalY], zoom)
			if (!pointInPolygon([latlng.lng, latlng.lat], polygon)) {
				grid[y][x] = undefined
				continue
			}
			const d = Math.min(
				...hospitalList.map((h) => haversine(latlng.lat, latlng.lng, h.position[0], h.position[1]))
			)
			grid[y][x] = d
			if (d < min) min = d
			if (d > max) max = d
		}
	}
	return { grid, min, max }
}

export function makeImageData({ grid, width, height, colorFn }) {
	const img = new ImageData(width, height)
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const idx = (y * width + x) * 4
			const v = grid[y][x]
			if (v === undefined) {
				img.data[idx + 3] = 0
				continue
			}
			const c = colorFn(v)
			img.data[idx] = c[0]
			img.data[idx + 1] = c[1]
			img.data[idx + 2] = c[2]
			img.data[idx + 3] = c[3]
		}
	}
	return img
}
