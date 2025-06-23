import hospitals from 'src/data/hospitals.json'

hospitals.forEach((item) => {
	if (!item.position || item.position.length !== 2) {
		console.log(item.name)
	}
})
