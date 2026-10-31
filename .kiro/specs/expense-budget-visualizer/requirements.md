# Requirements Document

## Introduction

The Expense & Budget Visualizer is a standalone client-side web application that lets users record expense transactions, view a scrollable list of those transactions, monitor a running total balance, and visualize spending distribution by category through a pie chart. The application is built with HTML, CSS, and vanilla JavaScript, uses Chart.js loaded via a CDN for charting, and persists all data in the browser's Local Storage so that no backend server is required. The application also offers optional enhancements: a dark/light theme toggle, transaction sorting by amount or category, and a monthly summary view.

## Glossary

- **App**: The Expense & Budget Visualizer web application, built with HTML, CSS, and vanilla JavaScript and rendered in a modern web browser.
- **Transaction**: A single expense record consisting of an item name, a positive numeric amount, a Category, and the date and time at which it was added.
- **Input_Form**: The form in the App where the user enters a new Transaction, containing the Item Name, Amount, and Category fields.
- **Transaction_List**: The scrollable list in the App that displays all recorded Transactions.
- **Total_Balance**: The sum of the amounts of all Transactions in the Transaction_List, displayed at the top of the App.
- **Pie_Chart**: The chart rendered with Chart.js that shows spending distribution across Categories.
- **Category**: One of three expense classifications used by the App: Food, Transport, or Fun.
- **Local_Storage**: The browser's localStorage API used by the App for client-side data persistence.
- **Chart.js**: The JavaScript charting library loaded via CDN and used to render the Pie_Chart.
- **Core_Features**: The primary features of the App comprising Add Transactions, Display Transactions, Delete Transactions, Display Total Balance, and Visualize Spending by Category.

## Requirements

### Requirement 1: Add Transactions

**User Story:** As a user, I want to add an expense transaction with a name, amount, and category, so that I can record my spending.

#### Acceptance Criteria

1. WHEN the Input_Form is submitted with an Item Name of 1 to 50 characters, an Amount that is a positive number between 0.01 and 999,999,999.99, and a Category of Food, Transport, or Fun, THE App SHALL add a new Transaction to the Transaction_List
2. IF any field in the Input_Form is empty or contains only whitespace, THEN THE App SHALL prevent submission and display a validation message identifying the missing field
3. IF the Amount field contains a value that is not a positive number between 0.01 and 999,999,999.99 with at most 2 decimal places, THEN THE App SHALL prevent submission and display a validation message indicating the Amount must be a positive number
4. WHEN a new Transaction is added, THE App SHALL assign the current date and time to the Transaction
5. THE App SHALL restrict the Category of each Transaction to Food, Transport, or Fun

### Requirement 2: Display Transactions

**User Story:** As a user, I want to view all my recorded transactions in a scrollable list, so that I can review my spending history.

#### Acceptance Criteria

1. THE App SHALL display the Transaction_List as a scrollable list that shows all recorded Transactions
2. WHILE one or more Transactions exist, THE App SHALL display the name, amount, and Category for each Transaction in the Transaction_List
3. IF no Transactions exist, THEN THE App SHALL display an empty-state message in the Transaction_List indicating that no Transactions have been recorded

### Requirement 3: Delete Transactions

**User Story:** As a user, I want to remove a transaction from the list, so that I can correct mistakes or remove unwanted entries.

#### Acceptance Criteria

1. THE App SHALL display a delete control next to each Transaction in the Transaction_List
2. WHEN the delete control for a Transaction is activated, THE App SHALL remove only that Transaction from the Transaction_List

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see my total balance at a glance, so that I can track my overall spending.

#### Acceptance Criteria

1. THE App SHALL display the Total_Balance, computed as the sum of all Transaction amounts, at the top of the page
2. WHEN a Transaction is added or deleted, THE App SHALL recompute and update the Total_Balance within 100 milliseconds
3. WHILE no Transactions exist, THE App SHALL display a Total_Balance of zero

### Requirement 5: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand how my spending is distributed.

#### Acceptance Criteria

