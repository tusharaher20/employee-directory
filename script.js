// Function to fetch the CSV file and parse it
async function getEmployeeData() {
    try {
        const response = await fetch('employees.csv');
        if (!response.ok) throw new Error('Could not load employees.csv');
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('results-container').innerHTML = 
            '<p class="no-results">Error: Make sure employees.csv exists in the same folder.</p>';
        return [];
    }
}

// Function to parse the CSV text into an array of objects
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    // Extract headers: Name, Department, Work station no., ext.no.
    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const employee = {};
        headers.forEach((header, i) => {
            employee[header] = values[i] || ""; 
        });
        return employee;
    });
}

// Helper to handle commas inside quotes
function parseCSVLine(line) {
    const result = [];
    let inQuote = false;
    let currentField = '';
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(currentField.trim().replace(/^"|"$/g, ''));
            currentField = '';
        } else {
            currentField += char;
        }
    }
    result.push(currentField.trim().replace(/^"|"$/g, ''));
    return result;
}

async function init() {
    const employees = await getEmployeeData();
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEmployees = employees.filter(employee =>
            (employee['Name'] && employee['Name'].toLowerCase().includes(searchTerm)) ||
            (employee['Department'] && employee['Department'].toLowerCase().includes(searchTerm))
        );
        displayResults(filteredEmployees);
    });

    function displayResults(results) {
        resultsContainer.innerHTML = ''; 
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No matches found.</p>';
            return;
        }

        results.forEach(employee => {
            const employeeCard = document.createElement('div');
            employeeCard.classList.add('employee-card');
            
            // Securely create content
            employeeCard.innerHTML = `
                <h3>${employee['Name'] || 'Unknown'}</h3>
                <p><strong>Department:</strong> ${employee['Department'] || 'N/A'}</p>
                <p><strong>Work Station:</strong> <span class="work-station-tag">${employee['Work station no.'] || 'N/A'}</span></p>
                <p><strong>Extension:</strong> ${employee['ext.no.'] || 'N/A'}</p>
            `;
            resultsContainer.appendChild(employeeCard);
        });
    }

    displayResults(employees);
}

init();