# P2P File Transfer Application

A lightweight peer-to-peer (P2P) file transfer application that allows users to send and receive files directly over the network — without relying on a central server.

---

## 🚀 Features

- Peer discovery over local network using WebSockets
- File transfer via TCP/UDP sockets
- Simple and efficient file manifest management (JSON-based)
- Optional Electron-based frontend for user interface

---

## 🧰 Technologies Used

**Backend:**
- Python 3
- `websockets` library
- TCP/UDP socket programming
- JSON for manifest storage
- Multithreading / Asyncio

---

## 📁 Project Structure

```
p2p-file-transfer/
├── python-backend/
│   ├── main.py                # Main application entry point
│   ├── utils/
│   │   ├── discoverpeers.py   # Peer discovery implementation
│   │   ├── p2pnode.py         # Core P2P networking functionality
│   │   ├── websocket.py       # WebSocket implementation for peer communication
│   │   └── manifestmanager.py # File manifest management
│   └── requirements.txt       # Python dependencies
├── electron-frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── App.tsx            # Main application component
│   │   ├── App.css            # Application styling
│   │   ├── index.tsx
│   │   └── index.css
│   ├── electron/
│   │   ├── main.js            # Electron main process
│   │   └── preload.js         # Preload script for IPC
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── LICENSE
└── README.md
```
## ⚙️ Installation
```
git clone https://github.com/Huseynteymurzade28/p2p-file-transfer.git
```
```
pip install -r backend/requirements.txt
```
## 🔍 How To Use
```
cd python-backend
python main.py
```
```
cd ..
cd electron-frontend
yarn install
yarn dev
```
