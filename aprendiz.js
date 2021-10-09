chrome.storage.sync.get("frequency", ({ frequency }) => {
	chrome.storage.sync.get("lang", ({ lang }) => {
		console.log(lang);
		if (!lang) return;
		translateWords(~~frequency, lang);
	});
});

function translateWords (freq, lang) {
	for (const para of document.querySelectorAll('p')) {
		const words = wordsMap(para.textContent);
		let text = para.innerHTML;
		Object.entries(words).forEach(([word, map]) => {
			if (word === 'constructor') return;
			if (!dictionary[word]) return;
			// word exists in dictionary
			// Go for word?
			const dict = dictionary[word];
			if (Math.random() < freq * dict.r) {
				// We're changing this word!
				const sample = map[Math.floor(Math.random() * map.length)];
				const tempArr = text.split(sample.word);
				const splinter = Math.floor(Math.random() * (tempArr.length - 1));
				tempArr[splinter] = tempArr[splinter] + tag(sample.cap(dict[lang]), sample.word) + tempArr[splinter + 1];
				tempArr.splice(splinter + 1, 1);
				text = tempArr.join(sample.word);
				console.log(`Replaced ${sample.word} with ${sample.cap(dict[lang])}`);
			}
		});
		para.innerHTML = text;
	}
}

function wordsMap (text) {
	const rx = /\b(?:\w+)\b/g;
	const output = {};
	let res;
	while (res = rx.exec(text)) {
		const word = res[0];
		const validCapType = [/^[A-Z][a-z]+$/.test(word), !(/[A-Z]/.test(word)), !(/[a-z]/.test(word))]; // First capped, all lower, all caps
		if (!validCapType.find(x => x)) continue; // Weird caps; we skip those
		const w = word.toLowerCase();
		if (w === 'constructor') continue;
		if (!output[w]) output[w] = [];
		output[w].push({
			word,
			cap: function capitalize (x) {
				if (validCapType[0]) return x.charAt(0).toUpperCase() + x.substr(1);
				if (validCapType[1]) return x;
				if (validCapType[2]) return x.toUpperCase();
				return '';
			}
		});
	}
	return output;
}

function tag (word, def) {
	return `<b>${word}</b>`;
}