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

export const HeatmapLegend = () => (
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
		<div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Travel times (in minutes)</div>
		{colorStops.map((stop, i) => (
			<div key={stop.max} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
				<div
					style={{
						width: 22,
						height: 22,
						background: `rgba(${stop.color[0]},${stop.color[1]},${stop.color[2]},${stop.color[3] / 255})`,
						marginRight: 12,
						border: '1.5px solid #aaa',
						borderRadius: 4
					}}
				/>
				<span style={{ fontSize: 15, minWidth: 90 }}>
					{i === 0 ? 0 : colorStops[i - 1].max}–{stop.max} min
				</span>
			</div>
		))}
		<hr style={{ margin: '12px 0 10px 0', border: 0, borderTop: '1px solid #ccc' }} />

		<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
			<IconSection label="Hospital" color="#1976d2" iconLabel="H" />
			<IconSection label="Birth Center" color="#00bcd4" iconLabel="B" />
			<IconSection label="Home-Access Midwife" color="#43a047" iconLabel="M" />
		</div>
	</div>
)
