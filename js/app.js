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
  categories.filter(function(c){return c.orgId === currentUser.orgId;}).forEach(function (c) {
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
  categories.filter(function(c){return c.orgId === currentUser.orgId;}).forEach(function (c) {
    var li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = c.name;
    if (currentUser.role === 'Admin' || currentUser.role === 'Manager') {
      var btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-danger';
      btn.textContent = 'Delete';
      btn.addEventListener('click', function () {
        deleteCategory(c.id);
      });
      li.appendChild(btn);
    }
    list.appendChild(li);
  });
}

function renderTransactions(data) {
  var tbody = document.querySelector('#transactionTable tbody');
  tbody.innerHTML = '';
  (data || transactions).filter(function(t){return t.orgId === currentUser.orgId;}).forEach(function (t) {
    var tr = document.createElement('tr');
    var tdDate = document.createElement('td');
    tdDate.textContent = new Date(t.date).toLocaleDateString();
    var tdUser = document.createElement('td');
    var usr = users.find(function(u){return u.id === t.userId;});
    tdUser.textContent = usr ? (usr.firstName + ' ' + usr.lastName) : '';
    var tdCat = document.createElement('td');
    var cat = categories.find(function (c) { return c.id === t.category; });
    tdCat.textContent = cat ? cat.name : '';
    var tdAmt = document.createElement('td');
    tdAmt.textContent = '$' + t.amount.toFixed(2);
    var tdStatus = document.createElement('td');
    tdStatus.textContent = t.status;
    var tdDel = document.createElement('td');
    if ((currentUser.role === 'Admin' || currentUser.role === 'Manager') && t.status !== 'pending') {
      var delBtn = document.createElement('button');
      delBtn.className = 'btn btn-sm btn-danger mr-2';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', function () { deleteTransaction(t.id); });
      tdDel.appendChild(delBtn);
    }
    if (t.status === 'pending' && (currentUser.role === 'Admin' || currentUser.role === 'Manager')) {
      var appBtn = document.createElement('button');
      appBtn.className = 'btn btn-sm btn-success mr-1';
      appBtn.textContent = 'Approve';
      appBtn.addEventListener('click', function(){ approveTransaction(t.id, 'approved');});
      var rejBtn = document.createElement('button');
      rejBtn.className = 'btn btn-sm btn-warning';
      rejBtn.textContent = 'Reject';
      rejBtn.addEventListener('click', function(){ approveTransaction(t.id, 'rejected');});
      tdDel.appendChild(appBtn);
      tdDel.appendChild(rejBtn);
    }
    tr.appendChild(tdDate);
    tr.appendChild(tdUser);
    tr.appendChild(tdCat);
    tr.appendChild(tdAmt);
    tr.appendChild(tdStatus);
    tr.appendChild(tdDel);
    tbody.appendChild(tr);
  });
}

function addTransaction(date, categoryId, amount) {
  var id = transactions.length ? transactions[transactions.length - 1].id + 1 : 1;
  transactions.push({ id: id, userId: currentUser.id, orgId: currentUser.orgId, date: date, category: parseInt(categoryId), amount: parseFloat(amount), status: 'pending' });
  saveData();
  checkBudgets(date, categoryId);
  applyFilters();
}

function deleteTransaction(id) {
  transactions = transactions.filter(function (t) { return t.id !== id; });
  saveData();
  applyFilters();
}

function approveTransaction(id, status) {
  var tx = transactions.find(function(t){return t.id === id;});
  if (tx) {
    tx.status = status;
    saveData();
    applyFilters();
  }
}

function addCategory(name) {
  var id = categories.length ? categories[categories.length - 1].id + 1 : 1;
  categories.push({ id: id, orgId: currentUser.orgId, name: name });
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
  var startVal = document.getElementById('filterStart').value;
  var endVal = document.getElementById('filterEnd').value;
  var start = startVal ? new Date(startVal) : null;
  var end = endVal ? new Date(endVal) : null;
  var filtered = transactions.filter(function (t) {
    if (t.orgId !== currentUser.orgId) return false;
    var tDate = new Date(t.date);
    if (start && tDate < start) return false;
    if (end && tDate > end) return false;
    return true;
  });
  renderTransactions(filtered);
  renderAreaChart(filtered);
  renderPieChart(filtered);
}

function checkBudgets(date, categoryId) {
  var month = date.slice(0, 7);
  var monthlyTotal = transactions.filter(function (t) { return t.orgId === currentUser.orgId && t.date.slice(0, 7) === month && t.status !== 'rejected'; })
    .reduce(function (s, t) { return s + t.amount; }, 0);
  if (monthlyTotal > budgets[currentUser.orgId].monthly) {
    alert('Monthly budget exceeded!');
  }
  var catTotal = transactions.filter(function (t) { return t.orgId === currentUser.orgId && t.category === parseInt(categoryId) && t.date.slice(0, 7) === month && t.status !== 'rejected'; })
    .reduce(function (s, t) { return s + t.amount; }, 0);
  var limit = budgets[currentUser.orgId].categories[categoryId];
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

