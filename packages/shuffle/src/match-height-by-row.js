export default function matchHeightByRow(elements) {
	const rows = [];
	let currentRow = [];
	let lastLeft = 0;

	for (const element of elements) {
		const left = Math.round(element.getBoundingClientRect().left);

		element.style.height = '';

		if (left <= lastLeft) {
			rows.push(currentRow);
			currentRow = [];
		}

		currentRow.push(element);
		lastLeft = left;
	}

	if (currentRow.length > 0) {
		rows.push(currentRow);
	}

	for (const row of rows) {
		const heights = [];

		if (row.length > 1) {
			for (const element of row) {
				heights.push(element.clientHeight);
			}

			const tallest = Math.max(...heights);

			for (const element of row) {
				element.style.height = tallest + 'px';
			}
		}
	}
}