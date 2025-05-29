import fs from 'fs'
import 'dotenv/config'
import { hospitals } from '../data/mapData'

const API_KEY = process.env.ORS_API_KEY
if (!API_KEY) throw new Error('ORS_API_KEY not set in environment')

const colorStops = [15, 30, 45, 60] // minutes
const ranges = colorStops.map((min) => min * 60) // seconds

async function fetchIsochronesAllHospitals() {
	const url = 'https://api.openrouteservice.org/v2/isochrones/driving-car'
	const locations = hospitals.map((h) => [h.position[1], h.position[0]]) // [lng, lat] for each
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
	const data = await res.json()
	fs.writeFileSync('hospitals_isochrones.geojson', JSON.stringify(data, null, 2))
}

fetchIsochronesAllHospitals()
