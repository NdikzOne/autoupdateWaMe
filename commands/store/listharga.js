const axios = require("axios")
const {
    generateWAMessageFromContent
} = require("baileys")

let handler = async (m, {
    text,
    conn
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
            // Tampilkan semua kategori dengan button
            let categories = [...new Set(items.map(i => i.category.toLowerCase()))]
            let sections = categories.map(category => ({
                title: `🎯 ${capitalize(category)}`,
                rows: [{
                    header: `Kategori ${capitalize(category)}`,
                    title: `📂 ${capitalize(category)}`,
                    description: `Klik untuk melihat provider di kategori ${capitalize(category)}`,
                    id: `.listharga ${category}`
                }]
            }))

            const txt = `🏪 *ATLANTIC H2H - LIST CATEGORY* 🏪

📊 Total Kategori: ${categories.length}
💫 Total Layanan: ${items.length}

Pilih kategori di bawah untuk melihat provider yang tersedia:`

            const msg = generateWAMessageFromContent(
                m.chat, {
                    interactiveMessage: {
                        body: {
                            text: txt
                        },
                        footer: {
                            text: `📝 Catatan: Harga dapat berubah sewaktu-waktu • Powered by ${env.ownerName || 'AtlanticH2H'}`
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "📂 PILIH KATEGORI",
                                    sections: sections,
                                    has_multiple_buttons: true
                                })
                            }],
                            messageParamsJson: JSON.stringify({
                                limited_time_offer: {},
                                bottom_sheet: {
                                    in_thread_buttons_limit: 0,
                                    divider_indices: [999],
                                    list_title: "📋 Kategori Layanan",
                                    button_title: "📂 PILIH KATEGORI"
                                },
                                tap_target_configuration: {
                                    title: "Kategori Layanan",
                                    description: "Pilih kategori yang ingin dilihat",
                                    canonical_url: env.domain || "https://atlantich2h.com",
                                    domain: "",
                                    button_index: 0
                                }
                            })
                        },
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            externalAdReply: {
                                title: `${env.nameBot || 'AtlanticH2H'} Price List`,
                                body: `Hi, ${m.pushName || 'User'}! Pilih kategori`,
                                mediaType: 1,
                                thumbnailUrl: env.thumb || env.thumb2,
                                sourceUrl: env.domain || "https://atlantich2h.com",
                                renderLargerThumbnail: true
                            }
                        }
                    }
                }, {
                    userJid: m.sender,
                    quoted: m
                }
            )
            await conn.relayMessage(m.chat, msg.message, {
                messageId: msg.key.id
            })
            return
        }

        let query = text.toLowerCase().trim()
        let categories = [...new Set(items.map(i => i.category.toLowerCase()))]
        let foundCategory = categories.find(c => query.startsWith(c))

        if (!foundCategory) {
            return m.reply(`❌ Kategori tidak ditemukan: *${text}*

💡 Gunakan command tanpa teks untuk melihat semua kategori:
• .listharga
• .pricelist`)
        }

        let providerQuery = query.slice(foundCategory.length).trim()
        let inCategory = items.filter(i => i.category.toLowerCase() === foundCategory)

        if (!providerQuery) {
            // Tampilkan provider dalam kategori
            let providers = [...new Set(inCategory.map(i => i.provider?.toLowerCase() || i.layanan.toLowerCase()))]
            let sections = providers.map(provider => ({
                title: `🏷️ ${capitalize(provider)}`,
                rows: [{
                    header: `Provider ${capitalize(provider)}`,
                    title: `📱 ${capitalize(provider)}`,
                    description: `Klik untuk melihat produk ${capitalize(provider)}`,
                    id: `.listharga ${foundCategory} ${provider}`
                }]
            }))

            const txt = `📂 *KATEGORI: ${capitalize(foundCategory)}*

📊 Total Provider: ${providers.length}
💫 Total Layanan: ${inCategory.length}

Pilih provider di bawah untuk melihat produk:`

            const msg = generateWAMessageFromContent(
                m.chat, {
                    interactiveMessage: {
                        body: {
                            text: txt
                        },
                        footer: {
                            text: `📝 Status: Available • Powered by ${env.ownerName || 'AtlanticH2H'}`
                        },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "📱 PILIH PROVIDER",
                                    sections: sections,
                                    has_multiple_buttons: true
                                })
                            }],
                            messageParamsJson: JSON.stringify({
                                limited_time_offer: {},
                                bottom_sheet: {
                                    in_thread_buttons_limit: 0,
                                    divider_indices: [999],
                                    list_title: `Provider ${capitalize(foundCategory)}`,
                                    button_title: "📱 PILIH PROVIDER"
                                },
                                tap_target_configuration: {
                                    title: `Provider ${capitalize(foundCategory)}`,
                                    description: "Pilih provider yang ingin dilihat",
                                    canonical_url: env.domain || "https://atlantich2h.com",
                                    domain: "",
                                    button_index: 0
                                }
                            })
                        },
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999,
                            isForwarded: true,
                            externalAdReply: {
                                title: `${capitalize(foundCategory)} Providers`,
                                body: `Hi, ${m.pushName || 'User'}! Pilih provider`,
                                mediaType: 1,
                                thumbnailUrl: env.thumb || env.thumb2,
                                sourceUrl: env.domain || "https://atlantich2h.com",
                                renderLargerThumbnail: true
                            }
                        }
                    }
                }, {
                    userJid: m.sender,
                    quoted: m
                }
            )
            await conn.relayMessage(m.chat, msg.message, {
                messageId: msg.key.id
            })
            return
        }

        // Tampilkan produk dari provider
        let byProvider = inCategory.filter(i =>
            (i.provider?.toLowerCase() === providerQuery) ||
            (i.layanan?.toLowerCase() === providerQuery)
        )

        if (byProvider.length > 0) {
            return showProductsWithButton(m, byProvider, `${foundCategory} - ${providerQuery}`, conn)
        }

        return m.reply(`❌ Provider tidak ditemukan: *${providerQuery}*

💡 Provider yang tersedia di kategori ${foundCategory}:
${[...new Set(inCategory.map(i => i.provider || i.layanan))].map(p => `• ${p}`).join('\n')}`)

    } catch (e) {
        console.error(e)
        return m.reply("❌ Terjadi kesalahan saat mengambil data dari AtlanticH2H.")
    }
}

