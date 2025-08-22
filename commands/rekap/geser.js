// commands/game/geser.js
const fs = require("fs")
const path = require("path")

// Lokasi database
const dbFolder = path.join(process.cwd(), "database")
const userFile = path.join(dbFolder, "userdata.json")

// Bikin folder & file kalau belum ada
if (!fs.existsSync(dbFolder)) fs.mkdirSync(dbFolder, {
    recursive: true
})
if (!fs.existsSync(userFile)) fs.writeFileSync(userFile, JSON.stringify({}, null, 2))

const handler = async (m, {
    conn,
    isPremium,
    args
}) => {
    if (!isPremium) return m.reply("❌ KHUSUS PREMIUM")

    const [dariRaw, jumlahStr, keRaw] = args
    if (!dariRaw || !jumlahStr || !keRaw) {
        return m.reply("❗ Format: *.geser robi 100 rizki*")
    }

    const dari = dariRaw.trim().toUpperCase()
    const ke = keRaw.trim().toUpperCase()
    const jumlah = parseInt(jumlahStr)

    if (isNaN(jumlah) || jumlah <= 0) return m.reply("❗ Jumlah tidak valid.")

    const userData = JSON.parse(fs.readFileSync(userFile))
    const id = m.sender

    if (!userData[id]) userData[id] = {}
    if (!userData[id].saldo) userData[id].saldo = {}

    const saldoPengirim = userData[id].saldo[dari] || 0
    if (saldoPengirim < jumlah) return m.reply(`❌ Saldo ${dari} tidak cukup.`)

    // Proses geser
    userData[id].saldo[dari] -= jumlah
    userData[id].saldo[ke] = (userData[id].saldo[ke] || 0) + jumlah

    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))

    // Animasi loading edit
    const loadingSteps = ["•-----", "••----", "•••---", "••••--", "•••••-", "••••••"]
    const pesanAwal = await conn.sendMessage(m.chat, {
        text: loadingSteps[0]
    }, {
        quoted: m
    })

    for (let i = 1; i < loadingSteps.length; i++) {
        await new Promise(r => setTimeout(r, 200))
        await conn.sendMessage(m.chat, {
            text: loadingSteps[i],
            edit: pesanAwal.key
        })
    }

    const saldoPenerima = userData[id].saldo[ke]
    const saldoAkhirPengirim = userData[id].saldo[dari]

    const hasil = `✅ *SUKSES MENGGESER*\n\n${jumlah} dari *${dari}* ➝ *${ke}*\n\n📌 Saldo ${ke} : ${saldoPenerima}\n📌 Saldo ${dari} : ${saldoAkhirPengirim}`

    await new Promise(r => setTimeout(r, 300))
    await conn.sendMessage(m.chat, {
        text: hasil,
        edit: pesanAwal.key
    })
}

// Metadata
handler.command = ["geser"]
handler.category = "rekap"
handler.description = "Geser saldo dari 1 akun ke akun lain"
handler.premium = true

module.exports = handler