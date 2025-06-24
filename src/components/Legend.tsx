import { useEffect, useState } from 'react'

const colorStops = [
	{ max: 15, color: [0, 100, 0, 242] },
	{ max: 30, color: [102, 205, 102, 242] },
	{ max: 45, color: [255, 255, 0, 242] },
	{ max: 60, color: [255, 165, 0, 242] },
	{ max: 75, color: [255, 0, 0, 242] }
]

const iconSize = 22

const Icon = ({ color, label }: { color: string; label: string }) => (
	<div
		style={{
			width: iconSize,
			height: iconSize,
			borderRadius: '50%',
			background: color,
			color: '#fff',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontWeight: 700,
			fontSize: iconSize * 0.7,
			border: '2px solid #fff',
			boxShadow: '0 1px 4px rgba(0,0,0,0.18)'
		}}
	>
		{label}
	</div>
)

const IconSection = ({
	label,
	color,
	iconLabel
}: {
	label: string
	color: string
	iconLabel: string
}) => (
	<div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
		<Icon color={color} label={iconLabel} />
		<span style={{ fontSize: iconSize * 0.7 }}>{label}</span>
	</div>
)

export const HeatmapLegend = ({ popDensity }: { popDensity: boolean }) => {
	const [swatchBackground, setSwatchBackground] = useState('')
	const overlayGradient = `linear-gradient(90deg, 
		rgba(255, 255, 255, 0) 0%, 
		rgba(255, 255, 255, 0) 10%, 
		rgba(255, 255, 255, 0.5) 10%, 
		rgba(255, 255, 255, 0.5) 20%, 
		rgba(214, 214, 214, 0.5) 20%, 
		rgba(214, 214, 214, 0.5) 30%, 
		rgba(189, 189, 189, 0.5) 30%, 
		rgba(189, 189, 189, 0.5) 40%, 
		rgba(143, 143, 143, 0.5) 40%, 
		rgba(143, 143, 143, 0.5) 50%, 
		rgba(115, 115, 115, 0.5) 50%, 
		rgba(115, 115, 115, 0.5) 60%, 
		rgba(82, 82, 82, 0.5) 60%, 
		rgba(82, 82, 82, 0.5) 70%, 
		rgba(37, 37, 37, 0.5) 70%, 
		rgba(37, 37, 37, 0.5) 80%, 
		rgba(10, 10, 10, 0.5) 80%,
		rgba(10, 10, 10, 0.5) 90%,
		rgba(0, 0, 0, 0.5) 90%), `
	useEffect(() => {
		if (popDensity) {
			setSwatchBackground(overlayGradient)
		} else {
			setSwatchBackground('')
		}
	}, [overlayGradient, popDensity])

	return (
		<div
			style={{
				position: 'absolute',
				top: 20,
				right: 20,
				background: 'white',
				padding: 18,
				borderRadius: 12,
				zIndex: 1000,
				boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
				border: '1px solid #ddd',
				width: 280,
				boxSizing: 'border-box'
			}}
		>
			<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>
				Travel times (in minutes)
			</div>
			{colorStops.map((stop, i) => (
				<div key={stop.max} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
					<div
						style={{
							width: popDensity ? 200 : 22,
							height: 22,
							background: `${swatchBackground}rgba(${stop.color[0]},${stop.color[1]},${stop.color[2]}, .6)`,
							marginRight: 12,
							border: '1.5px solid #aaa',
							borderRadius: 4,
							backgroundBlendMode: popDensity ? 'saturation' : 'normal'
						}}
					/>
					<span style={{ fontSize: 15, minWidth: 90 }}>
						{i === 0 ? 0 : colorStops[i - 1].max}–{stop.max} min
					</span>
				</div>
			))}
			{popDensity && (
				<div
					style={{
						display: 'flex',
						flexDirection: 'row',
						width: 140,
						justifyContent: 'space-between'
					}}
				>
					<span>&larr;</span>
					<span>Population Density</span>
					<span>&rarr;</span>
				</div>
			)}
			<hr style={{ margin: '12px 0 10px 0', border: 0, borderTop: '1px solid #ccc' }} />

			<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
				<IconSection label="Hospital" color="#0D5257" iconLabel="H" />
				<IconSection label="Birth Center" color="#d73f09" iconLabel="B" />
				<IconSection label="Home-Access Midwife" color="#42033D" iconLabel="M" />
			</div>
		</div>
	)
}
