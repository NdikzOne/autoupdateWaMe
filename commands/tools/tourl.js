const fs = require('fs');
const path = require('path');
const axios = require('axios');

const handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = q.mimetype || q?.msg?.mimetype || '';

    let fileBuffer, fileName, originalName, fileType;

    if (q?.fileSha256 || q?.isMedia || mime) {
        await m.reply('📥 Mengunduh file...');

        try {
            fileBuffer = await q.download?.() || await conn.downloadMediaMessage?.(q);
        } catch (e) {
            return m.reply('❌ Gagal mendownload media.');
        }

        const ext = mime ? mime.split('/')[1].split(';')[0] : 'bin';
        originalName = `media-${Date.now()}.${ext}`;
        fileName = `upload-${Date.now()}`;
        fileType = mime;
    } else if (q?.text && q.text !== m.text) {
        fileBuffer = Buffer.from(q.text, 'utf-8');
        originalName = `text-${Date.now()}.txt`;
        fileName = `text-${Date.now()}`;
        fileType = 'text/plain';
    } else {
        return m.reply('📎 Balas media (gambar, dokumen, dsb) atau teks. Jangan hanya ketik *tourl* tanpa media.');
    }

    // convert buffer ke base64
    const fileBase64 = fileBuffer.toString('base64');

    try {
        const res = await axios.post('https://ndikz-upload.vercel.app/api/upload', {
            file: fileBase64,
            fileName: fileName,
            originalName: originalName,
            fileType: fileType
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        const data = res.data;

        if (!data.success) throw new Error(data.error || 'Gagal upload ke server.');

        await m.reply(`✅ *Upload Berhasil!*
📁 *Nama Asli:* ${originalName}
🔗 *Raw URL:* ${data.rawUrl}
🌐 *GitHub URL:* ${data.githubUrl}
📌 *Commit:* ${data.commitUrl}`);
    } catch (err) {
        await m.reply(`❌ Gagal upload:\n${err.message}`);
    }
};

handler.command = ['tourl'];
handler.category = 'tools';
handler.tags = ['tools'];
handler.description = 'Upload file ke GitHub repo dan dapatkan URL';

module.exports = handler;