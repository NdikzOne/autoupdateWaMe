const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const catboxUploader = require('../../core/catbox'); // SESUAIKAN PATH

const handler = async (m, {
    conn
}) => {
    let q = m.quoted ? m.quoted : m;
    let mime = q.mimetype || q?.msg?.mimetype || '';

    let fileBuffer, fileName;

    if (q?.fileSha256 || q?.isMedia || mime) {
        await m.reply('📥 Mengunduh file...');
        try {
            fileBuffer = await q.download?.() || await conn.downloadMediaMessage?.(q);
        } catch (e) {
            return m.reply('❌ Gagal mendownload media.');
        }

        let ext = 'bin';

        if (mime) {
            if (mime === 'audio/mpeg') {
                ext = 'mp3';
            } else {
                ext = mime.split('/')[1].split(';')[0];
            }
        }

        fileName = `upload-${Date.now()}.${ext}`;
    } else if (q?.text && q.text !== m.text) {
        fileBuffer = Buffer.from(q.text, 'utf-8');
        fileName = `text-${Date.now()}.txt`;
    } else {
        return m.reply('📎 Balas media atau teks.');
    }

    const tmpDir = path.resolve('./tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, {
        recursive: true
    });

    const filepath = path.join(tmpDir, fileName);
    fs.writeFileSync(filepath, fileBuffer);

    /* ================== UPLOAD ================== */
    try {
        // 🔹 COBA UPLOAD KE GITHUB
        const form = new FormData();
        form.append('file', fs.createReadStream(filepath));

        const res = await axios.post(
            'https://upload-github.vercel.app/api/upload',
            form, {
                headers: form.getHeaders()
            }
        );

        const {
            raw_url
        } = res.data;
        if (!raw_url) throw new Error('URL kosong');

        await m.reply(`✅ *Upload Berhasil (GitHub)!*
📁 *Nama:* ${fileName}
🔗 *URL:* ${raw_url}
🌐 *Host:* githubusercontent.com`);
    } catch (err) {
        // 🔁 FALLBACK KE CATBOX
        await m.reply('⚠️ GitHub upload gagal, mencoba Catbox...');

        const catbox = await catboxUploader(fileBuffer, fileName);

        if (!catbox.status) {
            return m.reply(`❌ Upload gagal total:\n${catbox.message}`);
        }

        await m.reply(`✅ *Upload Berhasil (Catbox)!*
📁 *Nama:* ${fileName}
🔗 *URL:* ${catbox.url}
🌐 *Host:* catbox.moe`);
    } finally {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
};

handler.command = ['tourl'];
handler.category = 'tools';
handler.tags = ['tools'];
handler.description = 'Upload file ke GitHub, fallback Catbox jika error';

module.exports = handler;