// Function to handle CSV parsing with quotes support
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
        const values = [];
        let inQuote = false;
        let current = '';
        for (let char of line) {
            if (char === '"') inQuote = !inQuote;
            else if (char === ',' && !inQuote) {
                values.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else current += char;
        }
        values.push(current.trim().replace(/^"|"$/g, ''));
        
        const emp = {};
        headers.forEach((h, i) => emp[h] = values[i] || "");
        return emp;
    });
}

async function init() {
    const resultsContainer = document.getElementById('results-container');
    let employees = [];

    try {
        const response = await fetch('employees.csv');
        const text = await response.text();
        employees = parseCSV(text);
    } catch (err) {
        resultsContainer.innerHTML = '<p class="no-results">Error loading employees.csv file.</p>';
        return;
    }

    const searchInput = document.getElementById('search-input');

    const render = (data) => {
        resultsContainer.innerHTML = '';
        if (data.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No matches found for your search.</p>';
            return;
        }

data.forEach(emp => {
    const card = document.createElement('div');
    card.className = 'employee-card';
    
    const station = emp['Work station no.'] || emp['Location/Cabin'] || emp['Station'] || 'N/A';
    const floor = emp['Floor'] || '15th';

    card.innerHTML = `
        <div class="floor-badge-top">${floor} Floor</div>
        <div class="card-header">
            <h3>${emp['Name']}</h3>
            <span class="station-id-tag">${station}</span>
        </div>
        <div class="info-grid">
            <div class="info-item">
                <strong>Department</strong>
                ${emp['Department'] || 'General'}
            </div>
            <div class="info-item">
                <strong>Extension</strong>
                ${emp['ext.no.'] || emp['Extension'] || 'N/A'}
            </div>
        </div>
    `;
    resultsContainer.appendChild(card);
});   };

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = employees.filter(emp => 
            Object.values(emp).some(val => val.toString().toLowerCase().includes(term))
        );
        render(filtered);
    });

    render(employees); // Initial render
}

document.addEventListener('DOMContentLoaded', init);