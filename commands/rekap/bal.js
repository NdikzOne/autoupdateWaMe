const env = require("../../settings.js")

const handler = async (m, {
    text
}) => {
    if (!m.quoted || !m.quoted.text) {
        return m.reply("❌ Harap reply pesan dengan format data yang valid!");
    }

    const lines = m.quoted.text.split("\n").filter(l => l.trim() !== "")
    let kecil = []
    let besar = []
    let totalKecil = 0
    let totalBesar = 0
    let kategori = null

    for (let line of lines) {
        if (/^k(?:ecil)?\s*:/i.test(line)) {
            kategori = "kecil"
            continue
        }
        if (/^b(?:esar)?\s*:/i.test(line)) {
            kategori = "besar"
            continue
        }

        if (kategori) {
            const match = line.match(/(\d+)\s*(A|P|LF)?/i)
            if (match) {
                const angka = parseInt(match[1])
                if (kategori === "kecil") {
                    kecil.push(angka)
                    totalKecil += angka
                }
                if (kategori === "besar") {
                    besar.push(angka)
                    totalBesar += angka
                }
            }
        }
    }

    const totalSaldo = totalKecil + totalBesar

    // Emoji random
    const emojiSets = {
        kecil: ["🦭", "🌸", "🪷", "🪽", "🎀"],
        besar: ["🐲", "🦄", "🦁", "🐅", "🦊"],
        balance: ["💳", "💰", "🏦", "📊", "🪙", "💵", "🤑", "🎰"]
    }
    const pick = arr => arr[Math.floor(Math.random() * arr.length)]

    let statusLine = ""
    let rollLine = ""

    if (totalKecil > totalBesar) {
        statusLine = "✖️ TIDAK SEIMBANG"
        rollLine = `*B -${totalKecil - totalBesar}* ROLL IN FAST`
    } else if (totalKecil < totalBesar) {
        statusLine = "✖️ TIDAK SEIMBANG"
        rollLine = `*K -${totalBesar - totalKecil}* ROLL IN FAST`
    } else {
        statusLine = "✔️ SEIMBANG"
    }

    let out = `${pick(emojiSets.kecil)} *KECIL (K)*: ${kecil.join(", ") || "Belum Ada Pick"} : *${totalKecil}*\n\n`
    out += `${pick(emojiSets.besar)} *BESAR (B)*: ${besar.join(", ") || "Belum Ada Pick"} : *${totalBesar}*\n\n`
    out += `*${pick(emojiSets.balance)} Saldo ATM : ${totalSaldo}*\n`
    out += `*${statusLine}*\n`
    out += `© ${env.ownerName}`

    await m.reply(out)

    if (rollLine) {
        await m.reply(rollLine)
    }
}

handler.command = ["bal"]
handler.category = "rekap"
handler.description = "Cek balance kecil vs besar dari data quoted"
handler.premium = true

module.exports = handler