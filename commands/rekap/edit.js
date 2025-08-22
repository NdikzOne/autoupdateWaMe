// commands/game/edit.js
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
    args,
    isPremium
}) => {
    if (!isPremium) return m.reply("❌ KHUSUS USER PREMIUM")

    // parsing input
    const input = args.join(" ").split("|").map(v => v.trim())
    if (input.length < 3 || input.some(i => i.length === 0)) {
        return m.reply("⚠️ Format salah!\nContoh: *.edit admin|dev|roll*\nSemua harus diisi!")
    }

    const [admin, dev, roll] = input
    const id = m.sender

    const infoData = JSON.parse(fs.readFileSync(infoFile))
    const gameData = JSON.parse(fs.readFileSync(gameLogFile))
    const userData = JSON.parse(fs.readFileSync(userFile))

    // update info
    infoData[id] = {
        admin: admin.toUpperCase(),
        dev: dev.toUpperCase(),
        roll: roll.toUpperCase(),
        waktu: "WIB/WITA"
    }

    fs.writeFileSync(infoFile, JSON.stringify(infoData, null, 2))

    // efek proses
    const sent = await conn.sendMessage(m.chat, {
        text: "> PROSES ⏳"
    }, {
        quoted: m
    })
    await new Promise(r => setTimeout(r, 1000))
    await conn.sendMessage(m.chat, {
        text: "> SUCCES ✓",
        edit: sent.key
    })
    await new Promise(r => setTimeout(r, 1000))

    // ambil ulang data
    const info = infoData[id]
    let output = `🗯 ADMIN : ${info.admin}\n📱 DEV : ${info.dev}\n🎲 ROLL : ${info.roll}\n🕒 WAKTU : ${info.waktu}\n\n`

    const gameLog = gameData[id] || []
    if (gameLog.length === 0) {
        output += `LW FRESH KING 🥶\n\n`
    } else {
        gameLog.forEach((g, i) => output += `GAME ${i + 1} : ${g}\n`)
        output += `\n`
    }

    const saldo = (userData[id] && userData[id].saldo) ? userData[id].saldo : {}
    const semuaNama = Object.entries(saldo)

    const positif = semuaNama
        .filter(([_, val]) => val > 0)
        .map(([nama, val]) => `${nama.toUpperCase()} ${val}`)

    const negatif = semuaNama
        .filter(([_, val]) => val < 0)
        .map(([nama, val]) => `${nama.toUpperCase()} ${val}`)

    output += `*SALDO ORKAY*:\n${positif.join("\n") || ""}\n\n`
    output += `*SALDO TUKANG COLI*:\n${negatif.join("\n") || ""}`

    await conn.sendMessage(m.chat, {
        text: output,
        edit: sent.key
    })
}

// Metadata
handler.command = ["edit"]
handler.category = "rekap"
handler.description = "Edit info admin/dev/roll user premium"
handler.premium = true

module.exports = handler