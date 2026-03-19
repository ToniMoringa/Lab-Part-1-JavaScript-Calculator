/**
 * Calculator with Data Attribute Event Handling
 * All functionality is attached via data attributes
 */

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

    appendOperator(op) {
        if (this.currentInput === "") return;
        
        const lastChar = this.currentInput.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            // Replace last operator
            this.currentInput = this.currentInput.slice(0, -1) + op;
        } else {
            this.currentInput += op;
        }
        
        this.updateScreen(this.currentInput);
    }

    clearScreen() {
        this.currentInput = "";
        this.updateScreen('0');
    }

    deleteLastCharacter() {
        this.currentInput = this.currentInput.slice(0, -1);
        this.updateScreen(this.currentInput || '0');
    }

    calculate() {
        if (!this.currentInput) return;

        try {
            // Sanitize input and calculate
            let expression = this.currentInput.replace(/[^-()\d/*+.]/g, '');
            let result = eval(expression);
            
            // Format result
            result = Math.round(result * 1000000) / 1000000;
            
            // Save to history
            this.addToHistory(`${this.currentInput} = ${result}`);
            
            // Set current input to result
            this.currentInput = result.toString();
            this.updateScreen(this.currentInput);
            
        } catch (e) {
            this.updateScreen('Error');
            this.currentInput = "";
            
            // Reset after error
            setTimeout(() => {
                this.updateScreen('0');
            }, 1500);
        }
    }

    addToHistory(entry) {
        this.calculationHistory.unshift(entry);
        if (this.calculationHistory.length > 10) {
            this.calculationHistory.pop();
        }
        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (!this.historyListElement) return;

        if (this.calculationHistory.length === 0) {
            this.historyListElement.innerHTML = '<div class="empty-history">No history yet</div>';
            return;
        }

        this.historyListElement.innerHTML = this.calculationHistory.map((entry, index) => `
            <div class="history-item" data-history-index="${index}">
                <span>${entry}</span>
                <span class="delete-item" data-history-delete="${index}">🗑️</span>
            </div>
        `).join('');

        // Add click handlers for history items
        document.querySelectorAll('[data-history-index]').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-item')) {
                    const index = item.getAttribute('data-history-index');
                    this.loadHistoryItem(index);
                }
            });
        });

        // Add delete handlers
        document.querySelectorAll('[data-history-delete]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = btn.getAttribute('data-history-delete');
                this.deleteHistoryItem(index);
            });
        });
    }

    loadHistoryItem(index) {
        const entry = this.calculationHistory[index];
        if (entry) {
            const expression = entry.split('=')[0].trim();
            this.currentInput = expression;
            this.updateScreen(expression);
        }
    }

    deleteHistoryItem(index) {
        this.calculationHistory.splice(index, 1);
        this.saveHistory();
        this.renderHistory();
    }

    clearAllHistory() {
        this.calculationHistory = [];
        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('calcHistory', JSON.stringify(this.calculationHistory));
    }

    toggleHistory() {
        const panel = document.querySelector('[data-history-panel]');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    showClearModal() {
        const modal = document.querySelector('[data-modal]');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideModal() {
        const modal = document.querySelector('[data-modal]');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateScreen(value) {
        if (this.displayElement) {
            this.displayElement.value = value;
        }
    }
}

// Initialize calculator when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});