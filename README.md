Team Name:- Git Pusher's
Team Members:-
 Akshith
 Mishranth
 Narendra
 Aditya
# 🧠 AI Blockchain Query Agent

## 📌 Project Overview

The **AI Blockchain Query Agent** is a chatbot that interacts with the
**Cardano blockchain** and answers queries such as:- "What's my wallet balance?"- "Show me the last 5 transactions of this wallet."

It uses the **CardanoScan API (Preprod/Testnet)** to fetch blockchain
data and can be deployed either as:- A **Node.js Web App**, or- A **Bot** (Discord / Telegram).

------------------------------------------------------------------------

## 🚀 Features

-   ✅ Query wallet balances in real-time-   ✅ Fetch latest transactions for any wallet-   ✅ Simple chatbot interface (Web / Discord / Telegram)-   ✅ Built with modern Node.js stack-   ✅ Extensible for more blockchain queries (NFT ownership, token
    transfers, etc.)

------------------------------------------------------------------------

## 🛠️ Tech Stack

-   **Backend Framework**: Node.js (Express.js)-   **Blockchain API**: CardanoScan API (Preprod/Testnet)-   **Bot Platforms (optional)**: Discord.js / Telegram Bot API

------------------------------------------------------------------------

## ⚙️ Installation & Setup

### 1. Clone Repository

``` sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Install Dependencies

``` sh
npm install
```

### 3. Run Development Server

``` sh
npm start
```

------------------------------------------------------------------------

## 🧩 Usage

### Node.js Web App

-   Start the server with `npm start`.-   Open the app in your browser.-   Enter a wallet address.-   Ask queries like:
    -   `"What’s my wallet balance?"`    -   `"Show me the last 5 transactions of this wallet."`

### Discord/Telegram Bot (Optional)

-   Configure your bot token in `.env`.-   Run the bot service.-   Interact via commands in chat.

------------------------------------------------------------------------

## 📖 Project Structure

    .
    ├── src/
    │   ├── routes/       # API routes
    │   ├── bots/         # Discord/Telegram bot logic
    │   ├── utils/        # Helper functions
    │   └── services/     # CardanoScan API queries
    ├── public/           # Static assets (if needed)
    ├── package.json
    └── README.md

------------------------------------------------------------------------

## 🔑 Key Requirements

-   Node.js & npm installed-   A valid Cardano wallet address for testing-   Access to **CardanoScan Preprod API**-   (Optional) Bot token for Discord/Telegram deployment

------------------------------------------------------------------------

## 🚀 Future Enhancements

-   NFT ownership queries-   Transaction filtering (by token, date)-   Multi-wallet portfolio view-   Deploy as a PWA or Docker container

------------------------------------------------------------------------

## 👥 Team

- **Team Name**: Git Pushers
- **Members**: Akshith, Narendra, Mishranth, Aditya

------------------------------------------------------------------------

## 📜 License

This project is licensed under the **MIT License** -- feel free to use
and modify.


## 📄 Additional Documentation

[Download AI Blockchain Chatbot Development PDF](AI Blockchain Chatbot Development.pdf)
