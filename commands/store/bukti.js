const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

let handler = async (m, {
    conn,
    args,
    text,
    usedPrefix,
    command
}) => {
    let user_id = m.sender.split('@')[0];
    const xs = JSON.parse(fs.readFileSync("./database/userdepo.json"));

    // Cek limit deposit user
    if (!xs.users[user_id] || xs.users[user_id].limitdepo <= 0) {
        return m.reply('❌ Fitur ini tidak bisa digunakan sebelum anda melakukan /deposit');
    }

    // Ambil data user
    const xe = xs.users[user_id];
    let cpt = `「 *TRANSAKSI PROSES* 」\n
┏━━━━━━『 *DETAIL INFO* 』
┊🤖 𝐓𝐫𝐚𝐧𝐬𝐚𝐤𝐬𝐢 𝐌𝐞𝐭𝐨𝐝𝐞: Manual
┊💌 𝐒𝐍 𝐈𝐝 𝐃𝐞𝐩𝐨𝐬𝐢𝐭: ${xe.id}
┊❇️ 𝐉𝐔𝐌𝐋𝐀𝐇: Rp${xe.deposit}
┊📆 𝐓𝐀𝐍𝐆𝐆𝐀𝐋: ${xe.date}
┊⚡ 𝐒𝐓𝐀𝐓𝐔𝐒: ⏳ *PROSES*
┊📶 𝐁𝐮𝐲𝐞𝐫 𝐍𝐚𝐦𝐞: ${xe.name}
┊📄 𝐈𝐝 𝐔𝐬𝐞𝐫: ${user_id}
┕━━━━━━━━━━━━═┅═━––––––๑

Ketik /accdepo ${user_id}`;

    let capt = `✅ OKE KAK, DEPOSIT SEDANG DIPROSES. MOHON MENUNGGU SAMPAI *SYSTEM* MENGKONFIRMASI DEPOSIT TERSEBUT.`;

    // === Bagian Upload Bukti ===
    let q = m.quoted ? m.quoted : m;
    let mime = q.mimetype || q?.msg?.mimetype || '';

    let fileBuffer, fileName;

    if (q?.fileSha256 || q?.isMedia || mime) {
        await m.reply('📥 Mengunduh bukti transfer...');
        try {
            fileBuffer = await q.download?.() || await conn.downloadMediaMessage?.(q);
        } catch (e) {
            return m.reply('❌ Gagal mendownload media.');
        }

        const ext = mime ? mime.split('/')[1].split(';')[0] : 'bin';
        fileName = `bukti-${Date.now()}.${ext}`;
    } else {
        return m.reply('📎 Balas dengan media (gambar/screenshot bukti) untuk konfirmasi deposit.');
    }

    // Simpan sementara
    const tmpDir = path.resolve('./tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, {
        recursive: true
    });
    const filepath = path.join(tmpDir, fileName);
    fs.writeFileSync(filepath, fileBuffer);

    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(filepath));

        const res = await axios.post('https://upload-github.vercel.app/api/upload', form, {
            headers: form.getHeaders(),
        });

        const {
            url,
            raw_url
        } = res.data;
        if (!url || !raw_url) throw new Error('❌ Gagal mendapatkan URL dari server upload.');

        // Kirim ke user
        await m.reply(capt);

        // Kirim ke owner
        await conn.sendMessage(env.creator, {
            image: {
                url: raw_url
            },
            caption: cpt
        }, {
            quoted: m
        });

    } catch (err) {
        await m.reply(`❌ Gagal upload bukti:\n${err.message}`);
    } finally {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
};

handler.command = ['confirm', 'bukti'];
handler.category = 'store';
handler.description = 'kirim bukti ke owner.';

module.exports = handler;