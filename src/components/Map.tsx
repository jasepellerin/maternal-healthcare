import MapLibre, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre'
import { setWorkerUrl } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { hospitals } from '../data/mapData'
import { HeatmapOverlay } from './HeatmapOverlay'
import { PopDensityOverlay } from './PopDensityOverlay'
import { HeatmapLegend } from './Legend'
import { useState } from 'react'

const markerSize = 20

setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href)

export const Map = () => {
	const [selectedIsochrones, setSelectedIsochrones] = useState<'all' | 'removed'>('all')
	const [popDensityLayer, setPopDensityLayer] = useState(false)
	const [selectedHospital, setSelectedHospital] = useState<(typeof hospitals)[number] | null>(null)

	return (
		<div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
			<MapLibre
				initialViewState={{ latitude: 43.8041, longitude: -120.5542, zoom: 7 }}
				style={{ height: '800px', width: '100%' }}
				mapStyle="https://data.lfmaps.fr/styles/positron"
				maxZoom={20}
				dragRotate={false}
				pitchWithRotate={false}
				touchPitch={false}
				onLoad={(event) => event.target.touchZoomRotate.disableRotation()}
			>
				<NavigationControl position="top-left" showCompass={false} />
				<HeatmapOverlay selectedIsochrones={selectedIsochrones} />
				{popDensityLayer && <PopDensityOverlay />}
				{hospitals
					.filter((h) => selectedIsochrones === 'all' || !h.willBeRemoved)
					.map((h) => {
						const [label, color] =
							h.type === 'hospital'
								? ['H', '#0D5257']
								: h.type === 'birthing center'
									? ['B', '#D73F09']
									: ['M', '#42033D']
						return (
							<Marker
								key={h.name}
								latitude={h.position[0]}
								longitude={h.position[1]}
								anchor="center"
								style={{ zIndex: 3 }}
							>
								<button
									aria-label={h.name}
									title={h.name}
									onClick={() => setSelectedHospital(h)}
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										width: markerSize,
										height: markerSize,
										padding: 0,
										borderRadius: '50%',
										background: color,
										color: '#fff',
										fontWeight: 'bold',
										fontSize: markerSize * 0.7,
										boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
										border: '2px solid #fff',
										cursor: 'pointer'
									}}
								>
									{label}
								</button>
							</Marker>
						)
					})}
				{selectedHospital &&
					(selectedIsochrones === 'all' || !selectedHospital.willBeRemoved) && (
						<Popup
							latitude={selectedHospital.position[0]}
							longitude={selectedHospital.position[1]}
							offset={markerSize / 2}
							closeOnClick={false}
							onClose={() => setSelectedHospital(null)}
							style={{ zIndex: 4 }}
						>
							{selectedHospital.name}
						</Popup>
					)}
				<HeatmapLegend popDensity={popDensityLayer} />
			</MapLibre>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					width: '50%',
					alignSelf: 'center'
				}}
			>
				<div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
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
				</div>
				<div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
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
		</div>
	)
}
