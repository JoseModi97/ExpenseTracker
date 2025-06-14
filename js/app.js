// Expense management functions
var transactionsTable;

function initData() {
  if (localStorage.getItem('transactions')) {
    transactions = JSON.parse(localStorage.getItem('transactions'));
  }
  if (localStorage.getItem('categories')) {
    categories = JSON.parse(localStorage.getItem('categories'));
  }
}

function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategoryOptions() {
  var select = document.getElementById('transCategory');
  if (!select) return;
  select.innerHTML = '';
  categories.forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    select.appendChild(opt);
  });
}

function renderCategories() {
  var list = document.getElementById('categoryList');
  if (!list) return;
  list.innerHTML = '';
  categories.forEach(function (c) {
    var li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = c.name;
    var btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-danger';
    btn.textContent = 'Delete';
    btn.addEventListener('click', function () {
      deleteCategory(c.id);
    });
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function renderTransactions(data) {
  var tbody = document.querySelector('#transactionTable tbody');
  tbody.innerHTML = '';
  (data || transactions).forEach(function (t) {
    var tr = document.createElement('tr');
    var tdDate = document.createElement('td');
    tdDate.textContent = t.date;
    var tdCat = document.createElement('td');
    var cat = categories.find(function (c) { return c.id === t.category; });
    tdCat.textContent = cat ? cat.name : '';
    var tdAmt = document.createElement('td');
    tdAmt.textContent = '$' + t.amount.toFixed(2);
    var tdDel = document.createElement('td');
    var btn = document.createElement('button');
    btn.className = 'btn btn-sm btn-danger';
    btn.textContent = 'Delete';
    btn.addEventListener('click', function () {
      deleteTransaction(t.id);
    });
    tdDel.appendChild(btn);
    tr.appendChild(tdDate);
    tr.appendChild(tdCat);
    tr.appendChild(tdAmt);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
}

function addTransaction(date, categoryId, amount) {
  var id = transactions.length ? transactions[transactions.length - 1].id + 1 : 1;
  transactions.push({ id: id, date: date, category: parseInt(categoryId), amount: parseFloat(amount) });
  saveData();
  checkBudgets(date, categoryId);
  applyFilters();
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) { return t.id !== id; });
  saveData();
  applyFilters();
}

function addCategory(name) {
  var id = categories.length ? categories[categories.length - 1].id + 1 : 1;
  categories.push({ id: id, name: name });
  saveData();
  renderCategoryOptions();
  renderCategories();
}

function deleteCategory(id) {
  categories = categories.filter(function (c) { return c.id !== id; });
  transactions = transactions.filter(function (t) { return t.category !== id; });
  saveData();
  renderCategoryOptions();
  renderCategories();
  applyFilters();
}

function applyFilters() {
  var start = document.getElementById('filterStart').value;
  var end = document.getElementById('filterEnd').value;
  var filtered = transactions.filter(function (t) {
    if (start && t.date < start) return false;
    if (end && t.date > end) return false;
    return true;
  });
  renderTransactions(filtered);
  renderAreaChart(filtered);
  renderPieChart(filtered);
}

function checkBudgets(date, categoryId) {
  var month = date.slice(0, 7);
  var monthlyTotal = transactions.filter(function (t) { return t.date.slice(0, 7) === month; })
    .reduce(function (s, t) { return s + t.amount; }, 0);
  if (monthlyTotal > budgets.monthly) {
    alert('Monthly budget exceeded!');
  }
  var catTotal = transactions.filter(function (t) { return t.category === parseInt(categoryId) && t.date.slice(0, 7) === month; })
    .reduce(function (s, t) { return s + t.amount; }, 0);
  var limit = budgets.categories[categoryId];
  if (limit && catTotal > limit) {
    alert('Budget for category exceeded!');
  }
}

function exportCsv() {
  var rows = [['Date', 'Category', 'Amount']];
  var tbody = document.querySelector('#transactionTable tbody').children;
  for (var i = 0; i < tbody.length; i++) {
    var cells = tbody[i].children;
    rows.push([cells[0].textContent, cells[1].textContent, cells[2].textContent]);
  }
  var csvContent = rows.map(function (r) { return r.join(','); }).join('\n');
  var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'transactions.csv';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', function () {
  initData();
  renderCategoryOptions();
  renderCategories();
  applyFilters();

  var transForm = document.getElementById('transactionForm');
  if (transForm) {
    transForm.addEventListener('submit', function (e) {
      e.preventDefault();
      addTransaction(
        document.getElementById('transDate').value,
        document.getElementById('transCategory').value,
        document.getElementById('transAmount').value
      );
      transForm.reset();
    });
  }

  var catForm = document.getElementById('categoryForm');
  if (catForm) {
    catForm.addEventListener('submit', function (e) {
      e.preventDefault();
      addCategory(document.getElementById('categoryName').value);
      catForm.reset();
    });
  }

  document.getElementById('applyFilter').addEventListener('click', applyFilters);
  document.getElementById('exportCsv').addEventListener('click', exportCsv);
});

