const axios = require('axios');
const env = require('../../settings.js'); // Pastikan env.ownerName tersedia

const handler = async (m, {
    conn,
    text,
    command
}) => {
    if (!text) return m.reply(`Masukkan judul video!\n\nContoh:\n.${command} lathi`);

    try {
        // Melakukan request ke API Ndikz
        const response = await axios.get(`https://ndikz-api.vercel.app/search/youtube?q=${encodeURIComponent(text)}`);
        const data = response.data;

        if (!data.status || !data.result || data.result.length === 0) {
            return m.reply('❌ Tidak ada hasil yang ditemukan.');
        }

        // Mengambil hasil pertama
        const video = data.result[0];
        const {
            title,
            channel,
            duration,
            imageUrl,
            link
        } = video;

        const caption = `
*🎵 YOUTUBE PLAY 🎵*

📌 *Judul:* ${title}
📺 *Channel:* ${channel}
⏳ *Durasi:* ${duration}
🔗 *Link:* ${link}

Pilih format unduhan:
🎧 Audio → Klik tombol di bawah
🎞️ Video → Klik tombol di bawah
`.trim();

        const buttons = [{
                buttonId: `.ytmp3 ${link}`,
                buttonText: {
                    displayText: 'Audio 🎧'
                },
                type: 1
            },
            {
                buttonId: `.ytmp4 ${link}`,
                buttonText: {
                    displayText: 'Video 🎞️'
                },
                type: 1
            }
        ];

        await conn.sendMessage(m.chat, {
            image: {
                url: imageUrl
            },
            caption,
            footer: `Dibawakan oleh: ${env.ownerName || 'Bot'}`,
            buttons,
            headerType: 4
        }, {
            quoted: m
        });

    } catch (err) {
        console.error('[PLAY ERROR]', err);
        m.reply('❌ Terjadi kesalahan saat menghubungi server API.');
    }
};

handler.command = ['play'];
handler.category = 'downloader';
handler.description = 'Cari dan unduh audio/video dari YouTube';

module.exports = handler;