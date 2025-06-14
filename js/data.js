// Static data arrays for categories, transactions and predefined users
var organizations = [
  { id: 1, name: 'OrgA' },
  { id: 2, name: 'OrgB' },
];

var roles = ['Admin', 'Manager', 'Employee', 'Auditor'];

var categories = [
  { id: 1, orgId: 1, name: 'Rent' },
  { id: 2, orgId: 1, name: 'Food' },
  { id: 3, orgId: 1, name: 'Transport' },
  { id: 4, orgId: 1, name: 'Utilities' },
  { id: 5, orgId: 2, name: 'Supplies' },
  { id: 6, orgId: 2, name: 'Travel' },
];

var transactions = [
  { id: 1, userId: 1, orgId: 1, date: '2023-01-05', category: 1, amount: 1200, status: 'approved' },
  { id: 2, userId: 2, orgId: 1, date: '2023-01-07', category: 2, amount: 150, status: 'approved' },
  { id: 3, userId: 3, orgId: 1, date: '2023-01-09', category: 3, amount: 50, status: 'approved' },
  { id: 4, userId: 3, orgId: 1, date: '2023-02-01', category: 1, amount: 1200, status: 'pending' },
  { id: 5, userId: 5, orgId: 2, date: '2023-02-06', category: 5, amount: 300, status: 'approved' },
  { id: 6, userId: 5, orgId: 2, date: '2023-02-10', category: 6, amount: 80, status: 'pending' },
  { id: 7, userId: 6, orgId: 2, date: '2023-02-15', category: 5, amount: 150, status: 'approved' },
  { id: 8, userId: 7, orgId: 2, date: '2023-02-16', category: 6, amount: 60, status: 'pending' },
];

var budgets = {
  1: {
    monthly: 2000,
    categories: { 1: 1500, 2: 500, 3: 200, 4: 300 }
  },
  2: {
    monthly: 1800,
    categories: { 5: 1000, 6: 400 }
  }
};

var users = [
  { id: 1, email: 'admin@orga.com', password: 'admin', firstName: 'Alice', lastName: 'Admin', orgId: 1, role: 'Admin' },
  { id: 2, email: 'manager@orga.com', password: 'manager', firstName: 'Mark', lastName: 'Manager', orgId: 1, role: 'Manager' },
  { id: 3, email: 'employee@orga.com', password: 'employee', firstName: 'Eve', lastName: 'Employee', orgId: 1, role: 'Employee' },
  { id: 4, email: 'auditor@orga.com', password: 'auditor', firstName: 'Ann', lastName: 'Auditor', orgId: 1, role: 'Auditor' },
  { id: 5, email: 'admin@orgb.com', password: 'admin', firstName: 'Bob', lastName: 'Admin', orgId: 2, role: 'Admin' },
  { id: 6, email: 'manager@orgb.com', password: 'manager', firstName: 'Mia', lastName: 'Manager', orgId: 2, role: 'Manager' },
  { id: 7, email: 'employee@orgb.com', password: 'employee', firstName: 'Earl', lastName: 'Employee', orgId: 2, role: 'Employee' }
];

function loadDemoData() {
  return fetch('data/demo-data.txt')
    .then(function (response) { return response.text(); })
    .then(function (text) {
      try {
        var data = JSON.parse(text);
        if (data.organizations) organizations = data.organizations;
        if (data.roles) roles = data.roles;
        if (data.categories) categories = data.categories;
        if (data.transactions) transactions = data.transactions;
        if (data.budgets) budgets = data.budgets;
        if (data.users) users = data.users;
      } catch (e) {
        console.error('Failed to parse demo-data.txt', e);
      }
    })
    .catch(function (err) {
      console.warn('Could not load demo-data.txt', err);
    });
}
