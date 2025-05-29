import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { hospitals } from '../data/mapData'
import { HeatmapOverlay } from './HeatmapOverlay'

export const Map = () => {
	const icon = L.divIcon({
		className: '',
		html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:#1976d2;color:#fff;font-weight:bold;font-size:20px;box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid #fff;">H</div>`,
		iconAnchor: [16, 16]
	})

	return (
		<MapContainer center={[43.8041, -120.5542]} zoom={7} style={{ height: '800px', width: '100%' }}>
			<TileLayer
				attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
			/>
			<HeatmapOverlay />
			{hospitals.map((h) => (
				<Marker key={h.name} position={h.position} icon={icon} zIndexOffset={1000}>
					<Popup>{h.name}</Popup>
				</Marker>
			))}
		</MapContainer>
	)
}
