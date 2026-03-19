
        let calculationHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
        let currentInput = "";
        let historyPanelVisible = false;

        // Save history to localStorage
        function saveHistory() {
            localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));
        }

        function appendNumber(num) {
            currentInput += num;
            updateScreen();
        }

        function appendOperator(op) {
            if (currentInput === "") return;
            currentInput += ` ${op} `;
            updateScreen();
        }

        function clearScreen() {
            currentInput = "";
            updateScreen();
        }

        function updateScreen() {
            document.getElementById('screen').value = currentInput;
        }

        // NEW: Undo last input (backspace function)
        function undoLastInput() {
            if (currentInput.length > 0) {
                // Remove last character
                currentInput = currentInput.slice(0, -1);
                updateScreen();
            }
        }

        // PERCENTAGE FUNCTION
        function calculatePercentage() {
            if (currentInput === "") return;
            
            try {
                const parts = currentInput.split(' ');
                if (parts.length >= 3) {
                    const lastNum = parseFloat(parts[parts.length - 1]);
                    const percentage = lastNum / 100;
                    parts[parts.length - 1] = percentage;
                    currentInput = parts.join(' ');
                } else {
                    currentInput = (parseFloat(currentInput) / 100).toString();
                }
                updateScreen();
            } catch (e) {
                currentInput = "Error";
                updateScreen();
            }
        }

        // Calculate with auto-save
        function calculate() {
            try {
                if (currentInput.includes('/ 0')) {
                    throw new Error("DIV/0!");
                }
                
                const result = eval(currentInput);
                
                const logEntry = { 
                    expression: currentInput, 
                    result: result,
                    timestamp: new Date().toLocaleTimeString()
                };
                calculationHistory.push(logEntry);
                saveHistory();
                
                currentInput = result.toString();
                updateScreen();
                
                // Auto-show history panel briefly
                if (!historyPanelVisible) {
                    toggleHistoryPanel();
                    setTimeout(() => toggleHistoryPanel(), 2000);
                } else {
                    displayHistory();
                }
                
            } catch (e) {
                currentInput = "Error";
                updateScreen();
            }
        }

        // Toggle history panel
        function toggleHistoryPanel() {
            historyPanelVisible = !historyPanelVisible;
            const panel = document.getElementById('history-panel');
            panel.style.display = historyPanelVisible ? 'block' : 'none';
            if (historyPanelVisible) {
                displayHistory();
            }
        }

        // Display history
        function displayHistory() {
            const panel = document.getElementById('history-panel');
            
            if (calculationHistory.length === 0) {
                panel.innerHTML = '<div class="empty-history">✨ NO HISTORY</div>';
                return;
            }

            let historyHTML = `
                <div class="history-header">
                    <span>📋 HISTORY</span>
                    <button class="clear-all-btn" onclick="showClearModal()">CLEAR</button>
                </div>
            `;
            
            [...calculationHistory].reverse().forEach((item, index) => {
                const originalIndex = calculationHistory.length - 1 - index;
                historyHTML += `
                    <div class="history-item">
                        <span onclick="recallHistory(${originalIndex})">${item.expression} = ${item.result}</span>
                        <span class="delete-item" onclick="deleteHistoryItem(${originalIndex}); event.stopPropagation();">✕</span>
                    </div>
                `;
            });
            
            panel.innerHTML = historyHTML;
        }

        // Recall history
        function recallHistory(index) {
            if (calculationHistory[index]) {
                currentInput = calculationHistory[index].result.toString();
                updateScreen();
            }
        }

        // Delete single history item
        function deleteHistoryItem(index) {
            calculationHistory.splice(index, 1);
            saveHistory();
            displayHistory();
        }

        // Show clear modal
        function showClearModal() {
            document.getElementById('clearModal').style.display = 'flex';
        }

        // Close modal
        function closeModal() {
            document.getElementById('clearModal').style.display = 'none';
        }

        // Clear all history
        function clearAllHistory() {
            calculationHistory = [];
            saveHistory();
            displayHistory();
            closeModal();
        }

        // Initialize
        window.onload = function() {
            updateScreen();
        };

        // Close modal if clicked outside
        window.onclick = function(event) {
            const modal = document.getElementById('clearModal');
            if (event.target === modal) {
                closeModal();
            }
        };
    