const fs = require('fs');
const path = require('path');
const process = require('process');
const SESSIONS_FILE = path.resolve(process.cwd(), './database/AI.json');

// --- PERBAIKAN: Mengarahkan semua file acak ke folder /tmp ---
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, {
        recursive: true
    });
}

// --- RPG Functionality for Games ---
const loadSessions = () => {
    if (!fs.existsSync(SESSIONS_FILE)) return {};
    try {
        return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
    } catch {
        return {};
    }
};
const saveSessions = (sessions) => {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
};

const handler = async (m, {
    args,
    usedPrefix,
    isOwner
}) => {
    const [mode, target] = args.map(arg => arg?.toLowerCase());

    if (!['fumi', 'assistant'].includes(mode)) {
        return m.reply(
            `Mode tidak valid. Gunakan:

• *${usedPrefix}setmode fumi*
• *${usedPrefix}setmode assistant*
• *${usedPrefix}setmode <mode> --global* (khusus Owner)`
        );
    }

    let sessions = loadSessions();

    if (target === '--global') {
        if (!isOwner) {
            return m.reply("Perintah untuk mengatur mode global hanya bisa digunakan oleh Owner.");
        }
        Object.keys(sessions).forEach(chatId => {
            if (sessions[chatId]) {
                sessions[chatId].currentMode = mode;
            }
        });
        saveSessions(sessions);
        m.reply(`✅ Mode global berhasil diubah ke *${mode.toUpperCase()}* untuk semua sesi AI.`);
    } else {
        const sessionId = m.chat;
        if (!sessions[sessionId]) {
            sessions[sessionId] = {
                currentMode: mode,
                hasBeenWelcomed: true,
                modes: {
                    fumi: {
                        history: []
                    },
                    assistant: {
                        history: []
                    }
                }
            };
        } else {
            sessions[sessionId].currentMode = mode;
        }
        saveSessions(sessions);
        m.reply(`✅ Mode AI untuk chat ini berhasil diubah menjadi *${mode.charAt(0).toUpperCase() + mode.slice(1)}*`);
    }
};

handler.command = ['setmode'];
handler.category = 'ai';
handler.description = 'Mengatur mode AI untuk chat ini.';
handler.owner = false;

module.exports = handler;
