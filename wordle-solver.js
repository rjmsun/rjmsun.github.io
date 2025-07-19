/*
Enhanced Wordle Solver that seeks to maximize information gain with weighted scoring.

Key improvements:
- Uses dual word lists: answers vs all allowed guesses for information gathering
- Weighted scoring: greens (1.5) valued more than yellows (1.0) 
- Provides top-8 word recommendations with click-to-fill functionality
- Enhanced information gathering with expanded guess pool

It does this by:
- Tracking the letters that have been tested
- Tracking the letters that are known to be in the word
- Tracking the letters that are known to be not in the word
- Using weighted scoring to better evaluate information quality
- Recommending multiple good options for strategic play
- Click any recommendation to auto-fill it into the guess input
*/

class WordleSolver {
    constructor() {
        this.answerWords = [];     // Valid Wordle answers
        this.allWords = [];        // All allowed words for guessing (includes answers + information words)
        this.possibleWords = [];   // Current possible answers
        this.guessHistory = [];
        this.currentGuess = '';
        this.currentResult = ['grey', 'grey', 'grey', 'grey', 'grey'];
        this.testedLetters = new Set(); // Track letters we've already tested
        this.knownLetters = new Set(); // Track letters we know are in the word
        this.excludedLetters = new Set(); // Track letters we know are NOT in the word
        
        this.init();
    }

    async init() {
        await this.loadWords();
        this.setupEventListeners();
        // Small delay to ensure UI is ready, then calculate optimal starting words
        setTimeout(() => this.updateRecommendations(), 100);
    }

    async loadWords() {
        try {
            // Load answer words (valid Wordle answers)
            const answerResponse = await fetch('words.txt');
            const answerText = await answerResponse.text();
            this.answerWords = answerText.trim().split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5);
            
            // Load all allowed words (for guessing/information gathering)
            const allResponse = await fetch('total_allowed.txt');
            const allText = await allResponse.text();
            this.allWords = allText.trim().split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5);
            
            // Only answer words can be the target
            this.possibleWords = [...this.answerWords];
            
