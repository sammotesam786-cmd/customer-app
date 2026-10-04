# Kindred Customer Book

A small customer manager for keeping contact details in one place. This Day 1 project focuses on the core create, read, update, and delete (CRUD) workflow.

## Technologies

- React 19 for the interactive interface
- TypeScript for the customer and form data types
- Vite for local development and production builds
- Browser `localStorage` for saving data on this device
- CSS for the responsive layout

There is no hosted database or backend server in this version. It does not need API keys or an `.env` file.

## Features

- Add a customer with name, phone, email, and city
- View the full customer list
- Edit or delete a customer
- Search by name, phone, email, or city
- Validate required fields, email format, and phone number length
- Keep customer records after refreshing the page
- Use the interface on desktop or mobile

## Run the app

You need Node.js and npm installed. In VS Code:

1. Open this project folder.
2. Open **Terminal > New Terminal**.
3. Install the project packages (only needed the first time):

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL printed in the terminal, usually `http://localhost:5173`.
6. To stop the server later, click the terminal and press `Ctrl+C`.

Before sharing changes, you can check the production build with `npm run build`.

## Try the app

1. Select **Add customer** and enter all four fields. For example: Jordan Lee, `+1 555 012 3456`, `jordan@example.com`, Seattle.
2. Try saving with a missing field or invalid email to see the validation messages.
3. Search for the customer by a name, part of the phone number, email, or city.
4. Use the pencil button to edit the record.
5. Use the trash button and confirm to delete it.
6. Refresh the page. Records remain in the same browser because the app uses `localStorage`.

## Data structure

There is no SQL database in this version. Each record is a JSON object stored in the browser under the key `customer-book.customers`:

```ts
type Customer = {
  id: string
  name: string
  phone: string
  email: string
  city: string
  createdAt: string
}
```

To inspect or clear local data in Chrome or Edge, open Developer Tools > **Application** > **Local Storage** > the app's local address. Clearing browser storage deletes the saved customers. Data does not sync to another browser or device.

## Project map

- `src/App.tsx` contains the customer type, validation, search, CRUD actions, and page markup.
- `src/App.css` contains the directory, table, dialog, and responsive styles.
- `src/index.css` contains shared page styles and keyboard focus treatment.
- `src/main.tsx` starts the React app in the page.

## What I learned

- How a React component uses state to keep the screen in sync with data
- How TypeScript describes a customer record and catches mismatched values
- How to validate a form before saving
- How to filter a list as a search term changes
- How browser `localStorage` can preserve data between page refreshes

## Problems faced

The first package installation was interrupted. Running `npm install --no-audit --no-fund` again completed setup. A browser-only storage approach was chosen to keep this first version simple; a shared multi-user app would need a backend and database.

