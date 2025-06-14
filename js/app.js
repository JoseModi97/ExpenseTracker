// Expense management functions
var transactionsTable;

function initData() {
  if (localStorage.getItem('transactions')) {
    transactions = JSON.parse(localStorage.getItem('transactions'));
  }
  if (localStorage.getItem('categories')) {
    categories = JSON.parse(localStorage.getItem('categories'));
  }
  if (localStorage.getItem("users")) {
    users = JSON.parse(localStorage.getItem("users"));
  }
  if (localStorage.getItem("budgets")) {
    budgets = JSON.parse(localStorage.getItem("budgets"));
  }
}

function saveData() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("budgets", JSON.stringify(budgets));
  localStorage.setItem('categories', JSON.stringify(categories));
}

function renderCategoryOptions() {
  var select = document.getElementById('transCategory');
  var filterSelect = document.getElementById('filterCategory');
  if (select) {
    select.innerHTML = '';
  }
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="">All Categories</option>';
  }
  categories.filter(function(c){return c.orgId === currentUser.orgId;}).forEach(function (c) {
    var opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    if (select) select.appendChild(opt.cloneNode(true));
    if (filterSelect) filterSelect.appendChild(opt);
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
  var tbodyParent = document.querySelector('#transactionTable');
  if (!tbodyParent) return;
  var tbody = tbodyParent.querySelector('tbody');
  if (!tbody) return;
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
  var startEl = document.getElementById('filterStart');
  var endEl = document.getElementById('filterEnd');
  var catEl = document.getElementById('filterCategory');

  if (!startEl || !endEl || !catEl) {
    // When filtering UI is absent just refresh charts and tables if present
    renderTransactions();
    renderAreaChart(transactions.filter(function(t){return t.orgId === currentUser.orgId;}));
    renderPieChart(transactions.filter(function(t){return t.orgId === currentUser.orgId;}));
    updateSummary();
    return;
  }

  var startVal = startEl.value;
  var endVal = endEl.value;
  var catVal = catEl.value;
  var start = startVal ? new Date(startVal) : null;
  var end = endVal ? new Date(endVal) : null;
  var cat = catVal ? parseInt(catVal) : null;
  var filtered = transactions.filter(function (t) {
    if (t.orgId !== currentUser.orgId) return false;
    var tDate = new Date(t.date);
    if (start && tDate < start) return false;
    if (end && tDate > end) return false;
    if (cat && t.category !== cat) return false;
    return true;
  });
  renderTransactions(filtered);
  renderAreaChart(filtered);
  renderPieChart(filtered);
  updateSummary(filtered);
}

function updateSummary(data) {
  data = data || transactions.filter(function(t){return t.orgId === currentUser.orgId;});
  var total = data.reduce(function(s, t){return s + t.amount;}, 0);
  var now = new Date();
  var monthKey = now.toISOString().slice(0,7);
  var monthTotal = data.filter(function(t){return t.date.slice(0,7) === monthKey;})
    .reduce(function(s, t){return s + t.amount;}, 0);
  var totalEl = document.getElementById('totalExpenses');
  var monthEl = document.getElementById('monthExpenses');
  var countEl = document.getElementById('transactionCount');
  if (totalEl) totalEl.textContent = '$' + total.toFixed(2);
  if (monthEl) monthEl.textContent = '$' + monthTotal.toFixed(2);
  if (countEl) countEl.textContent = data.length;
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
  var table = document.querySelector('#transactionTable');
  if (!table) return;
  var rows = [['Date', 'Category', 'Amount']];
  var tbody = table.querySelector('tbody').children;
  for (var i = 0; i < tbody.length; i++) {
    var cells = tbody[i].children;
    rows.push([cells[0].textContent, cells[2].textContent, cells[3].textContent]);
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

function resetData() {
  localStorage.removeItem('transactions');
  localStorage.removeItem('categories');
  loadDemoData().then(function(){
    initData();
    renderCategoryOptions();
    renderCategories();
    applyFilters();
  });
}
function renderUsers() {
  var tbody = document.getElementById('usersBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  // Display every user in the system for demo purposes
  users.forEach(function(u){
    var tr = document.createElement('tr');
    var tdName = document.createElement('td');
    tdName.textContent = u.firstName + ' ' + u.lastName;
    var tdEmail = document.createElement('td');
    tdEmail.textContent = u.email;
    var tdRole = document.createElement('td');
    if (currentUser.role === 'Admin') {
      var sel = document.createElement('select');
      sel.className = 'form-control form-control-sm';
      roles.forEach(function(r){
        var opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r;
        if (r === u.role) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function(){
        u.role = this.value;
        saveData();
        renderUsers();
      });
      tdRole.appendChild(sel);
    } else {
      tdRole.textContent = u.role;
    }
    tr.appendChild(tdName);
    tr.appendChild(tdEmail);
    tr.appendChild(tdRole);
    tbody.appendChild(tr);
  });
}

function renderBudgets() {
  var mInput = document.getElementById('monthlyBudget');
  var body = document.getElementById('budgetBody');
  if (!mInput || !body) return;
  var b = budgets[currentUser.orgId] || {monthly:0, categories:{}};
  mInput.value = b.monthly;
  body.innerHTML = '';
  categories.filter(function(c){return c.orgId === currentUser.orgId;}).forEach(function(c){
    var tr = document.createElement('tr');
    var td1 = document.createElement('td');
    td1.textContent = c.name;
    var td2 = document.createElement('td');
    var inp = document.createElement('input');
    inp.type = 'number';
    inp.step = '0.01';
    inp.className = 'form-control form-control-sm budget-cat';
    inp.setAttribute('data-id', c.id);
    inp.value = b.categories[c.id] || 0;
    td2.appendChild(inp);
    tr.appendChild(td1);
    tr.appendChild(td2);
    body.appendChild(tr);
  });
}

function saveBudgetsForm(e) {
  e.preventDefault();
  var b = budgets[currentUser.orgId] || {monthly:0, categories:{}};
  b.monthly = parseFloat(document.getElementById('monthlyBudget').value) || 0;
  var cats = {};
  document.querySelectorAll('.budget-cat').forEach(function(inp){
    cats[parseInt(inp.getAttribute('data-id'))] = parseFloat(inp.value) || 0;
  });
  b.categories = cats;
  budgets[currentUser.orgId] = b;
  saveData();
  alert('Budgets saved');
}

function renderAccount() {
  var f = document.getElementById('accountForm');
  if (!f) return;
  document.getElementById('accFirstName').value = currentUser.firstName;
  document.getElementById('accLastName').value = currentUser.lastName;
  document.getElementById('accEmail').value = currentUser.email;
}

function saveAccountForm(e) {
  e.preventDefault();
  var first = document.getElementById('accFirstName').value;
  var last = document.getElementById('accLastName').value;
  var email = document.getElementById('accEmail').value;
  var pass = document.getElementById('accPassword').value;
  var user = users.find(function(u){return u.id === currentUser.id;});
  if (user) {
    user.firstName = first;
    user.lastName = last;
    user.email = email;
    if (pass) user.password = pass;
    currentUser = Object.assign({}, user);
    localStorage.setItem('loggedInUser', JSON.stringify(currentUser));
    saveData();
    alert('Account updated');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  loadDemoData().then(function(){
    initData();
    renderCategoryOptions();
    renderCategories();
    applyFilters();

    renderUsers();
    renderBudgets();
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
    var resetBtn = document.getElementById('resetData');
    var budgetForm = document.getElementById("budgetForm");
    if (budgetForm) {
      budgetForm.addEventListener("submit", saveBudgetsForm);
    }
    var accountForm = document.getElementById('accountForm');
    if (accountForm) {
      renderAccount();
      accountForm.addEventListener('submit', saveAccountForm);
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', resetData);
    }
  });
});

