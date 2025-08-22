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

const getFee = (n) => Math.floor(n / 10) + 1

const handler = async (m, {
    conn,
    args,
    command,
    isPremium
}) => {
    if (!isPremium) return m.reply("❌ Fitur ini hanya untuk Premium.")
    if (!args[0]) return m.reply("❗ Gunakan: *.winb 42* atau *.wink 26*")
    if (isNaN(args[0])) return m.reply("❗ Argumen harus berupa angka.")
    if (!m.quoted || !m.quoted.text) return m.reply("❗ Reply pesan berisi data taruhan.")

    const winner = command === "winb" ? "B" : "K"
    const skor = parseInt(args[0])

    const userData = JSON.parse(fs.readFileSync(userFile))
    const gameLog = JSON.parse(fs.readFileSync(gameLogFile))
    const allInfo = JSON.parse(fs.readFileSync(infoFile))

    const id = m.sender
    if (!userData[id]) userData[id] = {}
    userData[id].saldo = userData[id].saldo || {}
    userData[id].pernahLF = userData[id].pernahLF || {}

    const info = allInfo[id] || {
        admin: "-",
        dev: "-",
        roll: "-",
        waktu: "WIB/WITA"
    }

    const lines = m.quoted.text.split("\n")
    let current = ""
    let data = {
        B: [],
        K: []
    }

    for (let line of lines) {
        if (/^b\s*:?\s*$/i.test(line)) {
            current = "B";
            continue
        }
        if (/^k\s*:?\s*$/i.test(line)) {
            current = "K";
            continue
        }

        const match = line.trim().match(/^([^\d]+)\s+(\d+)(\w*)$/i)
        if (!match || !current) continue

        let [, nama, angkaStr, huruf] = match
        nama = nama.trim().toUpperCase()
        const angka = parseInt(angkaStr)
        huruf = huruf?.toLowerCase() || ""

        if (huruf === "lf") {
            userData[id].pernahLF[nama] = true
        }

        data[current].push({
            nama,
            angka,
            huruf
        })
    }

    // Backup saldo
    userData[id].backupSaldo = JSON.parse(JSON.stringify(userData[id].saldo))

    // Hitung saldo
    for (let team of ["B", "K"]) {
        const menang = team === winner
        for (let {
                nama,
                angka,
                huruf
            }
            of data[team]) {
            const fee = getFee(angka)
            const sAwal = userData[id].saldo[nama] ?? 0
            let sAkhir = 0

            if (menang) {
                if (huruf) {
                    sAkhir = sAwal + (angka - fee)
                } else {
                    sAkhir = sAwal > 0 ? sAwal + (angka - fee) : angka * 2 - fee
                }
            } else {
                if (huruf === "lf") {
                    sAkhir = sAwal - angka
                } else {
                    sAkhir = sAwal - angka
                    if (sAwal <= 0) sAkhir = 0
                    if (sAkhir < 0) sAkhir = 0
                }
            }
            userData[id].saldo[nama] = sAkhir
        }
    }

    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2))

    // Simpan game log
    if (!gameLog[id]) gameLog[id] = []
    if (gameLog[id].length < 30) {
        gameLog[id].push(`${winner} ${skor}`)
        fs.writeFileSync(gameLogFile, JSON.stringify(gameLog, null, 2))
    }

    // Format hasil
    let out = `🗯 ADMIN : ${info.admin}\n📱 DEV : ${info.dev}\n🎲 ROLL : ${info.roll}\n🕒 WAKTU : ${info.waktu}\n\n`

    for (let i = 0; i < gameLog[id].length; i++) {
        out += `GAME ${i + 1} : ${gameLog[id][i]}\n`
    }

    const semuaNama = Object.entries(userData[id].saldo)

    const positif = semuaNama
        .filter(([_, saldo]) => saldo > 0)
        .map(([nama, saldo]) => `${nama} ${saldo}`)

    const negatif = semuaNama
        .filter(([namalf, saldo]) => saldo < 0 && userData[id].pernahLF?.[namalf])
        .map(([namalf, saldo]) => `${namalf} ${saldo}`)

    out += `\n*SALDO ORKAY*:\n${positif.join("\n") || ""}\n\n`
    out += `*SALDO TUKANG COLI*:\n${negatif.join("\n") || ""}`

    m.reply(out)
}

// Metadata
handler.command = ["winb", "wink"]
handler.category = "rekap"
handler.description = "Hitung pemenang game B/K dan update saldo user"
handler.premium = true

module.exports = handler