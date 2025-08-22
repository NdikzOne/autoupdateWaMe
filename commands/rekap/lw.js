const fs = require("fs")
const path = require("path")

// Lokasi database
const dbFolder = path.join(process.cwd(), "database")
const userFile = path.join(dbFolder, "userdata.json")
const gameLogFile = path.join(dbFolder, "gamehistory.json")
const infoFile = path.join(dbFolder, "info.json")

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
ensureFile(infoFile, {})

const handler = async (m, {
    isPremium
}) => {
    if (!isPremium) return m.reply("❌ Fitur ini hanya untuk Premium.")

    const userData = JSON.parse(fs.readFileSync(userFile))
    const gameLog = JSON.parse(fs.readFileSync(gameLogFile))
    const allInfo = JSON.parse(fs.readFileSync(infoFile))

    const id = m.sender
    const info = allInfo[id] || {
        admin: "-",
        dev: "-",
        roll: "-",
        waktu: "WIB/WITA"
    }

    // Header info
    let out = `🗯 ADMIN : ${info.admin}\n📱 DEV : ${info.dev}\n🎲 ROLL : ${info.roll}\n🕡 WAKTU : ${info.waktu}\n\n`

    // History game
    const games = gameLog[id] || []
    if (games.length === 0) {
        out += `LW FRESH KING 🥶.\n\n`
    } else {
        for (let i = 0; i < games.length; i++) {
            out += `GAME ${i + 1} : ${games[i]}\n`
        }
        out += `\n`
    }

    // Saldo user
    const saldo = (userData[id] && userData[id].saldo) ? userData[id].saldo : {}
    const semuaNama = Object.entries(saldo)

    const positif = semuaNama
        .filter(([_, val]) => val > 0)
        .map(([nama, val]) => `${nama.toUpperCase()} ${val}`)

    const negatif = semuaNama
        .filter(([_, val]) => val < 0)
        .map(([nama, val]) => `${nama.toUpperCase()} ${val}`)

    out += `*SALDO ORKAY*:\n${positif.join("\n") || ""}\n\n`
    out += `*SALDO TUKANG COLI*:\n${negatif.join("\n") || ""}`

    m.reply(out)
}

// Metadata
handler.command = ["lw"]
handler.category = "rekap"
handler.description = "Lihat history game & saldo user"
handler.premium = true

module.exports = handler