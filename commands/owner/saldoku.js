const moment = require("moment-timezone")
const axios = require("axios")
const fs = require("fs")
const {
    fetchJson,
    sleep
} = require("../../functions.js")

const handler = async (m, {
    conn,
    text,
    args,
    usedPrefix,
    command,
    cmd,
    isOwner,
    db,
    groupMetadata
}) => {
    const apikeyhost = env.apikeyhost // APIKEY dari environment
    const sender = m.sender.split('@')[0]

    if (!apikeyhost || apikeyhost.trim() === '') {
        return m.reply('❌ API key host kosong, set dulu di `env.apikeyhost`.')
    }

    try {
        let config = {
            method: "POST",
            url: "https://atlantich2h.com/get_profile",
            data: new URLSearchParams({
                api_key: apikeyhost
            })
        }

        let res = await axios(config)

        if (!res.data || res.data.status != "true") {
            return m.reply(`❌ Gagal ambil profile: ${res.data?.message || "unknown error"}`)
        }

        const p = res.data.data
        const info = `── 「 👤 PROFILE 」 ──

✨ *Name:* ${p.name}
👤 *Username:* ${p.username}
📧 *Email:* ${p.email}
📱 *Phone:* ${p.phone}
💰 *Balance:* Rp${toRupiah(p.balance)}
📌 *Status:* ${p.status}`

        await conn.sendMessage(m.chat, {
            text: info
        }, {
            quoted: m
        })
    } catch (e) {
        console.error(e)
        m.reply("❌ Error saat mengambil profile.")
    }
}

handler.command = ["saldoku"]
handler.category = "owner"
handler.owner = true
handler.description = "Melihat profile akun H2H"

module.exports = handler

// Helper format rupiah
function toRupiah(angka) {
    if (isNaN(angka)) return angka
    var saldo = ''
    var angkarev = angka.toString().split('').reverse().join('')
    for (var i = 0; i < angkarev.length; i++)
        if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.'
    return saldo.split('', saldo.length - 1).reverse().join('')
}