            console.log(`Loaded ${this.answerWords.length} answer words, ${this.allWords.length} total words for guessing`);
            this.updateWordsCount();
        } catch (error) {
            console.error('Error loading words:', error);
            // Fallback to single word list if dual lists not available
            try {
                const response = await fetch('words.txt');
                const text = await response.text();
                this.answerWords = text.trim().split('\n')
                    .map(word => word.trim().toUpperCase())
                    .filter(word => word.length === 5);
                this.allWords = [...this.answerWords];
                this.possibleWords = [...this.answerWords];
                console.log(`Fallback: Loaded ${this.answerWords.length} words`);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                // Ultimate fallback word list for demo
                this.answerWords = ['ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN'];
                this.allWords = [...this.answerWords];
                this.possibleWords = [...this.answerWords];
            }
                }
    }

    calculateExpectedInformation(pattern) {
        // Enhanced information scoring based on pattern types
        // Greens provide most information (1.5), yellows medium (1.0), grays some (0.4)
        let information = 0;
        pattern.forEach(result => {
            if (result === 'green') {
                information += 1.5; // Exact position known - high information
            } else if (result === 'yellow') {
                information += 1.0; // Letter in word but wrong position - medium information  
            } else if (result === 'grey') {
                information += 0.4; // Letter not in word - still some information
            }
        });
        return information;
    }

    setupEventListeners() {
        // Word input listener
        const guessInput = document.getElementById('guessWord');
        guessInput.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase();
            if (value.length <= 5) {
                this.currentGuess = value;
                this.updateLetterDisplay();
            }
        });

        // Result button listeners
        document.querySelectorAll('.result-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const position = parseInt(e.target.closest('.letter-result').dataset.position);
                const result = e.target.dataset.result;
                
                // Update active state
                e.target.closest('.result-buttons').querySelectorAll('.result-btn').forEach(b => 
                    b.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentResult[position] = result;
            });
        });

        // Submit button listener
        document.getElementById('submitGuess').addEventListener('click', () => {
            this.submitGuess();
        });

        // Reset button listener
        document.getElementById('resetGame').addEventListener('click', () => {
            this.resetGame();
        });

        // Enter key listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.submitGuess();
            }
        });
    }

    updateLetterDisplay() {
        const word = this.currentGuess.padEnd(5, ' ');
        for (let i = 0; i < 5; i++) {
            document.getElementById(`letter${i}`).textContent = word[i];
        }
    }

    submitGuess() {
        // Clear any previous error messages
        this.clearErrorMessage();

        if (this.currentGuess.length !== 5) {
            this.showErrorMessage('Please enter a 5-letter word');
            return;
        }

        // Check if the word is in the allowed word list
        if (!this.allWords.includes(this.currentGuess)) {
            this.showErrorMessage(`"${this.currentGuess}" is not an allowed word. Please enter a valid 5-letter word.`);
            return;
        }

        // Add to history
        this.guessHistory.push({
            word: this.currentGuess,
            result: [...this.currentResult]
        });

        // Update letter tracking
        this.updateLetterTracking(this.currentGuess, this.currentResult);

        // Filter possible words based on this guess
        this.filterWords(this.currentGuess, this.currentResult);
        
        // Update UI
        this.updateGuessHistory();
        this.updateRecommendations(); // Updated to show multiple recommendations
        this.resetInput();
    }

    updateLetterTracking(guess, result) {
        const letters = guess.split('');
        
        for (let i = 0; i < 5; i++) {
            const letter = letters[i];
            this.testedLetters.add(letter);
            
            if (result[i] === 'green' || result[i] === 'yellow') {
                this.knownLetters.add(letter);
            } else if (result[i] === 'grey') {
                // Only add to excluded if this letter doesn't appear as green/yellow elsewhere
                const appearsElsewhere = result.some((r, idx) => 
                    idx !== i && letters[idx] === letter && (r === 'green' || r === 'yellow')
                );
                if (!appearsElsewhere) {
                    this.excludedLetters.add(letter);
                }
            }
        }
    }

    filterWords(guess, result) {
        this.possibleWords = this.possibleWords.filter(word => {
            return this.isWordCompatible(word, guess, result);
        });
        this.updateWordsCount();
    }

    isWordCompatible(word, guess, result) {
        const wordLetters = word.split('');
        const guessLetters = guess.split('');
        
        // Check each position
        for (let i = 0; i < 5; i++) {
            const guessLetter = guessLetters[i];
            const wordLetter = wordLetters[i];
            const resultType = result[i];
            
            if (resultType === 'green') {
                // Letter must be in exact position
                if (wordLetter !== guessLetter) return false;
            } else if (resultType === 'yellow') {
                // Letter must be in word but not in this position
                if (wordLetter === guessLetter) return false;
                if (!word.includes(guessLetter)) return false;
            } else if (resultType === 'grey') {
                // Letter must not be in word (unless it's also yellow/green elsewhere)
                const hasYellowOrGreen = result.some((r, idx) => 
                    (r === 'yellow' || r === 'green') && guessLetters[idx] === guessLetter
                );
                if (!hasYellowOrGreen && word.includes(guessLetter)) return false;
            }
        }
        
        // Additional check for yellow letters - ensure they appear the right number of times
        for (let i = 0; i < 5; i++) {
            if (result[i] === 'yellow') {
                const letter = guessLetters[i];
                const guessCount = guessLetters.filter((l, idx) => 
                    l === letter && (result[idx] === 'yellow' || result[idx] === 'green')
                ).length;
                const wordCount = wordLetters.filter(l => l === letter).length;
                if (wordCount < guessCount) return false;
            }
        }
        
        return true;
    }

    calculateExpectedRemainingWords(guess) {
        if (this.possibleWords.length <= 1) return this.possibleWords.length;
        
        const resultGroups = new Map();
        
        // Group possible answers by result pattern
        this.possibleWords.forEach(answer => {
            const pattern = this.getResultPattern(guess, answer);
            const key = pattern.join('');
            
            if (!resultGroups.has(key)) {
                resultGroups.set(key, []);
            }
            resultGroups.get(key).push(answer);
        });
        
        // Calculate expected remaining words
        let expectedRemaining = 0;
        resultGroups.forEach(group => {
            const probability = group.length / this.possibleWords.length;
            expectedRemaining += probability * group.length;
        });
        
        return Math.round(expectedRemaining * 10) / 10; // Round to 1 decimal place
    }

    calculateExpectedValue(guess) {
        if (this.possibleWords.length <= 1) return 0;
        
        const resultGroups = new Map();
        let totalInformation = 0;
        
        // For each possible answer, calculate what result pattern this guess would give
        this.possibleWords.forEach(answer => {
            const pattern = this.getResultPattern(guess, answer);
            const key = pattern.join('');
            
            if (!resultGroups.has(key)) {
                resultGroups.set(key, []);
            }
            resultGroups.get(key).push(answer);
            
            // Calculate expected information for this pattern
            totalInformation += this.calculateExpectedInformation(pattern);
        });
        
        // Calculate expected remaining words (lower is better for information gain)
        let expectedRemaining = 0;
        resultGroups.forEach(group => {
            const probability = group.length / this.possibleWords.length;
            expectedRemaining += probability * group.length;
        });
        
        // Base information gain (reduction in search space)
        let informationGain = this.possibleWords.length - expectedRemaining;
        
        // Average expected information per guess
        const avgInformation = totalInformation / this.possibleWords.length;
        
        // Bonus for testing new letters (encourages exploration)
        const guessLetters = [...new Set(guess.split(''))];
        const newLettersCount = guessLetters.filter(letter => !this.testedLetters.has(letter)).length;
        informationGain += newLettersCount * 1.5; // Bonus for each new letter tested
        
        // Penalty for repeated letters (unless we have very few options)
        const uniqueLetters = guessLetters.length;
        if (uniqueLetters < 5 && this.possibleWords.length > 10) {
            informationGain -= (5 - uniqueLetters) * 1.0; // Penalty for repeated letters
        }
        
        // Penalty for using known excluded letters
        const excludedLettersUsed = guessLetters.filter(letter => this.excludedLetters.has(letter)).length;
        informationGain -= excludedLettersUsed * 3;
        
        // Combine traditional information gain with expected information quality
        const finalScore = informationGain + avgInformation * 0.8;
        
        return finalScore;
    }

    getResultPattern(guess, answer) {
        const result = ['grey', 'grey', 'grey', 'grey', 'grey'];
        const answerLetters = answer.split('');
        const guessLetters = guess.split('');
        const usedAnswerIndices = new Set();
        
        // First pass: mark greens
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === answerLetters[i]) {
                result[i] = 'green';
                usedAnswerIndices.add(i);
            }
        }
        
        // Second pass: mark yellows
        for (let i = 0; i < 5; i++) {
            if (result[i] === 'grey') {
                const letter = guessLetters[i];
                for (let j = 0; j < 5; j++) {
                    if (!usedAnswerIndices.has(j) && answerLetters[j] === letter) {
                        result[i] = 'yellow';
                        usedAnswerIndices.add(j);
                        break;
                    }
                }
            }
        }
        
        return result;
    }

    findTopGuesses(numRecommendations = 8) {
        if (this.possibleWords.length === 0) return [];
        
        // If exactly 1 word remaining, recommend it
        if (this.possibleWords.length === 1) {
            return [{
                word: this.possibleWords[0],
                score: 0,
                expectedRemaining: 1,
                newLetters: 0,
                isPossibleAnswer: true,
                uniqueLetters: new Set(this.possibleWords[0].split('')).size
            }];
        }
        
        let guessPool;
        
        // Choose guess pool based on game state - use full word list for information gathering
        if (this.possibleWords.length > 50) {
            // For large search spaces, use expanded word list but limit for performance
            guessPool = this.allWords.slice(0, 2000);
        } else if (this.possibleWords.length > 2) {
            // For medium search spaces, use full expanded word list
            guessPool = this.allWords;
        } else {
            // If only 2 words left, find distinguishing words from full list
            guessPool = this.findDistinguishingWords();
            if (guessPool.length === 0) {
                return this.possibleWords.map(word => ({
                    word: word,
                    score: 0,
                    expectedRemaining: 1,
                    newLetters: 0,
                    isPossibleAnswer: true,
                    uniqueLetters: new Set(word.split('')).size
                }));
            }
        }
        
        // Calculate comprehensive metrics for all candidate guesses
        const detailedGuesses = [];
        guessPool.forEach(guess => {
            const score = this.calculateExpectedValue(guess);
            const expectedRemaining = this.calculateExpectedRemainingWords(guess);
            const guessLetters = [...new Set(guess.split(''))];
            const newLetters = guessLetters.filter(l => !this.testedLetters.has(l));
            const isPossibleAnswer = this.possibleWords.includes(guess);
            
            detailedGuesses.push({
                word: guess,
                score: score,
                expectedRemaining: expectedRemaining,
                newLetters: newLetters.length,
                isPossibleAnswer: isPossibleAnswer,
                uniqueLetters: guessLetters.length
            });
        });
        
        // Sort by score (descending) and return top N with full details
        detailedGuesses.sort((a, b) => b.score - a.score);
        
        return detailedGuesses.slice(0, numRecommendations);
    }

    findDistinguishingWords() {
        if (this.possibleWords.length !== 2) return this.allWords;
        
        const [word1, word2] = this.possibleWords;
        const diffPositions = [];
        const diffLetters = new Set();
        
        // Find positions and letters where the two words differ
        for (let i = 0; i < 5; i++) {
            if (word1[i] !== word2[i]) {
                diffPositions.push(i);
                diffLetters.add(word1[i]);
                diffLetters.add(word2[i]);
            }
        }
        
        // Find words that contain these distinguishing letters from full word list
        return this.allWords.filter(word => {
            const wordLetters = word.split('');
            const containsDistinguishingLetters = [...diffLetters].some(letter => 
                wordLetters.includes(letter)
            );
            const hasUniqueLetters = new Set(wordLetters).size === 5; // Prefer no repeated letters
            return containsDistinguishingLetters && hasUniqueLetters;
        });
    }

    updateRecommendations() {
        if (this.possibleWords.length === 0) {
            document.getElementById('recommendedWord').textContent = 'NO WORDS';
            document.getElementById('recommendationReason').textContent = 'No possible words match your constraints. Check your inputs.';
            return;
        }
        
        if (this.possibleWords.length === 1) {
            // Show final answer
            this.showFinalAnswers();
            return;
        }
        
        const topGuesses = this.findTopGuesses(8);
        if (topGuesses.length > 0) {
            // Display primary recommendation (first in list)
            document.getElementById('recommendedWord').textContent = topGuesses[0].word;
            
            // Update recommendation reason for primary word
            if (this.guessHistory.length === 0) {
                document.getElementById('recommendationReason').textContent = 
                    `Best expected information: ${topGuesses[0].expectedRemaining} words remaining on average`;
            } else if (this.possibleWords.length === 2) {
                document.getElementById('recommendationReason').textContent = 
                    `Testing distinguishing letters to determine between ${this.possibleWords.join(' vs ')}`;
            } else {
                if (topGuesses[0].isPossibleAnswer && this.possibleWords.length <= 5) {
                    document.getElementById('recommendationReason').textContent = 
                        `Possible answer with ${topGuesses[0].expectedRemaining} words remaining on average`;
                } else if (topGuesses[0].newLetters > 0) {
                    document.getElementById('recommendationReason').textContent = 
                        `${topGuesses[0].newLetters} new letters, ${topGuesses[0].expectedRemaining} words remaining on average`;
                } else {
                    document.getElementById('recommendationReason').textContent = 
                        `Best expected information: ${topGuesses[0].expectedRemaining} words remaining on average`;
                }
            }
            
            // Display top-8 recommendations
            this.showTopRecommendations(topGuesses);
        }
    }

    showTopRecommendations(topGuesses) {
        // Create or update top recommendations section
        let topRecsSection = document.getElementById('topRecommendations');
        if (!topRecsSection) {
            // Create the section if it doesn't exist
            const recommendationSection = document.querySelector('.recommendation-section');
            topRecsSection = document.createElement('div');
            topRecsSection.id = 'topRecommendations';
            topRecsSection.className = 'top-recommendations';
            recommendationSection.appendChild(topRecsSection);
        }
        
        topRecsSection.innerHTML = `
            <h3>Top Recommendations (click to use):</h3>
            <div class="recommendations-grid">
                ${topGuesses.map((guess, index) => {
                    return `
                        <div class="recommendation-item ${index === 0 ? 'primary' : ''}" data-word="${guess.word}" style="cursor: pointer;">
                            <div class="rec-left">
                                <div class="rec-rank">${index + 1}</div>
                                <div class="rec-word">${guess.word}</div>
                            </div>
                            <div class="rec-right">
                                <div class="remaining-words">${guess.expectedRemaining} words remaining</div>
                                <div class="rec-details">
                                    ${guess.isPossibleAnswer ? '<span class="answer-badge">ANSWER</span>' : ''}
                                    ${guess.newLetters > 0 ? `<span class="info-badge">${guess.newLetters} new</span>` : ''}
                                    <span class="unique-badge">${guess.uniqueLetters}/5 unique</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // Add click handlers to each recommendation item
        const recommendationItems = topRecsSection.querySelectorAll('.recommendation-item');
        recommendationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const word = e.currentTarget.dataset.word;
                this.fillGuessInput(word);
            });
        });
    }

    fillGuessInput(word) {
        // Set the current guess
        this.currentGuess = word;
        
        // Update the input field
        const guessInput = document.getElementById('guessWord');
        guessInput.value = word;
        
        // Update the letter display
        this.updateLetterDisplay();
        
        // Focus the input field and scroll to it
        guessInput.focus();
        guessInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add a brief highlight effect to show the word was selected
        guessInput.style.backgroundColor = '#e6fffa';
        setTimeout(() => {
            guessInput.style.backgroundColor = '';
        }, 500);
    }

    showFinalAnswers() {
        const finalSection = document.getElementById('finalAnswerSection');
        const finalAnswers = document.getElementById('finalAnswers');
        
        finalSection.style.display = 'block';
        finalAnswers.innerHTML = '';
        
        if (this.possibleWords.length === 1) {
            finalAnswers.innerHTML = `
                <div class="final-word">${this.possibleWords[0]}</div>
                <div class="final-message">This is the answer! Go guess it!</div>
            `;
            document.getElementById('recommendedWord').textContent = this.possibleWords[0];
            document.getElementById('recommendationReason').textContent = 'This is the only possible answer!';
        }
        
        // Hide top recommendations when showing final answer
        const topRecsSection = document.getElementById('topRecommendations');
        if (topRecsSection) {
            topRecsSection.style.display = 'none';
        }
    }

    updateWordsCount() {
        document.getElementById('wordsCount').textContent = this.possibleWords.length.toLocaleString();
    }

    updateGuessHistory() {
        const historyContainer = document.getElementById('guessHistory');
        
        if (this.guessHistory.length === 0) {
            historyContainer.innerHTML = '<div class="history-empty">No guesses yet. Start with one of the recommended words above!</div>';
            return;
        }
        
        historyContainer.innerHTML = this.guessHistory.map(guess => `
            <div class="history-item">
                <div class="history-word">${guess.word}</div>
                <div class="history-pattern">
                    ${guess.result.map((result, i) => `
                        <div class="history-letter ${result}">${guess.word[i]}</div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    showErrorMessage(message) {
        // Create or update error message area
        let errorDiv = document.getElementById('errorMessage');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'errorMessage';
            errorDiv.className = 'error-message';
            const guessInput = document.getElementById('guessWord');
            guessInput.parentNode.insertBefore(errorDiv, guessInput.nextSibling);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            this.clearErrorMessage();
        }, 4000);
    }

    clearErrorMessage() {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    resetInput() {
        this.currentGuess = '';
        this.currentResult = ['grey', 'grey', 'grey', 'grey', 'grey'];
        
        document.getElementById('guessWord').value = '';
        this.updateLetterDisplay();
        this.clearErrorMessage(); // Clear any error messages
        
        // Reset result buttons
        document.querySelectorAll('.result-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.result === 'grey') {
                btn.classList.add('active');
            }
        });
    }

    // Add method to reset entire game state
    resetGame() {
        this.possibleWords = [...this.answerWords]; // Reset to answer words only
        this.guessHistory = [];
        this.testedLetters.clear();
        this.knownLetters.clear();
        this.excludedLetters.clear();
        this.resetInput();
        this.updateGuessHistory();
        this.updateRecommendations();
        this.updateWordsCount();
        document.getElementById('finalAnswerSection').style.display = 'none';
        
        // Show top recommendations section again
        const topRecsSection = document.getElementById('topRecommendations');
        if (topRecsSection) {
            topRecsSection.style.display = 'block';
        }
    }
}

// Initialize the solver when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WordleSolver();
}); 