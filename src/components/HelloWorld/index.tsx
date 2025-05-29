import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {HeatmapLayer} from 'react-leaflet-heatmap-layer-v3'
import L from 'leaflet'

const hospitals = [
	{name: 'OHSU Hospital', position: [45.4995, -122.6865] as [number, number]},
	{name: 'Salem Hospital', position: [44.9308, -123.0176] as [number, number]},
	{name: 'Sacred Heart Medical Center', position: [44.0455, -123.0951] as [number, number]},
	{name: 'Providence St. Vincent', position: [45.5102, -122.7796] as [number, number]},
	{name: 'Asante Rogue Regional', position: [42.3135, -122.849] as [number, number]}
]

const heatmapPoints = []
for (let lat = 42; lat <= 46; lat += 0.1) {
	for (let lng = -124; lng <= -116; lng += 0.1) {
		// Find min distance to any hospital
		const minDist = Math.min(
			...hospitals.map((h) => Math.sqrt((lat - h.position[0]) ** 2 + (lng - h.position[1]) ** 2))
		)
		// Invert distance for intensity (closer = higher)
		const intensity = Math.max(0, 1 - minDist / 2)
		if (intensity > 0.1) heatmapPoints.push([lat, lng, intensity])
	}
}

export const HelloWorld = () => {
	const icon = L.icon({
		iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34]
	})

	return (
		<MapContainer center={[43.8041, -120.5542]} zoom={7} style={{height: '800px', width: '100%'}}>
			<TileLayer
				attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{hospitals.map((h) => (
				<Marker key={h.name} position={h.position} icon={icon}>
					<Popup>{h.name}</Popup>
				</Marker>
			))}
			<HeatmapLayer
				points={heatmapPoints}
				longitudeExtractor={(m) => m[1]}
				latitudeExtractor={(m) => m[0]}
				intensityExtractor={(m) => m[2]}
				radius={30}
				blur={20}
				max={1}
			/>
		</MapContainer>
	)
}
