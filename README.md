# SyncBook | Premium WhatsApp Booking Engine

SyncBook is a modern, premium, glassmorphic client-side Booking System designed to collect client details and project parameters and direct them straight to your WhatsApp using the official click-to-chat API. It requires no backend server, PHP, or database.

## Features

- **Modern Glassmorphism UI**: Backdrop filters, mesh gradient animation layers, and smooth CSS transitions.
- **Dark/Light Mode**: Full CSS custom properties variables theme toggling with localStorage state recall.
- **Step Wizard Engine**: 3-step progressive layout separating Contact Info, Project Specs, and Scope details.
- **Dynamic Receipt Ticket**: A real-time live preview of the client's information rendering like a premium ticket or invoice, indicating form completion progress.
- **Custom Dropdown Selects**: Modern fully custom select interfaces styled to match the dark/light premium aesthetic.
- **Draft Auto-Save**: Saves client details locally in real-time. If the client accidentally closes or reloads the tab, they can resume their session instantly.
- **Modal Confirmation Screen**: Prompts clients to verify their detailed specifications before redirecting to WhatsApp.
- **Toast Alerts**: Lightweight system confirmations for theme switches, file attachments, and errors.
- **Drag & Drop Mock Zone**: Visual mock-up area for clients to drag in project brief files.

---

## Folder Structure

```text
premium-booking-system/
├── index.html     # Semantic HTML structural wizard
├── style.css      # Custom stylesheet (variables, glassmorphism, responsive grids, keyframes)
├── script.js     # Step actions, validation, sync checks, local storage, WhatsApp redirect
└── README.md      # User guide and configurations
```

---

## How to Configure the Recipient WhatsApp Number

To change the WhatsApp number that receives the booking notifications:

1. Open the [script.js](file:///C:/Users/SK%20MD%20SAMIM/.gemini/antigravity/scratch/premium-booking-system/script.js) file.
2. Locate the configuration variable at the top of the file:
   ```javascript
   // Change this number to your official business phone number (with country code, no "+" or spaces)
   const WHATSAPP_PHONE = "919876543210"; 
   ```
3. Replace the placeholder number `919876543210` with your desired phone number. Ensure it contains the country code without leading `+` or `00`, and contains no spaces, dashes, or parentheses.
   - Example (India): `"91XXXXXXXXXX"`
   - Example (US): `"1XXXXXXXXXX"`
   - Example (UK): `"44XXXXXXXXXX"`
4. Save the file.

---

## How to Run the Project Locally

The project is serverless and runs entirely in the browser.

1. Double-click the `index.html` file to open it directly in any modern web browser (Chrome, Firefox, Safari, Edge).
2. Alternatively, you can serve it using a lightweight local web server:
   - If you have Python installed:
     ```bash
     python -m http.server 8000
     ```
     Then navigate to `http://localhost:8000` in your browser.
   - Or use VS Code's "Live Server" extension.

---

## Accessibility Compliance

- **Keyboard Support**: Elements like custom selects are assigned `tabindex="0"` for keyboard tabbing, and submit elements feature focus rings.
- **Semantic Tags**: Utilizes standard `<header>`, `<main>`, `<section>`, `<aside>`, and `<form>` containers.
- **Aria Labels**: Toggle controls feature explicit `aria-label` definitions for screen readers.
