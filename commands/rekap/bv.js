const env = require("../../settings.js")

const handler = async (m, {
    text
}) => {
    if (!m.quoted || !m.quoted.text) {
        return m.reply("❌ Harap reply pesan dengan format data yang valid!");
    }

    const lines = m.quoted.text.split("\n").filter(l => l.trim() !== "")
    let kategoriData = {}
    let totalSaldo = 0
    let currentKategori = null

    for (let line of lines) {
        const kategoriMatch = line.match(/^(.+?)\s*:/)
        if (kategoriMatch) {
            currentKategori = kategoriMatch[1].trim()
            kategoriData[currentKategori] = []
        } else if (currentKategori) {
            const angkaMatch = line.match(/(\d+)\s*(A|P|LF)?/i)
            if (angkaMatch) {
                const angka = parseInt(angkaMatch[1])
                kategoriData[currentKategori].push(angka)
                totalSaldo += angka
            }
        }
    }

    let output = Object.entries(kategoriData).map(([nama, angkaList]) => {
        const jumlah = angkaList.reduce((a, b) => a + b, 0)
        return `📊 *${nama.toUpperCase()}* : ${angkaList.join(", ") || "Belum Ada Pick"} : *${jumlah}*\n`
    }).join("\n")

    const kategoriKeys = Object.keys(kategoriData)
    let status = ""
    if (kategoriKeys.length === 2) {
        const sum1 = kategoriData[kategoriKeys[0]].reduce((a, b) => a + b, 0)
        const sum2 = kategoriData[kategoriKeys[1]].reduce((a, b) => a + b, 0)
        if (sum1 > sum2) {
            status = `‼️ *${kategoriKeys[1]} Kurang ${sum1 - sum2} Agar Seimbang Dengan ${kategoriKeys[0]}*`
        } else if (sum1 < sum2) {
            status = `‼️ *${kategoriKeys[0]} Kurang ${sum2 - sum1} Agar Seimbang Dengan ${kategoriKeys[1]}*`
        } else {
            status = `⚖️ *Seimbang!* ${kategoriKeys[0]} Dan ${kategoriKeys[1]} Sama.`
        }
    }

    output += `\n${status}\n💰 *Total Saldo Saat Ini: ${totalSaldo}*\n\n© ${env.ownerName}`

    m.reply(output.trim())
}

handler.command = ["balv", "bv"]
handler.category = "rekap"
handler.description = "Cek balance fleksibel dari banyak kategori"
handler.premium = true

module.exports = handler