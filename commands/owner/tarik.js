// commands/owner/tarik.js
const axios = require('axios')
const fs = require('fs')

let handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command,
    isOwner
}) => {
    if (!isOwner) throw `Khusus owner!`

    // Format perintah: /tarik KODEBANK NOMOR_REKENING NAMA_PEMILIK NOMINAL
    let [bank, norek, nama, nominal] = args
    if (!bank || !norek || !nama || !nominal) {
        throw `Contoh penggunaan:\n${usedPrefix + command} BNI 0123456789 JohnDoe 100000`
    }

    let ref = 'WD' + Date.now()
    let h2hkey = env.apikeyhost // pastikan ada di .env

    try {
        let res = await axios('https://atlantich2h.com/transfer/create', {
            method: 'POST',
            data: new URLSearchParams(Object.entries({
                api_key: h2hkey,
                ref_id: ref,
                kode_bank: bank, // ambil dari /transfer/bank_list
                nomor_akun: norek,
                nama_pemilik: nama,
                nominal: nominal,
                email: 'owner@example.com', // bisa di-hardcode
                phone: '08123456789', // bisa di-hardcode
                note: `Withdraw saldo bot (${ref})`
            }))
        })

        let json = res.data
        if (json.status == false) {
            return m.reply(`❌ Gagal: ${json.message}`)
        }

        if (json.status == true) {
            let d = json.data
            let sukses = `*── 「 WITHDRAW 」 ──*

🆔 ID: ${d.id}
🔖 Reff ID: ${d.reff_id}
🏦 Bank: ${bank}
👤 Nama: ${d.nama}
💳 Rekening: ${d.nomor_tujuan}
💰 Nominal: Rp${d.nominal}
💸 Fee: Rp${d.fee}
📦 Total: Rp${d.total}
📌 Status: ${d.status}
🕒 Dibuat: ${d.created_at}

✅ Tarik saldo berhasil diproses.`
            m.reply(sukses)
        }
    } catch (e) {
        console.error(e)
        m.reply('⚠️ Terjadi error saat proses tarik saldo (403/Forbidden atau API salah).')
    }
}

handler.command = ["tarik"];
handler.owner = true
handler.category = 'owner'
handler.description = 'Tarik saldo bot ke rekening bank (khusus owner)'

module.exports = handler