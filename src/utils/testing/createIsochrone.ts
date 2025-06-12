import { featureCollection, point } from '@turf/helpers'
import concave from '@turf/concave'
import { Feature, Polygon } from 'geojson'
import fs from 'fs'
import { hospitals } from 'src/data/mapData'

export function createIsochrone(
	latLngs: [number, number][],
	maxEdge?: number
): Feature<Polygon> | null {
	const points = featureCollection(latLngs.map(([lat, lng]) => point([lng, lat])))
	// maxEdge is in kilometers
	const isochrone = concave(points, { maxEdge }) as Feature<Polygon> | null
	fs.writeFileSync('isochrone.json', JSON.stringify(isochrone, null, 2))
	return isochrone
}

createIsochrone(hospitals.map((hospital) => [hospital.position[0], hospital.position[1]]))
