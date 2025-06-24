import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { hospitals } from '../data/mapData'
import { HeatmapOverlay } from './HeatmapOverlay'
import { PopDensityOverlay } from './PopDensityOverlay'
import { HeatmapLegend } from './Legend'
import { useState } from 'react'

const markerSize = 20

export const Map = () => {
	const [selectedIsochrones, setSelectedIsochrones] = useState<'all' | 'removed'>('all')
	const [popDensityLayer, setPopDensityLayer] = useState(false)
	const hospitalIcon = L.divIcon({
		className: '',
		html: `<div style="display:flex;align-items:center;justify-content:center;width:${markerSize}px;height:${markerSize}px;border-radius:50%;background:#0D5257;color:#fff;font-weight:bold;font-size:${markerSize * 0.7}px;box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid #fff;">H</div>`,
		iconAnchor: [markerSize / 2, markerSize / 2]
	})

	const birthCenterIcon = L.divIcon({
		className: '',
		html: `<div style="display:flex;align-items:center;justify-content:center;width:${markerSize}px;height:${markerSize}px;border-radius:50%;background:#D73F09;color:#fff;font-weight:bold;font-size:${markerSize * 0.7}px;box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid #fff;">B</div>`,
		iconAnchor: [markerSize / 2, markerSize / 2]
	})

	const homeAccessMidwifeIcon = L.divIcon({
		className: '',
		html: `<div style="display:flex;align-items:center;justify-content:center;width:${markerSize}px;height:${markerSize}px;border-radius:50%;background:#42033D;color:#fff;font-weight:bold;font-size:${markerSize * 0.7}px;box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid #fff;">M</div>`,
		iconAnchor: [markerSize / 2, markerSize / 2]
	})

	return (
		<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
			<MapContainer
				center={[43.8041, -120.5542]}
				zoom={7}
				style={{ height: '800px', width: '100%' }}
			>
				<TileLayer
					url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
					attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
					maxZoom={20}
				/>
				<HeatmapOverlay selectedIsochrones={selectedIsochrones} />
				{popDensityLayer && <PopDensityOverlay />}
				{hospitals
					.filter((h) => selectedIsochrones === 'all' || !h.willBeRemoved)
					.map((h) => {
						const icon =
							h.type === 'hospital'
								? hospitalIcon
								: h.type === 'birthing center'
									? birthCenterIcon
									: homeAccessMidwifeIcon
						return (
							<Marker key={h.name} alt={h.name} title={h.name} position={h.position} icon={icon} zIndexOffset={1000}>
								<Popup>{h.name}</Popup>
							</Marker>
						)
					})}
				<HeatmapLegend popDensity={popDensityLayer} />
			</MapContainer>
			<div style={{ display: 'flex', justifyContent: 'center' }}>
				<button
					onClick={() =>
						setSelectedIsochrones((current) => (current === 'all' ? 'removed' : 'all'))
					}
					style={{
						background: 'rgba(219, 219, 219, 0.97)',
						border: 'none',
						padding: 12,
						borderRadius: 4,
						boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
						cursor: 'pointer',
						fontSize: 14,
						fontWeight: 800,
						color: '#333'
					}}
				>
					{selectedIsochrones === 'all' ? 'Show without at-risk locations' : 'Show all locations'}
				</button>
				<button
					onClick={() => setPopDensityLayer((current) => !current)}
					style={{
						background: 'rgba(219, 219, 219, 0.97)',
						border: 'none',
						padding: 12,
						borderRadius: 4,
						boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
						cursor: 'pointer',
						fontSize: 14,
						fontWeight: 800,
						color: '#333'
					}}
				>
					{popDensityLayer ? 'Hide Population Density Layer' : 'Show Population Density Layer'}
				</button>
			</div>
		</div>
	)
}
