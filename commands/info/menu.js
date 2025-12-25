const os = require("os");
const moment = require("moment-timezone");
const env = require("../../settings");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const {
    getTopCommands
} = require("../../core/stats");

// Cache untuk gambar
const imageCache = new Map();

async function getImageBuffer(imagePath) {
    const cacheKey = imagePath;

    // Cek cache (expire setelah 1 jam)
    if (imageCache.has(cacheKey)) {
        const cached = imageCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 3600000) {
            return cached.buffer;
        }
    }

    let buffer;
    if (imagePath.startsWith('http')) {
        const response = await axios.get(imagePath, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        buffer = Buffer.from(response.data);
    } else {
        buffer = fs.readFileSync(imagePath);
    }

    // Simpan ke cache
    imageCache.set(cacheKey, {
        buffer: buffer,
        timestamp: Date.now()
    });

    return buffer;
}

const handler = async (m, {
    conn,
    user,
    store,
    isOwner,
    isPremium
}) => {
    const formatTime = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
    };

    const top = getTopCommands(3);
    const groupCount = Object.keys(await conn.groupFetchAllParticipating()).length;
    const topText = top.length ?
        top.map((v, i) => `🔹 *${v.command}* (${v.count}x)`).join('\n') :
        'Belum ada data~';

    const userStatus = isOwner ?
        "👑 Owner" :
        isPremium ?
        "💎 Premium" :
        user.registered ?
        "👤 Free User" :
        "❓ Not Registered";

    const teks = `Hai Kak *${m.name || "User"}*! Aku *${env.nameBot}*, siap nemenin harimu 🌸

• 👤 Status: ${userStatus}
• 💎 Limit: ${user.limit || 0}
• ⏱️ Uptime: ${formatTime(process.uptime())}
• 💻 Server: ${formatTime(os.uptime())}
• 👥 Grup: ${groupCount}
• 📊 Top Commands\n${topText}

Jangan lupa makan dan senyum hari ini~ 🫶`;

    try {
        const imageBuffer = await getImageBuffer(env.thumb);

        const msg = {
            interactiveMessage: {
                title: teks,
                image: imageBuffer,
                nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                        limited_time_offer: {
                            text: `${env.nameBot} Menu`,
                            url: env.ownerLink || "https://t.me/example",
                            copy_code: `${env.nameBot.toLowerCase()}.menu`,
                            expiration_time: Date.now() * 999
                        },
                        bottom_sheet: {
                            in_thread_buttons_limit: 2,
                            divider_indices: [1, 2, 3, 4, 5, 999],
                            list_title: `${env.nameBot} Menu`,
                            button_title: "Pilih Menu"
                        }
                    }),
                    buttons: [{
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Owner 👑",
                                id: ".owner"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Ping ⚡",
                                id: ".ping"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "All Menu ⚡",
                                id: ".allmenu"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Store Menu 🛍",
                                id: ".menustore"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Rekap Menu 🖨",
                                id: ".menurekap"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Main Menu 🚂",
                                id: ".menumain"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Maker Menu 🗺",
                                id: ".menumaker"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Tools Menu 🔗",
                                id: ".menutools"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Search Menu 📡",
                                id: ".menusearch"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Download Menu 📥",
                                id: ".menudownloader"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Group Menu 🗝",
                                id: ".menugroup"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Panel Menu 🕹",
                                id: ".menupanel"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Convert Menu 🚀",
                                id: ".menuconvert"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Fun Menu 😂",
                                id: ".menufun"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "RPG Menu ⚔️",
                                id: ".menurpg"
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "Game Menu 🎮",
                                id: ".menugame"
                            })
                        }
                    ]
                }
            }
        };

        conn.sendMessage(m.chat, msg, {
            quoted: m
        });

    } catch (error) {
        console.error("Error in menu handler:", error);

        // Fallback tanpa interactive message
        const fallbackText = `*${env.nameBot} - Menu*

Hai Kak *${m.name || "User"}*! Aku *${env.nameBot}*, siap nemenin harimu 🌸

• 👤 Status: ${userStatus}
• 💎 Limit: ${user.limit || 0}
• ⏱️ Uptime: ${formatTime(process.uptime())}
• 💻 Server: ${formatTime(os.uptime())}
• 👥 Grup: ${groupCount}
• 📊 Top Commands\n${topText}

*Quick Commands:*
• .owner - Info pemilik bot
• .ping - Cek kecepatan bot
• .allmenu - Semua menu lengkap

Jangan lupa makan dan senyum hari ini~ 🫶

*Note:* Fitur interactive sedang tidak tersedia.`;

        conn.sendMessage(m.chat, {
            text: fallbackText,
            footer: env.footer
        }, {
            quoted: m
        });
    }
};

handler.command = ['menu'];
handler.category = 'info';
handler.description = 'Menampilkan menu ringkas dengan top command';
handler.register = true;

module.exports = handler;