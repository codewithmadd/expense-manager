// Budget Manager Logic

// Authentication and Dashboard Sections
const authSection = document.getElementById("auth-section");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const dashboardSection = document.getElementById("dashboard-section");
const logoutLink = document.getElementById("logout-link");

// User Data
let userData = JSON.parse(localStorage.getItem("userData")) || {};
let activeUser = null;

// Utility Functions
const showElement = (element) => element.classList.remove("d-none");
const hideElement = (element) => element.classList.add("d-none");

const saveUserData = () => {
    localStorage.setItem("userData", JSON.stringify(userData));
};

const resetForms = () => {
    loginForm.reset();
    signupForm.reset();
};

const updateDashboard = () => {
    const user = userData[activeUser];

    // Update dashboard values
    const totalIncome = user.income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = user.expenses.reduce((sum, item) => sum + item.amount, 0);
    const totalSavings = totalIncome - totalExpenses;

    document.getElementById("total-income").textContent = `AED ${totalIncome.toFixed(2)}`;
    document.getElementById("total-expenses").textContent = `AED ${totalExpenses.toFixed(2)}`;
    document.getElementById("total-savings").textContent = `AED ${totalSavings.toFixed(2)}`;

    // Populate income table
    const incomeTable = document.getElementById("income-table");
    incomeTable.innerHTML = user.income.length
        ? user.income.map((item, index) => `
            <tr>
                <td>${item.source}</td>
                <td>AED ${item.amount.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeIncome(${index})">Delete</button></td>
            </tr>
        `).join("")
        : '<tr><td colspan="3" class="text-center">No records found.</td></tr>';

    // Populate expense table
    const expenseTable = document.getElementById("expense-table");
    expenseTable.innerHTML = user.expenses.length
        ? user.expenses.map((item, index) => `
            <tr>
                <td>${item.source}</td>
                <td>AED ${item.amount.toFixed(2)}</td>
                <td><button class="btn btn-sm btn-danger" onclick="removeExpense(${index})">Delete</button></td>
            </tr>
        `).join("")
        : '<tr><td colspan="3" class="text-center">No records found.</td></tr>';
};

// Authentication Handlers
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    if (userData[username] && userData[username].password === password) {
        activeUser = username;
        document.getElementById("user-name").textContent = userData[username].name;
        hideElement(authSection);
        showElement(dashboardSection);
        showElement(logoutLink);
        updateDashboard();
    } else {
        alert("Invalid username or password.");
    }
});

signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name").value;
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;

    if (userData[username]) {
        alert("Username already exists. Please choose another.");
        return;
    }

    userData[username] = { name, password, income: [], expenses: [] };
    saveUserData();
    alert("Signup successful! Please log in.");
    hideElement(signupForm);
    showElement(loginForm);
});

logoutLink.addEventListener("click", () => {
    activeUser = null;
    hideElement(dashboardSection);
    showElement(authSection);
    hideElement(logoutLink);
    resetForms();
});

// Income and Expense Handlers
document.getElementById("income-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const source = document.getElementById("income-source").value;
    const amount = parseFloat(document.getElementById("income-amount").value);

    if (!source || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid source and amount.");
        return;
    }

    userData[activeUser].income.push({ source, amount });
    saveUserData();
    updateDashboard();
    e.target.reset();
});

document.getElementById("expense-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const source = document.getElementById("expense-source").value;
    const amount = parseFloat(document.getElementById("expense-amount").value);

    if (!source || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid source and amount.");
        return;
    }

    userData[activeUser].expenses.push({ source, amount });
    saveUserData();
    updateDashboard();
    e.target.reset();
});

// Remove Income and Expense
function removeIncome(index) {
    userData[activeUser].income.splice(index, 1);
    saveUserData();
    updateDashboard();
}

function removeExpense(index) {
    userData[activeUser].expenses.splice(index, 1);
    saveUserData();
    updateDashboard();
}

// Toggle Forms
document.getElementById("show-login").addEventListener("click", () => {
    hideElement(signupForm);
    showElement(loginForm);
});

document.getElementById("show-signup").addEventListener("click", () => {
    hideElement(loginForm);
    showElement(signupForm);
});

// Initial State
if (localStorage.getItem("activeUser")) {
    activeUser = localStorage.getItem("activeUser");
    if (userData[activeUser]) {
        document.getElementById("user-name").textContent = userData[activeUser].name;
        hideElement(authSection);
        showElement(dashboardSection);
        showElement(logoutLink);
        updateDashboard();
    } else {
        localStorage.removeItem("activeUser");
    }
}
