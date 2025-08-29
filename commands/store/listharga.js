const axios = require("axios")

let handler = async (m, {
    text
}) => {
    try {
        const apikeyhost = env.apikeyhost
        let res = await axios.post("https://atlantich2h.com/layanan/price_list",
            new URLSearchParams({
                api_key: apikeyhost,
                type: "prabayar"
            })
        )

        let data = res.data
        if (!data.status) return m.reply(`❌ Gagal ambil price list.\nPesan: ${data.message || "unknown error"}`)

        let items = data.data

        if (!text) {
            // STEP 1: tampilkan semua kategori
            let categories = [...new Set(items.map(i => i.category.toLowerCase()))]
            let teks = `📦 *LIST CATEGORY LAYANAN* 📦\n\n`
            teks += `_Ketik .listharga <kategori> untuk lihat provider_\n\n`
            teks += categories.map(c => `• ${capitalize(c)}`).join("\n")
            return m.reply(teks)
        }

        let query = text.toLowerCase().trim()

        // cari kategori dulu (yang paling panjang match di depan)
        let categories = [...new Set(items.map(i => i.category.toLowerCase()))]
        let foundCategory = categories.find(c => query.startsWith(c))
        if (!foundCategory) {
            return m.reply(`❌ Tidak ada layanan dengan category/provider: *${text}*`)
        }

        // ambil provider (sisa text setelah kategori)
        let providerQuery = query.slice(foundCategory.length).trim()

        let inCategory = items.filter(i => i.category.toLowerCase() === foundCategory)

        if (!providerQuery) {
            // STEP 2: tampilkan provider
            let providers = [...new Set(inCategory.map(i => i.provider.toLowerCase()))]
            let teks = `📌 *Provider di kategori ${capitalize(foundCategory)}* 📌\n\n`
            teks += `_Ketik .listharga ${foundCategory} <provider> untuk lihat produk_\n\n`
            teks += providers.map(p => `• ${capitalize(p)}`).join("\n")
            return m.reply(teks)
        }

        // STEP 3: tampilkan produk dari provider
        let byProvider = inCategory.filter(i => i.provider.toLowerCase() === providerQuery)
        if (byProvider.length > 0) {
            return showProducts(m, byProvider, `${foundCategory} - ${providerQuery}`)
        }

        return m.reply(`❌ Tidak ada layanan dengan category/provider: *${text}*`)

    } catch (e) {
        console.error(e)
        return m.reply("❌ Terjadi kesalahan saat ambil data dari AtlanticH2H.")
    }
}

handler.command = ["listharga", "pricelist"]
handler.category = "store"
handler.description = "Menampilkan daftar harga berdasarkan kategori & provider"

module.exports = handler

function showProducts(m, items, keyword) {
    let teks = `📦 *LIST PRODUK ${keyword.toUpperCase()}* 📦\n\n`
    for (let item of items) {
        teks += `🔖 *${item.name}*\n`
        teks += `📌 Code: ${item.code}\n`
        teks += `💰 Harga: Rp${toRupiah(item.price)}\n`
        teks += `📝 Note: ${item.note}\n`
        teks += `📶 Status: ${item.status}\n`
        teks += `💡 Untuk order ketik: .order ${item.code} <target>\n`
        teks += `─────────────────────\n`
    }
    return m.reply(teks)
}

function toRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function capitalize(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase())
}