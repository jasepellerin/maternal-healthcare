import { MapLocation } from 'src/data/mapData'
import fs from 'fs'
import rawData from '../../data/old/facilities_w_props.json'

export const getMapLocations = (
	data: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
): MapLocation[] => {
	return data.features.map((feature) => {
		return {
			name: feature.properties.name,
			type: feature.properties.type,
			position: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
		}
	})
}

export const writeHospitalData = (
	data: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
): MapLocation[] => {
	return data.features.map((feature) => {
		return {
			name: feature.properties.name,
			type: feature.properties.type,
			position: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]]
		}
	})
}

export const hospitals: MapLocation[] = getMapLocations(
	rawData as GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>
)

fs.writeFileSync('hospitals.json', JSON.stringify(hospitals, null, 2))
