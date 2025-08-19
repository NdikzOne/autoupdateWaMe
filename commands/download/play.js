const {
    google
} = require('googleapis');
const env = require('../../settings.js'); // pastikan ada env.ownerName dan youtubeApiKey

const handler = async (m, {
    conn,
    text,
    command
}) => {
    if (!text) return m.reply(`Masukkan judul video!\n\nContoh:\n.${command} lathi`);

    try {
        const youtube = google.youtube({
            version: 'v3',
            auth: 'AIzaSyDZf8QMAKc2HhRBNSTJ1MLVDsIwoEHlsVY',
        });

        const res = await youtube.search.list({
            part: 'snippet',
            q: text,
            type: 'video',
            maxResults: 1,
            order: 'relevance',
        });

        if (!res.data.items || res.data.items.length === 0) {
            return m.reply('❌ Tidak ada hasil yang ditemukan.');
        }

        const video = res.data.items[0];
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const channel = video.snippet.channelTitle;
        const publishedAt = new Date(video.snippet.publishedAt).toLocaleDateString();
        const thumbnail = video.snippet.thumbnails.high.url;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        const caption = `
*🎵 YOUTUBE PLAY 🎵*

📌 *Judul:* ${title}
📺 *Channel:* ${channel}
📅 *Upload:* ${publishedAt}

Pilih format unduhan:
🎧 Audio →
🎞️ Video →
`.trim();

        const buttons = [{
                buttonId: `.ytmp3 ${videoUrl}`,
                buttonText: {
                    displayText: 'Audio 🎧'
                },
                type: 1
            },
            {
                buttonId: `.ytmp4 ${videoUrl}`,
                buttonText: {
                    displayText: 'Video 🎞️'
                },
                type: 1
            }
        ];

        await conn.sendMessage(m.chat, {
            image: {
                url: thumbnail
            },
            caption,
            footer: `Dibawakan oleh: @${env.ownerName}`,
            buttons,
            headerType: 4
        }, {
            quoted: m
        });

    } catch (err) {
        console.error('[PLAY ERROR]', err);
        m.reply('❌ Terjadi kesalahan saat mencari video.');
    }
};

handler.command = ['play'];
handler.category = 'downloader';
handler.description = 'Cari dan unduh audio/video dari YouTube';

module.exports = handler;