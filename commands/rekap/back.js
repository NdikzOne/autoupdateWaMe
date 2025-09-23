// commands/game/back.js
const fs = require("fs")
const path = require("path")

// Lokasi database
const dbFolder = path.join(process.cwd(), "database")
const userFile = path.join(dbFolder, "userdata.json")
const gameLogFile = path.join(dbFolder, "gamehistory.json")

// Buat folder database kalau belum ada
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, {
        recursive: true
    })
}

// Helper buat bikin file kosong kalau belum ada
function ensureFile(file, defaultData = {}) {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(defaultData, null, 2))
    }
}

ensureFile(userFile, {})
ensureFile(gameLogFile, {})

const handler = async (m, {
    conn,
    isPremium
}) => {
    if (!isPremium) return m.reply("❌ KHUSUS USER PREMIUM")

    const userData = JSON.parse(fs.readFileSync(userFile))
    const gameData = JSON.parse(fs.readFileSync(gameLogFile))
    const id = m.sender

    if (!userData[id]) userData[id] = {}
    if (!userData[id].backupSaldo) userData[id].backupSaldo = {}
    if (!userData[id].saldo) userData[id].saldo = {}

    // Kembalikan saldo dari backup
    userData[id].saldo = {
        ...userData[id].backupSaldo
    }

    // Hapus game terakhir
    if (Array.isArray(gameData[id]) && gameData[id].length > 0) {
        gameData[id].pop()
    }

    // Simpan perubahan
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))
    fs.writeFileSync(gameLogFile, JSON.stringify(gameData, null, 2))

    await conn.sendMessage(m.chat, {
        react: {
            text: "☑️",
            key: m.key
        }
    })
}

// Metadata
handler.command = ["back"]
handler.category = "rekap"
handler.description = "Kembalikan saldo ke backup & hapus game terakhir"
handler.premium = true

module.exports = handler