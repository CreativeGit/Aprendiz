chrome.storage.sync.get("frequency", ({ frequency }) => {
	chrome.storage.sync.get("lang", ({ lang }) => {
		if (!frequency || !lang) return;
		// After loading the page settings
		// We change some random words
		translateWords(Number(frequency), lang);
	});
});

const pastParas = [];

function translateWords (freq, lang) {
	if (pastParas.length) {
		// Restore natural state before translating
		pastParas.forEach(([para, text]) => para.innerHTML = text);
		pastParas = [];
	}
	for (const para of document.querySelectorAll('p')) {
		// For every <p> element on the page
		const words = wordsMap(para.textContent);
		// We convert the paragraph to a frequency map of words
		// ie; the list of all words in the para, as well as how often it appears
		let text = para.innerHTML;
		const temp = text;
		// This _should_ ideally use textContent so as not to disturb other elements, but it does ruin stuff a bit.
		// Will look into ways to make this avoid being inside a nested element and ruining links
		Object.entries(words).forEach(([word, map]) => {
			// For every word / the list of times it occurs (the .cap function properly capitalizes the translated word the same way the original was)
			if (word === 'constructor') return;
			// 'constructor' is a function that exists on every object; this just prevents crashes
			if (!dictionary[word]) return;
			// If we don't have the word in our dictionary, we can't translate it
			const dict = dictionary[word];
			// Load the translations and relevancy
			if (Math.random() < freq * dict.r / 100) {
				// We're changing this word!
				const sample = map[Math.floor(Math.random() * map.length)];
				// Pick a random occurence of this word in the paragraph
				const tempArr = text.split(new RegExp(`\\b${sample.word}\\b`));
				// Split the paragraph text by the old word
				const splinter = Math.floor(Math.random() * (tempArr.length - 1));
				tempArr[splinter] = tempArr[splinter] + tag(sample.cap(dict[lang]), sample.word) + tempArr[splinter + 1];
				tempArr.splice(splinter + 1, 1);
				// Pick any of the old 'joints' and replace it with the new word (ie, join two consecutive elements with the translated word)
				pastParas.push(text);
				// Store a backup of the old text in case we want to undo these changes later
				text = tempArr.join(sample.word);
				// Replace all untouched occurences with the original word
			}
		});
		pastParas.push([para, temp]);
		para.innerHTML = text;
		// Change the paragraph text to add in our new words
	}
}

function wordsMap (text) {
	// Converts a paragraph into words and their translated capitalizations
	const rx = /\b(?:\w+)\b/g; // A Regular Expression that matches individual words
	const output = {}; // The map we're returning
	let res;
	while (res = rx.exec(text)) { // For every match
		const word = res[0];
		const validCapType = [/^[A-Z][a-z]+$/.test(word), !(/[A-Z]/.test(word)), !(/[a-z]/.test(word))]; // First capped, all lower, all caps
		if (!validCapType.find(x => x)) continue; // Weird caps; we skip those
		// We only work on words that either have the first letter in capital, no letters in capital, or all letetrs in capital
		const w = word.toLowerCase();
		if (w === 'constructor') continue; // Again, ignore 'constructor'
		if (!output[w]) output[w] = []; // If we don't have the word in our map, add it
		output[w].push({
			word,
			cap: function capitalize (x) {
				if (validCapType[0]) return x.charAt(0).toUpperCase() + x.substr(1);
				if (validCapType[1]) return x;
				if (validCapType[2]) return x.toUpperCase();
				return '';
			}
		});
		// Append an element to the map
	}
	return output;
}

function tag (word, def) {
	return `<div class="tooltip-aprendiz">${word}<span class="tooltip-aprendiz-text">${def}</span></div>`;
	// Replace each translated word with a hoverable span that shows its translation
}

{
	chrome.runtime.onMessage.addListener((request, sender) => {
		// Listen for updates from the extension popup
		if (request.freq && request.lang !== 'null') translateWords(request.freq, request.lang);
	});
}
