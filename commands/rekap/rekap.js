const handler = async (m, {
    text
}) => {
    if (!m.quoted || !m.quoted.text) {
        return m.reply("❌ Harap reply pesan dengan format data yang valid!")
    }

    // Daftar emoji random
    const emojis = ['👻', '💀', '👹', '🧛', '🧟‍♂️', '🕷️', '🤑🪦', '🔮', '🦹‍♂', '🥶', '🐼', '🦚', '👁‍🗨', '👽', '☠️', '💐', '🦄', '🐰', '🐇', '💦', '👨🏼‍🏫', '😈', '🥵', '🐺', '🦊', '🦓', '🐶', '🦡', '🐸', '🐉', '🦅', '🕊', '🐋', '🐳', '🐡', '🦀', '🐙', '🐚', '🐛', '🦞', '🐌', '🦑', '🦋', '🐞', '🐝', '🦗', '🦂', '🐜']

    const getFee = (n) => Math.floor(n / 10) + 1

    const lines = m.quoted.text.split("\n").filter(line => line.trim() !== "")
    const dataKategori = {}
    const feeKategori = {}
    let currentKategori = null

    for (let line of lines) {
        const isKategori = /^.+:\s*$/i.test(line.trim())
        if (isKategori) {
            currentKategori = line.trim().slice(0, -1).trim()
            dataKategori[currentKategori] = []
            feeKategori[currentKategori] = 0
            continue
        }

        if (currentKategori) {
            const match = line.match(/^([^\d]*?)(\d+)(\w*)$/)
            if (match) {
                const nama = (match[1] || "").trim().toUpperCase()
                const angkaAwal = parseInt(match[2])
                const tambahanHuruf = (match[3] || "").trim()

                const biaya = getFee(angkaAwal)
                feeKategori[currentKategori] += biaya

                const isTambahan = tambahanHuruf.length > 0
                const angkaAkhir = isTambahan ? angkaAwal - biaya : angkaAwal * 2 - biaya

                dataKategori[currentKategori].push({
                    nama,
                    angkaAwal,
                    angkaAkhir,
                    tambahanHuruf
                })
            }
        }
    }

    const kategoriKeys = Object.keys(dataKategori)
    if (kategoriKeys.length !== 2) {
        return m.reply("❌ Harus ada tepat *2 kategori*. Contoh format:\n\nTEAM1:\nNAMA 100\n...\n\nTEAM2:\nNAMA 300P\n...")
    }

    const formatHasil = (data) => {
        return data.map(item =>
            `${item.nama} ${item.angkaAwal} \\ ${item.angkaAkhir} ${item.tambahanHuruf || ""}`.trim()
        ).join("\n")
    }

    let hasilOutput = ""
    let feeOutput = ""
    let totalFee = 0

    for (let kategori of kategoriKeys) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)]
        hasilOutput += `${emoji} *${kategori.toUpperCase()}*:\n`
        hasilOutput += formatHasil(dataKategori[kategori]) || "Tidak ada"
        hasilOutput += `\n`
        const fee = feeKategori[kategori]
        feeOutput += `💸 Fee ${kategori.toUpperCase()} : ${fee}\n`
        totalFee += fee
    }

    hasilOutput += `${feeOutput}💰 *TOTAL FEE YANG ANDA DAPAT: ${totalFee}*`
    m.reply(hasilOutput.trim())
}

handler.command = ["win", "rekap", "fee"]
handler.category = "rekap"
handler.description = "Rekap hasil permainan dan hitung fee otomatis"

module.exports = handler