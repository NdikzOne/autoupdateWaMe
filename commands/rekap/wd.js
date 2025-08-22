// commands/game/wd.js
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
    conn,
    isPremium
}) => {
    if (!isPremium) return m.reply("❌ Fitur ini hanya untuk Premium.")

    const userData = JSON.parse(fs.readFileSync(userFile))
    const allInfo = JSON.parse(fs.readFileSync(infoFile))

    const id = m.sender
    if (!userData[id]) userData[id] = {}
    userData[id].saldo = userData[id].saldo || {}

    const info = allInfo[id] || {
        admin: "-",
        dev: "-",
        roll: "-",
        waktu: "WIB/WITA"
    }

    // Ambil semua saldo user
    const semuaNama = Object.entries(userData[id].saldo)

    if (!semuaNama.length) {
        return m.reply("ATM :\n(Kosong)")
    }

    const positif = semuaNama
        .filter(([_, saldo]) => saldo > 0)
        .map(([nama, saldo]) => `${nama} ${saldo}`)

    const negatif = semuaNama
        .filter(([namalf, saldo]) => saldo <= 0)
        .map(([namalf, saldo]) => `${namalf} ${saldo}`)

    let out = `🗯 ADMIN : ${info.admin}\n📱 DEV : ${info.dev}\n🎲 ROLL : ${info.roll}\n🕒 WAKTU : ${info.waktu}\n\n`

    out += `*SALDO ORKAY*:\n${positif.join("\n") || "-"}\n\n`
    out += `*SALDO MINUS*:\n${negatif.join("\n") || "-"}`

    m.reply(out)
}

// Metadata
handler.command = ["wd"]
handler.category = "rekap"
handler.description = "Cek saldo pemain"
handler.premium = true

module.exports = handler