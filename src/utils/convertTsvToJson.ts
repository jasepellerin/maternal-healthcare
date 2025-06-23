import fs from 'fs'

const rawData = fs.readFileSync('src/data/newHospitalsRaw.tsv', 'utf8')

// Used to convert the tsv output from our spreadsheet to a json file we can use for isochrone generation
const convertTsvToJson = (tsv: string) => {
	const lines = tsv.split('\r\n')
	const headers = lines[0].split('\t')
	const data = lines.slice(1).map((line) => {
		const values = line.split('\t')
		return headers.reduce(
			(acc, header, index) => {
				acc[header] = values[index]
				return acc
			},
			{} as Record<string, unknown>
		)
	})

	data.map((item) => {
		item.position = [parseFloat(item.latitude as string), parseFloat(item.longitude as string)]
		delete item.latitude
		delete item.longitude
	})
	return data
}

const json = convertTsvToJson(rawData)
fs.writeFileSync('src/data/newHospitals.json', JSON.stringify(json, null, 2))