handler.command = ["listharga", "pricelist"]
handler.category = "store"
handler.description = "Menampilkan daftar harga berdasarkan kategori & provider"

module.exports = handler

function showProductsWithButton(m, items, keyword, conn) {
    // Urutkan berdasarkan harga termurah
    items.sort((a, b) => a.price - b.price)

    let sections = [{
        title: "💰 PRODUK TERMURAH",
        rows: items.slice(0, 15).map(item => ({
            header: `${item.name || item.layanan}`,
            title: `${formatProductName(item.name || item.layanan)} - Rp${toRupiah(item.price)}`,
            description: `📦 Code: ${item.code} | 🏷️ ${item.status === 'available' ? '✅ Tersedia' : '❌ Kosong'}`,
            id: `.order ${item.code}`
        }))
    }]

    let availableCount = items.filter(item => item.status === 'available').length
    let teks = `🏪 *ATLANTIC H2H - LIST PRODUK*\n\n`
    teks += `📂 Kategori: ${keyword.toUpperCase()}\n`
    teks += `📊 Total Produk: ${items.length}\n`
    teks += `✅ Tersedia: ${availableCount}\n`
    teks += `💰 Harga: Rp${toRupiah(items[0]?.price)} - Rp${toRupiah(items[items.length-1]?.price)}\n\n`
    teks += `💡 *CARA ORDER:*\n`
    teks += `• .order KODE_PRODUK\n`
    teks += `• Contoh: .order ${items[0]?.code}\n\n`
    teks += `📝 *CATATAN:*\n`
    teks += `• Harga dapat berubah sewaktu-waktu\n`
    teks += `• Stok mengikuti sistem AtlanticH2H\n`

    const msg = generateWAMessageFromContent(
        m.chat, {
            interactiveMessage: {
                body: {
                    text: teks
                },
                footer: {
                    text: `💎 ${availableCount} produk tersedia • AtlanticH2H`
                },
                nativeFlowMessage: {
                    buttons: [{
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "🛒 ORDER CEPAT",
                            sections: sections,
                            has_multiple_buttons: true
                        })
                    }, {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📋 Semua Produk",
                            url: "https://atlantich2h.com/price-list",
                            merchant_url: "https://atlantich2h.com/price-list"
                        })
                    }, {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "ℹ️ Bantuan & Support",
                            url: env.group_bot || env.channel_bot || "https://atlantich2h.com",
                            merchant_url: env.group_bot || env.channel_bot || "https://atlantich2h.com"
                        })
                    }],
                    messageParamsJson: JSON.stringify({
                        limited_time_offer: {},
                        bottom_sheet: {
                            in_thread_buttons_limit: 0,
                            divider_indices: [1, 2, 999],
                            list_title: `Produk ${keyword}`,
                            button_title: "🛒 MENU ORDER"
                        },
                        tap_target_configuration: {
                            title: `Produk ${keyword}`,
                            description: "Pilih produk untuk order cepat",
                            canonical_url: env.domain || "https://atlantich2h.com",
                            domain: "",
                            button_index: 0
                        }
                    })
                },
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    externalAdReply: {
                        title: `${keyword} Products`,
                        body: `💰 Harga mulai Rp${toRupiah(items[0]?.price)}`,
                        mediaType: 1,
                        thumbnailUrl: env.thumb || env.thumb2,
                        sourceUrl: env.domain || "https://atlantich2h.com",
                        renderLargerThumbnail: true
                    }
                }
            }
        }, {
            userJid: m.sender,
            quoted: m
        }
    )
    return conn.relayMessage(m.chat, msg.message, {
        messageId: msg.key.id
    })
}

// Fungsi untuk format nama produk
function formatProductName(name) {
    if (name.length > 30) {
        return name.substring(0, 27) + '...'
    }
    return name
}

function toRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

function capitalize(str) {
    return str.replace(/\b\w/g, c => c.toUpperCase())
}