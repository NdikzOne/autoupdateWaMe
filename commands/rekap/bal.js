const handler = async (m) => {
    if (!m.quoted || !m.quoted.text) {
        return m.reply('❌ Balas pesan yang berisi rekap angka dengan dua kategori.')
    }

    const lines = m.quoted.text.trim().split('\n')

    let kategori1 = ''
    let kategori2 = ''
    let angka1 = []
    let angka2 = []
    let kategoriSekarang = null

    for (let line of lines) {
        line = line.trim()

        const kategoriMatch = line.match(/^(.+?)\s*:\s*$/) // baris kategori
        if (kategoriMatch) {
            const namaKategori = kategoriMatch[1].trim()
            if (!kategori1) {
                kategori1 = namaKategori
                kategoriSekarang = 'k1'
            } else if (!kategori2) {
                kategori2 = namaKategori
                kategoriSekarang = 'k2'
            } else {
                kategoriSekarang = null // kategori ketiga diabaikan
            }
            continue
        }

        // ambil angka dalam kategori aktif
        if (kategoriSekarang) {
            const matchAngka = line.match(/\d+/g)
            if (matchAngka) {
                const angka = matchAngka.map(v => parseInt(v))
                if (kategoriSekarang === 'k1') angka1.push(...angka)
                if (kategoriSekarang === 'k2') angka2.push(...angka)
            }
        }
    }

    const total1 = angka1.reduce((a, b) => a + b, 0)
    const total2 = angka2.reduce((a, b) => a + b, 0)
    const totalSemua = total1 + total2

    const isImbang = total1 === total2
    const selisih = Math.abs(total1 - total2)
    const saldoStr = `${totalSemua}K` + (totalSemua > 30 ? ' 🔥' : '')

    let output = `🐠 *${kategori1}*: [ ${angka1.join(', ')} ] : *${total1}*\n`
    output += `🐠 *${kategori2}*: [ ${angka2.join(', ')} ] : *${total2}*\n`

    if (isImbang) {
        output += `🐝 *${kategori1}* DAN *${kategori2}* SEIMBANG !!\n`
    } else {
        const rendah = total1 < total2 ? kategori1 : kategori2
        const tinggi = total1 > total2 ? kategori1 : kategori2
        output += `🐝 *${rendah.toUpperCase()}* - *(${selisih})K* DARI *${tinggi.toUpperCase()}*\n\n`
    }

    output += `💰 Total Saldo Game Ini: ${saldoStr}`
    m.reply(output)
}

handler.command = ["bal"]
handler.category = "rekap"
handler.description = "Hitung balance / total angka dari 2 kategori dalam game"

module.exports = handler