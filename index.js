  // JavaScript Calculator 

  // Memory of the calculator 
class Calculator {
    constructor() {
        this.currentInput = "";
        this.calculationHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];
        this.init();
    }

    init() {
        // Get all elements with data attributes
        this.displayElement = document.querySelector('[data-display]');
        this.historyListElement = document.getElementById('history-list');
        
        // Initialize event listeners based on data attributes
        this.setupNumberButtons();
        this.setupOperationButtons();
        this.setupActionButtons();
        this.setupHistoryPanel();
        
        // Initial display update
        this.updateScreen('0');
        this.renderHistory();
    }

    setupNumberButtons() {
        // Find all elements with data-number attribute
        document.querySelectorAll('[data-number]').forEach(button => {
            button.addEventListener('click', (e) => {
                const number = e.target.getAttribute('data-number');
                this.appendNumber(number);
            });
        });
    }

    setupOperationButtons() {
        // Find all elements with data-operation attribute
        document.querySelectorAll('[data-operation]').forEach(button => {
            button.addEventListener('click', (e) => {
                const operator = e.target.getAttribute('data-operation');
                this.appendOperator(operator);
            });
        });
    }

    setupActionButtons() {
        // Find all elements with data-action attribute
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.handleAction(action);
            });
        });
    }

    setupHistoryPanel() {
        // History panel and clear all button
        const clearAllBtn = document.querySelector('[data-action="clear-history"]');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.showClearModal());
        }

        // Modal buttons
        const modal = document.querySelector('[data-modal]');
        const cancelBtn = document.querySelector('[data-modal-cancel]');
        const confirmBtn = document.querySelector('[data-modal-confirm]');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hideModal());
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.clearAllHistory();
                this.hideModal();
            });
        }

        // Window controls (non-functional, just for UI)
        document.querySelectorAll('[data-action="minimize"], [data-action="close"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // These are just UI elements, no functionality needed
                console.log('UI button clicked:', e.target.getAttribute('data-action'));
            });
        });
    }

    handleAction(action) {
        switch(action) {
            case 'clear':
                this.clearScreen();
                break;
            case 'delete':
                this.deleteLastCharacter();
                break;
            case 'history':
                this.toggleHistory();
                break;
            case 'calculate':
                this.calculate();
                break;
        }
    }

    appendNumber(num) {
        // Prevent multiple decimals
        if (num === "." && this.currentInput.includes(".")) return;
        
        // Handle 00
        if (num === "00" && this.currentInput === "0") {
            this.currentInput = "0";
        } else if (this.currentInput === "0" && num !== ".") {
            this.currentInput = num;
        } else {
            this.currentInput += num;
        }
        
        this.updateScreen(this.currentInput || '0');
    }

     // APPEND OPERATOR 
    appendOperator(op) {
        if (this.currentInput === "") return;
        
        const lastChar = this.currentInput.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            // Replace last operator
            this.currentInput = this.currentInput.slice(0, -1) + op;
        } else {
             // Just add operator to the end
            this.currentInput += op;
        }
        // Update the screen
        this.updateScreen(this.currentInput);
    }

     // CLEAR SCREEN - Reset everything (C button)
    clearScreen() {
        this.currentInput = "";
        this.updateScreen('0');
    }

    // DELETE LAST CHARACTER - Backspace button (⌫)
    deleteLastCharacter() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateScreen(this.currentInput || '0');
    }

    // CALCULATE 

    calculate() {
         // If no calculation nothing is calculated
        if (!this.currentInput) return;

        try {
            // math removing any unwanted characters that can break things
            let expression = this.currentInput.replace(/[^-()\d/*+.]/g, '');

            // Calling to EVAL JavaScript's built-in calculator
            let result = eval(expression);
            
            // Round to 6 decimal places to avoid long decimals
            result = Math.round(result * 1000000) / 1000000;
            
            // Save calculation to history
            this.addToHistory(`${this.currentInput} = ${result}`);
            
            // Set result to new input 
            this.currentInput = result.toString();
            this.updateScreen(this.currentInput);
            
        } catch (e) {
            // If something goes wrong like dividing by zero
            this.updateScreen('Error');
            this.currentInput = "";
            
            // Reset after error display
            setTimeout(() => {
                this.updateScreen('0');
            }, 1500);
        }
    }
    // Add to History saving calculations for later
    addToHistory(entry) {
        // newest entry shows first
        this.calculationHistory.unshift(entry);
        // Keep only last 10 calculations
        if (this.calculationHistory.length > 10) {
            this.calculationHistory.pop();
        }
        // Save to browser memory 🧠
        this.saveHistory();
        // Update screen
        this.renderHistory();
    }
      //Show the history on screen
    renderHistory() {
        // If history box doesn't exist, stop
        if (!this.historyListElement) return;
       // If no history yet, show a friendly message
        if (this.calculationHistory.length === 0) {
            this.historyListElement.innerHTML = '<div class="empty-history">No history yet</div>';
            return;
        }
        // Create HTML for each history item
        this.historyListElement.innerHTML = this.calculationHistory.map((entry, index) => `
            <div class="history-item" data-history-index="${index}">
                <span>${entry}</span>
                <span class="delete-item" data-history-delete="${index}">🗑️</span>
            </div>
        `).join('');

        // Add click handlers for history items (calculations)to be clickable and reused
        document.querySelectorAll('[data-history-index]').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-item')) {
                    const index = item.getAttribute('data-history-index');
                    this.loadHistoryItem(index);
                }
            });
        });

        // Add delete handlers to delete single history items
        document.querySelectorAll('[data-history-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = btn.getAttribute('data-history-delete');
                this.deleteHistoryItem(index);
            });
        });
    }
    // LOAD HISTORY ITEM - Put an old calculation back on screen
    loadHistoryItem(index) {
        const entry = this.calculationHistory[index];
        if (entry) {
            const expression = entry.split('=')[0].trim();
            this.currentInput = expression;
            this.updateScreen(expression);
        }
    }
    // DELETE HISTORY ITEM - Remove one item from history
    deleteHistoryItem(index) {
        this.calculationHistory.splice(index, 1);
        this.saveHistory();
        this.renderHistory();
    }
    // CLEAR ALL HISTORY - Delete everything!
    clearAllHistory() {
        this.calculationHistory = [];
        this.saveHistory();
        this.renderHistory();
    }
    // SAVE HISTORY - Store history in browser's memory
    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.calculationHistory));
    }
    // TOGGLE HISTORY - Show or hide the history panel
    toggleHistory() {
        const panel = document.querySelector('[data-history-panel]');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }
     // SHOW CLEAR MODAL - Pop up the "Are you sure?" window
    showClearModal() {
        const modal = document.querySelector('[data-modal]');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
     // HIDE MODAL - Close the popup window
    hideModal() {
        const modal = document.querySelector('[data-modal]');
        if (modal) {
            modal.style.display = 'none';
        }
    }
     // UPDATE SCREEN
    updateScreen(value) {
        if (this.displayElement) {
            this.displayElement.value = value;
        }
    }
}

// Initialize calculator when webpage is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});