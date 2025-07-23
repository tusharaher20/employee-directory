// Function to fetch the CSV file and parse it
async function getEmployeeData() {
    try {
        const response = await fetch('employees.csv');
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.error('Error fetching or parsing CSV:', error);
        return [];
    }
}

// Function to parse the CSV text into an array of objects
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const employee = {};
        headers.forEach((header, i) => {
            employee[header] = values[i];
        });
        return employee;
    });
    return data;
}

// Helper function to handle quoted commas in a CSV line
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


// Main function to initialize the application
async function init() {
    const employees = await getEmployeeData();
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('results-container');

    // Event listener for the search input
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEmployees = employees.filter(employee =>
            employee['Name'].toLowerCase().includes(searchTerm)
        );
        displayResults(filteredEmployees);
    });

    // Function to display the search results
    function displayResults(results) {
        resultsContainer.innerHTML = ''; // Clear previous results
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p class="no-results">No employees found.</p>';
            return;
        }

        results.forEach(employee => {
            const employeeCard = document.createElement('div');
            employeeCard.classList.add('employee-card');
            employeeCard.innerHTML = `
                <h3>${employee['Name']}</h3>
                <p><strong>Department:</strong> ${employee['Department']}</p>
                <p><strong>Desk Number:</strong> ${employee['Desk Number']}</p>
                <p><strong>Extension No.:</strong> ${employee['Extension No.']}</p>
            `;
            resultsContainer.appendChild(employeeCard);
        });
    }

    // Display all employees initially
    displayResults(employees);
}

// Initialize the app when the page loads
init();