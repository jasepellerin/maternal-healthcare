import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { hospitals } from '../data/mapData'
import { HeatmapOverlay } from './HeatmapOverlay'

export const Map = () => {
	const icon = L.icon({
		iconUrl: 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images/marker-icon.png',
		iconSize: [25, 41],
		iconAnchor: [12, 41],
		popupAnchor: [1, -34]
	})

	return (
		<MapContainer center={[43.8041, -120.5542]} zoom={7} style={{ height: '800px', width: '100%' }}>
			<TileLayer
				attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			{hospitals.map((h) => (
				<Marker key={h.name} position={h.position} icon={icon}>
					<Popup>{h.name}</Popup>
				</Marker>
			))}
			<HeatmapOverlay />
		</MapContainer>
	)
}
