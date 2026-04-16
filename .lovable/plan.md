

## Household Account Book — Native iOS App

### Overview
A mobile-first household account book app with income/expense tracking, budget management, charts, and multi-member support — all stored locally on the device using localStorage/IndexedDB. Built with React + Capacitor for native iOS deployment.

### Pages & Features

**1. Dashboard (Home)**
- Monthly summary: total income, total expenses, balance
- Recent transactions list
- Quick "Add" button (floating action button)

**2. Add/Edit Transaction**
- Type toggle: Income / Expense
- Amount, date, category selector, note, family member selector
- Categories: Food, Rent, Utilities, Transport, Shopping, Health, Education, Entertainment, etc.

**3. Transaction History**
- Filterable list by date range, category, member
- Swipe to delete/edit
- Monthly grouping

**4. Budget Management**
- Set monthly budget per category
- Progress bars showing spent vs. budget
- Over-budget warnings

**5. Charts & Reports**
- Pie chart: spending by category
- Bar chart: monthly income vs. expenses trend
- Filter by month and family member
- Uses Recharts library

**6. Family Members**
- Add/manage household members (name + avatar color)
- Each transaction tagged to a member
- Filter all views by member

**7. Settings**
- Currency selection
- Data export (CSV)
- Clear all data option

### Design
- Clean, minimal iOS-style UI with bottom tab navigation (Home, History, Budget, Charts, Settings)
- Mobile-optimized (375px primary target)
- Light theme with soft colors

### Technical
- Local storage via IndexedDB (using idb library) for offline persistence
- Capacitor for native iOS build
- Bottom tab navigation with React Router

