# 🎵 SpotiMigrate  
### _Migrate your Spotify playlists to YouTube Music with ease — powered by FastAPI, Next.js, LangChain & Gemini_

SpotiMigrate is a full-stack web application that allows users to seamlessly migrate Spotify playlists to YouTube Music.  
It also includes an AI-powered playlist generator using **LangChain + Google Gemini**, enabling users to generate playlists based on **genre** and **mood** and directly create them on YouTube Music.

---

## 🚀 Features

### 🔑 OAuth2 Authentication  
- Spotify OAuth2  
- YouTube OAuth2  
- Secure login flows for both providers  

### 🎧 Playlist Migration  
- Fetch user’s Spotify playlists  
- Select any playlist from the UI  
- Automatically recreate it on YouTube Music  
- Handles missing tracks gracefully

### 🤖 AI-Generated Playlists  
- Powered by **LangChain + Google Gemini**  
- Users select **genre** + **mood**  
- AI suggests playlists with multiple tracks  
- Directly create the playlist on YouTube Music

### ⚡ Modern Full-Stack Setup  
- **Frontend:** Next.js + Tailwind + shadcn UI  
- **Backend:** FastAPI  
- **AI Engine:** LangChain + Gemini  

---

## 🛠️ Tech Stack

### **Frontend**
- Next.js  
- TypeScript  
- TailwindCSS  
- shadcn/ui  

### **Backend**
- FastAPI  
- OAuth2 flows (Spotify + YouTube)  
- Google API Python Client  
- LangChain  
- Gemini model  

---

## 📦 Installation

### 🔧 Clone the repo
```bash
git clone https://github.com/aniketboghum/SpotiMigrate.git
cd SpotiMigrate

