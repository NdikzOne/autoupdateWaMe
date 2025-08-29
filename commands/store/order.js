const axios = require('axios')
const fs = require('fs')
const moment = require("moment-timezone")
const {
    sleep
} = require("../../functions.js")

const handler = async (m, {
    conn,
    text,
    args,
    command,
    db
}) => {
    const apikey = env.apikeyhost
    const sender = m.sender.split('@')[0]

    if (!apikey) return m.reply("⚠️ API key belum diisi di env.apikeyhost")

    if (args.length < 2) return m.reply(`❌ Format salah\n\nContoh:\n.order PLN50 08123456789`)

    let code = args[0].toUpperCase()
    let target = args[1]

    // Ref unik
    let ref = `${sender}_${Date.now()}`
    let fee = 2000

    try {
        // Ambil harga produk dulu biar tau total bayar
        let cek = await axios.post("https://atlantich2h.com/layanan/price_list",
            new URLSearchParams({
                api_key: apikey,
                type: "prabayar"
            })
        )

        let layanan = cek.data.data.find(v => v.code === code)
        if (!layanan) return m.reply(`❌ Produk dengan code *${code}* tidak ditemukan`)

        let hargaProduk = parseInt(layanan.price)
        let jumlah = hargaProduk + fee

        // === 1. Buat Deposit QR ===
        let depo = await axios.post("https://atlantich2h.com/deposit/create",
            new URLSearchParams({
                api_key: apikey,
                reff_id: ref,
                nominal: jumlah,
                type: "ewallet",
                metode: "qrisfast"
            })
        )

        if (!depo.data.status) return m.reply(`❌ Gagal buat deposit: ${depo.data.message}`)

        let dataDepo = depo.data.data
        let qr = await QRCode(dataDepo.qr_string)

        let capDepo = `── 「 DEPOSIT 」 ──

🛒 Produk: ${layanan.name}
📌 Code: ${code}
🎯 Target: ${target}

💰 Harga Produk: Rp${toRupiah(hargaProduk)}
➕ Fee: Rp${toRupiah(fee)}
📥 Total Bayar: Rp${toRupiah(jumlah)}

📌 Status: ${dataDepo.status}
🕒 Dibuat: ${dataDepo.created_at}
⏳ Expired: ${dataDepo.expired_at}

_Scan QR di atas untuk pembayaran_`

        await conn.sendMessage(m.chat, {
            image: qr,
            caption: capDepo
        }, {
            quoted: m
        })

        // === 2. Tunggu Deposit Sukses ===
        let status = dataDepo.status
        while (status !== "success") {
            await sleep(3000)
            let cekDepo = await axios.post("https://atlantich2h.com/deposit/status",
                new URLSearchParams({
                    api_key: apikey,
                    id: dataDepo.id
                })
            )
            status = cekDepo.data.data.status

            if (status == "cancel" || status == "expired") {
                return m.reply(`❌ Deposit dibatalkan/expired.`)
            }
        }

        m.reply(`✅ Deposit sukses! Melanjutkan order...`)

        // === 3. Buat Transaksi ===
        let trx = await axios.post("https://atlantich2h.com/transaksi/create",
            new URLSearchParams({
                api_key: apikey,
                code,
                reff_id: ref,
                target,
                limit_price: jumlah
            })
        )

        if (!trx.data.status) return m.reply(`❌ Gagal create transaksi: ${trx.data.message}`)
        let dataTrx = trx.data.data

        m.reply(`🛒 Transaksi diproses...\nID: ${dataTrx.id}\nStatus: ${dataTrx.status}`)

        // === 4. Cek Status Transaksi ===
        let trxStatus = dataTrx.status
        while (trxStatus !== "success" && trxStatus !== "failed") {
            await sleep(5000)
            let cekTrx = await axios.post("https://atlantich2h.com/transaksi/status",
                new URLSearchParams({
                    api_key: apikey,
                    id: dataTrx.id,
                    type: "prabayar"
                })
            )

            trxStatus = cekTrx.data.data.status

            if (trxStatus === "success") {
                let done = cekTrx.data.data
                let hasil = `✅ *TRANSAKSI SUKSES* ✅

🛒 Layanan: ${done.layanan}
📌 Code: ${done.code}
🎯 Target: ${done.target}
💰 Harga: Rp${toRupiah(done.price)}
🔑 SN: ${done.sn}
📶 Status: ${done.status}`
                return m.reply(hasil)
            }

            if (trxStatus === "failed") {
                return m.reply(`❌ Transaksi gagal. Silakan hubungi admin.`)
            }
        }

    } catch (e) {
        console.log(e)
        conn.sendMessage(env.creator, {
            text: `Terjadi eror top up ${e}`
        }, {
            quoted: m
        })
    }
}

handler.command = ["order"]
handler.category = "store"
handler.description = "Order produk otomatis dengan QR deposit"

module.exports = handler

// === Helper ===
function toRupiah(angka) {
    var saldo = ''
    var angkarev = angka.toString().split('').reverse().join('')
    for (var i = 0; i < angkarev.length; i++)
        if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.'
    return saldo.split('', saldo.length - 1).reverse().join('')
}

async function QRCode(qr) {
    const QRCode = require('qrcode')
    return await QRCode.toBuffer(qr)
}