1. THE App SHALL render a Pie_Chart showing one labeled segment per Category, with each segment proportional to the sum of Transaction amounts for that Category
2. WHEN a Transaction is added or deleted, THE App SHALL immediately update the Pie_Chart so that each Category segment reflects the updated sum of Transaction amounts
3. THE App SHALL render the Pie_Chart using Chart.js
4. IF no Transactions exist, THEN THE App SHALL render the Pie_Chart with all Category segments equal to zero

### Requirement 6: Persist Data Locally

**User Story:** As a user, I want my transactions saved in my browser, so that my data persists across page reloads without a backend server.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE App SHALL save the current Transaction_List to Local_Storage
2. WHEN the App loads, THE App SHALL load the Transaction_List from Local_Storage and populate the Transaction_List
3. THE App SHALL store all data client-side using the Local_Storage API without transmitting data to any server
4. WHEN the App loads, IF no Transaction_List is stored in Local_Storage or the stored data cannot be parsed into a Transaction_List, THEN THE App SHALL initialize the Transaction_List as empty
5. IF saving the Transaction_List to Local_Storage fails, THEN THE App SHALL display an error message indicating that the data could not be saved while retaining the current Transactions in the Transaction_List

### Requirement 7: Browser Compatibility

**User Story:** As a user, I want the App to run in my preferred browser, so that I can use it without installing special software.

#### Acceptance Criteria

1. THE App SHALL execute all Core_Features in the current stable versions of Chrome, Firefox, Edge, and Safari available at the time of testing, producing the expected result for each Core_Feature as defined in Requirements 1 through 5 without uncaught errors in the browser console
2. THE App SHALL operate as a standalone static web page without a backend server
3. THE App SHALL load Chart.js from a CDN
4. IF Chart.js fails to load from the CDN, THEN THE App SHALL display an error message indicating the Pie_Chart could not be loaded while all other Core_Features continue to function

### Requirement 8: Simplicity and Performance

**User Story:** As a user, I want a clean, fast interface, so that I can manage my budget without friction.

#### Acceptance Criteria

1. THE App SHALL present the Input_Form, Transaction_List, Total_Balance, and Pie_Chart on a single page without requiring navigation
2. WHEN the App loads, THE App SHALL display the Input_Form, Transaction_List, Total_Balance, and Pie_Chart within 2 seconds
3. WHEN a Transaction is added or deleted, THE App SHALL update the Transaction_List, Total_Balance, and Pie_Chart within 100 milliseconds
4. THE App SHALL maintain a minimum text contrast ratio of 4.5:1 between text and background colors

### Requirement 9: Dark/Light Mode Toggle (Optional Enhancement)

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the App comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN the user activates the theme toggle, THE App SHALL switch to the theme opposite of the currently active theme and apply the selected theme to the user interface
2. WHEN the theme is changed, THE App SHALL persist the selected theme in Local_Storage
3. WHEN the App loads and a theme is persisted in Local_Storage, THE App SHALL apply the persisted theme to the user interface
4. WHEN the App loads and no theme is persisted in Local_Storage, THE App SHALL apply the light theme as the default theme to the user interface

### Requirement 10: Sort Transactions (Optional Enhancement)

**User Story:** As a user, I want to sort my transactions by amount or category, so that I can find and compare entries easily.

#### Acceptance Criteria

1. WHERE the user selects sort by amount, THE App SHALL order the Transaction_List by amount in ascending order, with transactions of equal amount retaining their original chronological order
2. WHERE the user selects sort by category, THE App SHALL order the Transaction_List by Category in alphabetical ascending order, with transactions of the same Category retaining their original chronological order
3. WHEN the sort selection changes, THE App SHALL reorder the Transaction_List within 100 milliseconds

### Requirement 11: Monthly Summary View (Optional Enhancement)

**User Story:** As a user, I want to see a summary of my spending per month, so that I can review trends over time.

#### Acceptance Criteria

1. WHERE the monthly summary view is selected, THE App SHALL display the total spending amount for each calendar month that contains at least one Transaction, ordered chronologically from earliest to latest month
2. THE App SHALL compute the total spending for each calendar month as the sum of the amount of each Transaction in the Transaction_List grouped by the year and month of the Transaction date and time
3. IF the Transaction_List contains no Transactions, THEN THE App SHALL display a message indicating that no spending data is available
