import fs from 'fs'
import 'dotenv/config'
import { hospitals } from '../data/mapData'
import union from '@turf/union'
import { featureCollection } from '@turf/helpers'

const API_KEY = process.env.ORS_API_KEY
if (!API_KEY) throw new Error('ORS_API_KEY not set in environment')

const colorStops = [15, 30, 45, 60] // minutes
const ranges = colorStops.map((min) => min * 60) // seconds
const BATCH_SIZE = 5

function chunk<T>(arr: T[], size: number): T[][] {
	const out = []
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
	return out
}

async function fetchIsochronesBatch(locations: [number, number][]) {
	const url = 'https://api.openrouteservice.org/v2/isochrones/driving-car'
	const body = {
		locations,
		range: ranges,
		units: 'm',
		attributes: ['total_pop']
	}
	const res = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: API_KEY,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	})
	if (!res.ok) throw new Error(await res.text())
	return await res.json()
}

async function fetchIsochronesAllHospitals(excludeRemovedLocations = false) {
	const allFeatures: any[] = []
	const locationChunks = chunk(
		hospitals
			.filter((h) => !excludeRemovedLocations || !h.willBeRemoved)
			.map((h) => [h.position[1], h.position[0]]),
		BATCH_SIZE
	) as [number, number][][]
	for (let i = 0; i < locationChunks.length; i++) {
		console.log(`Fetching batch ${i + 1} of ${locationChunks.length}`)
		try {
			const data = await fetchIsochronesBatch(locationChunks[i])
			if (data.features) allFeatures.push(...data.features)
		} catch (e) {
			console.error('Batch error:', e)
		}
	}
	fs.writeFileSync(
		'hospitals_isochrones_all_batches.json',
		JSON.stringify(featureCollection(allFeatures), null, 2)
	)
}

const mergeIsochrones = () => {
	const allFeatures = (
		JSON.parse(
			fs.readFileSync('hospitals_isochrones_all_batches.json', 'utf8')
		) as GeoJSON.FeatureCollection<
			GeoJSON.Polygon | GeoJSON.MultiPolygon,
			GeoJSON.GeoJsonProperties
		>
	).features

	const mergedFeatures = []
	for (const band of colorStops) {
		const bandFeatures = allFeatures.filter((f) => f.properties.value === band * 60)
		if (bandFeatures.length === 0) continue
		let merged = bandFeatures[0]
		for (let i = 1; i < bandFeatures.length; i++) {
			console.log('Merging feature', i, 'of', bandFeatures.length, 'for band', band)
			try {
				merged = union(featureCollection([merged, bandFeatures[i]]))
			} catch (e) {
				console.warn('Union error, skipping a feature:', e)
			}
		}
		if (merged) {
			merged.properties = { value: band * 60 }
			const geom = merged.geometry as any
			if (geom && geom.type === 'GeometryCollection' && Array.isArray(geom.geometries)) {
				const polygons = geom.geometries.filter(
					(g: any) => g.type === 'Polygon' || g.type === 'MultiPolygon'
				)
				merged.geometry = {
					type: 'MultiPolygon',
					coordinates: polygons.flatMap((g: any) =>
						g.type === 'Polygon' ? [g.coordinates] : g.coordinates
					)
				}
			}
			mergedFeatures.push(merged)
		}
	}
	fs.writeFileSync(
		'hospitals_isochrones_merged.json',
		JSON.stringify(featureCollection(mergedFeatures), null, 2)
	)
	console.log('Merged isochrones written to hospitals_isochrones_merged.geojson')
}

const main = async () => {
	await fetchIsochronesAllHospitals(false)
	await mergeIsochrones()
}

main()
