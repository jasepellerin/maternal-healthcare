import fs from 'fs'
import { hospitals } from '../../data/mapData'
import { oregonPolygon } from '../../data/mapData'
import { featureCollection, polygon } from '@turf/helpers'
import { isoLines } from 'marchingsquares'
import { haversine } from './contours'

// Grid settings
const GRID_STEP = 0.02 // degrees, finer grid
const DISTANCE_BANDS = [15, 30, 45, 60, 75] // km

// Compute grid bounds
// oregonPolygon is [lng, lat]
const lats = oregonPolygon.map((p) => p[1])
const lngs = oregonPolygon.map((p) => p[0])
const minLat = Math.min(...lats)
const maxLat = Math.max(...lats)
const minLng = Math.min(...lngs)
const maxLng = Math.max(...lngs)

// Point-in-polygon for a single ring (GeoJSON order: [lng, lat])
function pointInPolygon(lng: number, lat: number, ring: number[][]) {
	let inside = false
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = ring[i][0],
			yi = ring[i][1]
		const xj = ring[j][0],
			yj = ring[j][1]
		const intersect =
			yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi
		if (intersect) inside = !inside
	}
	return inside
}

// Rasterize grid: grid[y][x] where y is lat, x is lng
const grid: number[][] = []
let validPoints = 0
for (let lat = minLat; lat <= maxLat; lat += GRID_STEP) {
	const row: number[] = []
	for (let lng = minLng; lng <= maxLng; lng += GRID_STEP) {
		if (!pointInPolygon(lng, lat, oregonPolygon)) {
			row.push(-9999)
			continue
		}
		// hospitals.position is [lat, lng]
		const d = Math.min(...hospitals.map((h) => haversine(lat, lng, h.position[0], h.position[1])))
		row.push(d)
		validPoints++
	}
	grid.push(row)
}
console.log(`Grid size: ${grid.length} x ${grid[0].length}, valid points: ${validPoints}`)

// Print grid value stats
const allVals = grid.flat().filter((v) => v > -1000)
const minVal = Math.min(...allVals)
const maxVal = Math.max(...allVals)
const meanVal = allVals.reduce((a, b) => a + b, 0) / allVals.length
console.log(`Grid value stats: min=${minVal}, max=${maxVal}, mean=${meanVal}`)

// Print histogram
const hist = Array(16).fill(0)
for (const v of allVals) {
	const idx = Math.min(15, Math.floor(v / 5))
	hist[idx]++
}
console.log('Histogram (per 5km):', hist)

// Print a few rows of the grid mask
for (let y = 0; y < Math.min(10, grid.length); y++) {
	console.log(grid[y].map((v) => (v > -1000 ? '#' : '.')).join(''))
}

// For each band, extract polygons
const features = []
for (const band of DISTANCE_BANDS) {
	const bandPoints = grid.flat().filter((v) => v >= band && v < band + 15 && v > -1000).length
	if (bandPoints < 10) {
		console.warn(`Skipping band ${band}: too few valid points (${bandPoints})`)
		continue
	}
	let contours: number[][][] = []
	try {
		contours = isoLines(grid, [band], { noFrame: true })[0]
	} catch (e) {
		console.warn(`Skipping band ${band}:`, e)
		continue
	}
	for (const contour of contours) {
		// contour is [[x, y], ...] where x is lng index, y is lat index
		const coords = contour.map(([x, y]: [number, number]) => {
			const lng = minLng + x * GRID_STEP // GeoJSON: [lng, lat]
			const lat = minLat + y * GRID_STEP
			return [lng, lat]
		})
		if (coords.length < 4) continue
		const unique = new Set(coords.map(([lng, lat]) => `${lng.toFixed(6)},${lat.toFixed(6)}`))
		if (unique.size < coords.length / 2) continue
		features.push(
			polygon([coords], {
				value: band
			})
		)
	}

	// For each band, print band stats
	const bandVals = grid.flat().filter((v) => v >= band && v < band + 15 && v > -1000)
	if (bandVals.length > 0) {
		const minB = Math.min(...bandVals)
		const maxB = Math.max(...bandVals)
		console.log(`Band ${band}: count=${bandVals.length}, min=${minB}, max=${maxB}`)
	} else {
		console.log(`Band ${band}: count=0`)
	}
}

const fc = featureCollection(features)
fs.writeFileSync('local_hospitals_isochrone.geojson', JSON.stringify(fc, null, 2))
