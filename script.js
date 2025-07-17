document.addEventListener('DOMContentLoaded', () => {
    const members = [
        { name: "Ayase Kotori", image: "RT_Kotori.jpeg" },
        { name: "Endo Rino", image: "RT_Rino.jpeg" },
        { name: "Yoshikawa Umi", image: "RT_Umi.jpeg" },
        { name: "Mizuno Noa", image: "RT_Noa.jpeg" },
        { name: "Ichihara Tsumugi", image: "RT_Tsumugi.jpeg" },
        { name: "Sato Rica", image: "RT_Rica.jpeg" },
        { name: "Katase Manaka", image: "RT_Manaka.jpeg" },
        { name: "Hayama Rico", image: "RT_Rico.jpeg" },
        { name: "Nino Fuka", image: "RT_Fuka.jpeg" },
        { name: "Momose Suzuna", image: "RT_Suzuna.jpeg" },
        { name: "Suzuno Mio", image: "RT_Mio.jpeg" },
        { name: "Nakamata Miki", image: "RT_Miki.jpeg" },
        { name: "Hashimoto Maki", image: "RT_Maki.jpeg" },
        { name: "Kurosawa Karen", image: "RT_Karen.jpeg" },
        { name: "Kato Shu", image: "RT_Shu.jpeg" },
        { name: "Nagase Mari", image: "RT_Mari.jpeg" },
        { name: "Asamiya Hinata", image: "RT_Hinata.jpeg" },
    ];

    let currentCategory = 'all'; // Default category
    let memberScores = {}; // To store scores for each member in the current category
    let comparisons = []; // Stores all possible comparisons
    let currentComparisonIndex = 0;

    const categoryButtons = document.querySelectorAll('.category-selection button');
    const sorterArea = document.querySelector('.sorter-area');
    const resultsArea = document.querySelector('.results-area');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const idol1Card = document.getElementById('idol1');
    const idol2Card = document.getElementById('idol2');
    const selectIdol1Btn = document.getElementById('select-idol1');
    const selectIdol2Btn = document.getElementById('select-idol2');
    const drawButton = document.getElementById('draw-button');
    const rankedList = document.getElementById('ranked-list');
    const downloadImageBtn = document.getElementById('download-image');
    const shareResultsBtn = document.getElementById('share-results');

    // Initialize scores for all members across all categories
    const initializeScores = () => {
        memberScores = {};
        members.forEach(member => {
            memberScores[member.name] = {
                all: 1000, // Initial ELO-like score
                visual: 1000,
                talent: 1000,
                comedian: 1000
            };
        });
    };

    // Generate all unique pairs for comparison
    const generateComparisons = () => {
        comparisons = [];
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                comparisons.push([members[i], members[j]]);
            }
        }
        // Shuffle comparisons for randomness
        for (let i = comparisons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [comparisons[i], comparisons[j]] = [comparisons[j], comparisons[i]];
        }
        currentComparisonIndex = 0;
    };

    // ELO-like rating update (simplified)
    const updateScores = (winner, loser, isDraw = false) => {
        const kFactor = 32; // Factor for score adjustment
        const scoreWinner = memberScores[winner.name][currentCategory];
        const scoreLoser = memberScores[loser.name][currentCategory];

        const expectedWinner = 1 / (1 + Math.pow(10, (scoreLoser - scoreWinner) / 400));
        const expectedLoser = 1 / (1 + Math.pow(10, (scoreWinner - scoreLoser) / 400));

        if (isDraw) {
            memberScores[winner.name][currentCategory] += kFactor * (0.5 - expectedWinner);
            memberScores[loser.name][currentCategory] += kFactor * (0.5 - expectedLoser);
        } else {
            memberScores[winner.name][currentCategory] += kFactor * (1 - expectedWinner);
            memberScores[loser.name][currentCategory] += kFactor * (0 - expectedLoser);
        }
    };

    const displayNextComparison = () => {
        if (currentComparisonIndex < comparisons.length) {
            const [idol1, idol2] = comparisons[currentComparisonIndex];
            idol1Card.querySelector('img').src = `images/${idol1.image}`;
            idol1Card.querySelector('p.idol-name').textContent = idol1.name;
            idol2Card.querySelector('img').src = `images/${idol2.image}`;
            idol2Card.querySelector('p.idol-name').textContent = idol2.name;

            updateProgressBar();
        } else {
            showResults();
        }
    };

    const updateProgressBar = () => {
        const progress = (currentComparisonIndex / comparisons.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Progress: ${Math.round(progress)}%`;
    };

    const showResults = () => {
        sorterArea.style.display = 'none';
        resultsArea.style.display = 'block';

        const sortedMembers = members.sort((a, b) => {
            return memberScores[b.name][currentCategory] - memberScores[a.name][currentCategory];
        });

        rankedList.innerHTML = '';
        sortedMembers.forEach((member, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `${index + 1}. ${member.name}`;
            rankedList.appendChild(listItem);
        });
    };

    const handleSelection = (selectedIdol) => {
        const [idol1, idol2] = comparisons[currentComparisonIndex];
        let winner, loser;

        if (selectedIdol === idol1) {
            winner = idol1;
            loser = idol2;
        } else {
            winner = idol2;
            loser = idol1;
        }
        updateScores(winner, loser);
        currentComparisonIndex++;
        displayNextComparison();
    };

    const handleDraw = () => {
        const [idol1, idol2] = comparisons[currentComparisonIndex];
        updateScores(idol1, idol2, true); // Mark as a draw
        currentComparisonIndex++;
        displayNextComparison();
    };

    // Event Listeners
    categoryButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            currentCategory = event.target.dataset.category;
            document.querySelector('.category-selection').style.display = 'none';
            sorterArea.style.display = 'block';
            initializeScores();
            generateComparisons();
            displayNextComparison();
        });
    });

    selectIdol1Btn.addEventListener('click', () => handleSelection(comparisons[currentComparisonIndex][0]));
    selectIdol2Btn.addEventListener('click', () => handleSelection(comparisons[currentComparisonIndex][1]));
    drawButton.addEventListener('click', handleDraw);

    downloadImageBtn.addEventListener('click', () => {
        // Using html2canvas to capture the results area as an image
        // You'll need to include the html2canvas library in your HTML:
        // <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
        html2canvas(document.querySelector('.results-area')).then(canvas => {
            const link = document.createElement('a');
            link.download = `RainTree_Ranking_${currentCategory}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    shareResultsBtn.addEventListener('click', () => {
        // Basic share functionality - can be expanded
        const rankedText = Array.from(rankedList.children).map(li => li.textContent).join('\n');
        const shareData = {
            title: `Rain Tree Idola Ranking (${currentCategory})`,
            text: `Ini adalah ranking idola Rain Tree favorit saya di kategori ${currentCategory}:\n\n${rankedText}`,
            url: window.location.href, // Or a specific URL if you host it
        };

        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('Shared successfully'))
                .catch((error) => console.error('Error sharing:', error));
        } else {
            alert("Fitur share tidak didukung di browser ini. Anda bisa mengunduh gambar hasilnya!");
            // Fallback for browsers that don't support Web Share API
            // You might offer to copy text to clipboard here
            navigator.clipboard.writeText(shareData.text)
                .then(() => alert('Teks hasil ranking disalin ke clipboard!'))
                .catch(err => console.error('Gagal menyalin teks:', err));
        }
    });

    // Initial setup
    initializeScores();
});
