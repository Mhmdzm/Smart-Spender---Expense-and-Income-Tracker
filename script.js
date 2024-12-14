let transactionType = "income";
let totalIncome = 0;
let totalExpense = 0;
let transactions = [];
let chart;

window.addEventListener("scroll", () => {
  const header = document.getElementById("header");
  const h1 = header.querySelector("h1");

  const scrollY = window.scrollY;
  const scale = Math.max(1 - scrollY / 90, 0);

  h1.style.fontSize = `${1.5 * scale}em`;
  h1.style.opacity = scale;
});

window.onload = function () {
  loadTransactions();
  updateGraph();
  window.scrollTo(0, 0);
};

function setTransactionType(type) {
  transactionType = type;
  document.getElementById("note").focus();
  document.getElementById("income").style.background =
    type === "income" ? "#570357" : "white";
  document.getElementById("expense").style.background =
    type === "expense" ? "#570357" : "white";
}

document
  .getElementById("expense")
  .addEventListener("click", () => setTransactionType("expense"));
document
  .getElementById("income")
  .addEventListener("click", () => setTransactionType("income"));

document.getElementById("submit").addEventListener("click", function () {
  const note = document.getElementById("note").value.trim();
  const amount = document
    .querySelector('#numbersinput input[type="number"]')
    .value.trim();
  const date = document.querySelector('#numbersinput input[type="date"]').value;

  if (!note || !amount || !date) {
    alert("Please fill in all fields.");
    return;
  }

  const amountValue =
    transactionType === "expense"
      ? -Math.abs(parseFloat(amount))
      : Math.abs(parseFloat(amount));

  const newTransaction = {
    note,
    amount: amountValue,
    date,
    type: transactionType,
  };

  addTransaction(newTransaction);

  updateTotals(amountValue);
  updateGraph();
  document.getElementById("note").value = "";
  document.querySelector('#numbersinput input[type="number"]').value = "";
  document.querySelector('#numbersinput input[type="date"]').value = "";
});

function loadTransactions() {
  const savedData = JSON.parse(localStorage.getItem("transactionsData")) || {
    transactions: [],
  };
  transactions = savedData.transactions;

  totalIncome = 0;
  totalExpense = 0;
  transactions.forEach((transaction) => {
    addTransactionToTable(
      transaction.note,
      transaction.amount,
      transaction.date,
      transaction.type
    );
  });
  updateTotalsOnLoad(transactions);
}

function addTransaction(transaction) {
  transactions.push(transaction);
  saveTransactionsToLocalStorage();
  addTransactionToTable(
    transaction.note,
    transaction.amount,
    transaction.date,
    transaction.type
  );
}

function saveTransactionsToLocalStorage() {
  localStorage.setItem("transactionsData", JSON.stringify({ transactions }));
}

function addTransactionToTable(note, amount, date, type) {
  const table = document
    .getElementById("transactionTable")
    .getElementsByTagName("tbody")[0];
  const newRow = table.insertRow();

  const noteCell = newRow.insertCell(0);
  const amountCell = newRow.insertCell(1);
  const dateCell = newRow.insertCell(2);
  const actionCell = newRow.insertCell(3);

  noteCell.textContent = note;
  amountCell.textContent = amount.toFixed(2);
  dateCell.textContent = date;

  amountCell.style.color = type === "expense" ? "red" : "green";

  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.style.color = "white";
  deleteButton.style.backgroundColor = "red";
  deleteButton.style.border = "none";
  deleteButton.style.padding = "5px 10px";
  deleteButton.style.cursor = "pointer";

  deleteButton.addEventListener("click", () => {
    if (type === "income") {
      totalIncome -= amount;
    } else if (type === "expense") {
      totalExpense -= Math.abs(amount);
    }

    const balance = totalIncome - totalExpense;
    document.getElementById("incometxt").textContent = totalIncome.toFixed(2);
    document.getElementById("expensetxt").textContent = totalExpense.toFixed(2);
    document.getElementById("balancetxt").textContent = balance.toFixed(2);

    table.deleteRow(newRow.rowIndex - 1);
    removeTransactionFromArray(note, amount, date, type);
    updateGraph();
  });

  actionCell.appendChild(deleteButton);
}

function removeTransactionFromArray(note, amount, date, type) {
  transactions = transactions.filter(
    (transaction) =>
      !(
        transaction.note === note &&
        transaction.amount === amount &&
        transaction.date === date &&
        transaction.type === type
      )
  );
  saveTransactionsToLocalStorage();
}

function updateTotals(amount) {
  if (amount < 0) {
    totalExpense += Math.abs(amount);
  } else {
    totalIncome += amount;
  }

  const balance = totalIncome - totalExpense;

  document.getElementById("incometxt").textContent = totalIncome.toFixed(2);
  document.getElementById("expensetxt").textContent = totalExpense.toFixed(2);
  document.getElementById("balancetxt").textContent = balance.toFixed(2);
}

function updateTotalsOnLoad(transactions) {
  transactions.forEach((transaction) => {
    if (transaction.amount < 0) {
      totalExpense += Math.abs(transaction.amount);
    } else {
      totalIncome += transaction.amount;
    }
  });
  updateTotals(0);
}

function updateGraph() {
  const ctx = document.getElementById("balanceChart").getContext("2d");

  const labels = transactions.map((t) => t.note);
  const data = transactions.map((t) => t.amount);

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Transaction Amount",
          data,
          backgroundColor: data.map((amount) =>
            amount < 0 ? "rgba(255, 99, 132, 0.2)" : "rgba(75, 192, 192, 0.2)"
          ),
          borderColor: data.map((amount) =>
            amount < 0 ? "rgba(255, 99, 132, 1)" : "rgba(75, 192, 192, 1)"
          ),
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
