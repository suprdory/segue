document.addEventListener('DOMContentLoaded', () => {
    const segueForm = document.getElementById('segue-form');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const resultsDiv = document.getElementById('results');
    const clearBtn = document.getElementById('clear-btn');
    const randomFromBtn = document.getElementById('random-from-btn');
    const randomToBtn = document.getElementById('random-to-btn');

    const savedList = document.getElementById('saved-list');

    const API_BASE_URL = 'https://meow.suprdory.com:8007';
    const WORD_REGEX = /^[a-z]+$/;

    const getSavedSegues = () => {
        return JSON.parse(localStorage.getItem('savedSegues') || '[]');
    };

    const saveSegues = (segues) => {
        localStorage.setItem('savedSegues', JSON.stringify(segues));
    };

    const renderSavedSegue = ({ from, to, segues, text }) => {
        const li = document.createElement('li');
        let segueContent;
        if (segues) {
            segueContent = segues.join(' ');
        } else if (text) {
            // For backwards compatibility with old format
            segueContent = text.replace(/→/g, ' ');
        } else {
            segueContent = '';
        }
        li.innerHTML = `<strong>From:</strong> ${from} <br> <strong>To:</strong> ${to} <br> <strong>Via:</strong> ${segueContent}`;
        savedList.prepend(li);
    };

    const loadSavedSegues = () => {
        savedList.innerHTML = '';
        const segues = getSavedSegues();
        segues.reverse().forEach(renderSavedSegue);
    };

    const addSavedSegue = (from, to, segues) => {
        const allSegues = getSavedSegues();
        const newSegue = { from, to, segues };
        allSegues.unshift(newSegue);
        saveSegues(allSegues);
        renderSavedSegue(newSegue);
    };

    const findSegue = async (from, to) => {
        try {
            const response = await fetch(`${API_BASE_URL}/segue?word1=${from}&word2=${to}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.segues;
        } catch (error) {
            console.error("Error finding segue:", error);
            return null;
        }
    };

    const getRandomWord = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/random_word`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.word;
        } catch (error) {
            console.error("Error getting random word:", error);
            return null;
        }
    };

    segueForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const from = fromInput.value.trim().toLowerCase();
        const to = toInput.value.trim().toLowerCase();

        if (!WORD_REGEX.test(from) || !WORD_REGEX.test(to)) {
            resultsDiv.innerHTML = '<p style="color: var(--error-color);">Please enter single, lowercase words (no proper nouns).</p>';
            return;
        }

        if (!from || !to) {
            resultsDiv.innerHTML = '<p style="color: var(--error-color);">Please enter both a "from" and "to" value.</p>';
            return;
        }

        resultsDiv.innerHTML = '<p>Finding segue...</p>';
        const segues = await findSegue(from, to);

        if (segues && segues.length > 0) {
            const fromSpan = `<span class="segue-word">${from}</span>`;
            const toSpan = `<span class="segue-word">${to}</span>`;
            const arrow = `<span class="arrow">→</span>`;
            const segueSpans = segues.map(word => `<span class="segue-word result-word">${word}</span>`).join('');
            
            resultsDiv.innerHTML = `<p>${fromSpan} ${arrow} ${toSpan}</p><p>${segueSpans}</p>`;

            addSavedSegue(from, to, segues);
        } else {
            resultsDiv.innerHTML = `<p>Could not find a segue from <strong>${from}</strong> to <strong>${to}</strong>.</p>`;
        }
    });

    clearBtn.addEventListener('click', () => {
        fromInput.value = '';
        toInput.value = '';
        resultsDiv.innerHTML = '';
    });

    randomFromBtn.addEventListener('click', async () => {
        const word = await getRandomWord();
        if (word) {
            fromInput.value = word;
        }
    });

    randomToBtn.addEventListener('click', async () => {
        const word = await getRandomWord();
        if (word) {
            toInput.value = word;
        }
    });

    loadSavedSegues();
});
