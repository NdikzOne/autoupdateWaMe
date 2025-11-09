const axios = require("axios");
const QRCode = require("qrcode");
const {
    sleep
} = require("../../functions.js");
const env = require("../../settings.js");

const handler = m => m;

handler.before = async function(m, {
    conn,
    db
}) {
    const text = (m.text || "").trim();
    if (!text) return;

    const users = db.list().user ||= {};
    const user = users[m.sender] ||= {};

    const wait = user.waitingOrder;
    if (!wait || !wait.code) return; // Tidak sedang order

    // Auto cancel jika lebih dari 2 menit
    if (Date.now() - wait.time > 120000) {
        delete user.waitingOrder;
        return m.reply("⏳ Waktu habis. Silakan ketik ulang `.order <kode>`.");
    }

    const target = text;
    if (!/^\d{8,13}$/.test(target) && !/^[\w.+-]+@[\w-]+\.[a-z]{2,}$/.test(target)) {
        return m.reply("⚠️ Nomor/email tidak valid. Contoh: 08123456789 atau example@gmail.com");
    }

    delete user.waitingOrder;

    const code = wait.code;
    const apikey = env.apikeyhost;
    const sender = m.sender.split("@")[0];
    const ref = `${sender}_${Date.now()}`;
    const fee = 200;

    try {
        // 1️⃣ Ambil harga produk
        const cek = await axios.post(
            "https://atlantich2h.com/layanan/price_list",
            new URLSearchParams({
                api_key: apikey,
                type: "prabayar"
            })
        );
        const layanan = cek.data.data.find(v => v.code === code);
        if (!layanan) return m.reply(`❌ Produk *${code}* tidak ditemukan.`);

        const hargaProduk = parseInt(layanan.price);
        const jumlah = hargaProduk + fee;

        // 2️⃣ Buat deposit QR
        const depo = await axios.post(
            "https://atlantich2h.com/deposit/create",
            new URLSearchParams({
                api_key: apikey,
                reff_id: ref,
                nominal: jumlah,
                type: "ewallet",
                metode: "qrisfast"
            })
        );

        if (!depo.data.status) return m.reply(`❌ Gagal membuat deposit: ${depo.data.message}`);
        const dataDepo = depo.data.data;
        const qr = await QRCode.toBuffer(dataDepo.qr_string);

        const caption = `── 「 DEPOSIT 」 ──

🛒 Produk: ${layanan.name}
📌 Code: ${code}
🎯 Target: ${target}

💰 Harga Produk: Rp${toRupiah(hargaProduk)}
➕ Fee: Rp${toRupiah(fee)}
📥 Total Bayar: Rp${toRupiah(jumlah)}

📌 Status: ${dataDepo.status}
🕒 Dibuat: ${dataDepo.created_at}
⏳ Expired: ${dataDepo.expired_at}

📸 *Scan QR di atas untuk membayar.*`;

        await conn.sendMessage(m.chat, {
            image: qr,
            caption
        }, {
            quoted: m
        });

        // 3️⃣ Tunggu pembayaran
        let status = dataDepo.status;
        while (status !== "success") {
            await sleep(3000);
            const cekDepo = await axios.post(
                "https://atlantich2h.com/deposit/status",
                new URLSearchParams({
                    api_key: apikey,
                    id: dataDepo.id
                })
            );
            status = cekDepo.data.data.status;

            if (status === "cancel" || status === "expired")
                return m.reply("❌ Deposit dibatalkan atau kadaluarsa.");
        }

        await m.reply("✅ Pembayaran diterima! Melanjutkan transaksi...");

        // 4️⃣ Buat transaksi
        const trx = await axios.post(
            "https://atlantich2h.com/transaksi/create",
            new URLSearchParams({
                api_key: apikey,
                code,
                reff_id: ref,
                target,
                limit_price: jumlah
            })
        );

        if (!trx.data.status) return m.reply(`❌ Gagal transaksi: ${trx.data.message}`);
        const dataTrx = trx.data.data;

        m.reply(`🛒 Transaksi sedang diproses...\n🆔 ID: ${dataTrx.id}\n📶 Status: ${dataTrx.status}`);

        // 5️⃣ Cek status transaksi
        let trxStatus = dataTrx.status;
        while (trxStatus !== "success" && trxStatus !== "failed") {
            await sleep(5000);
            const cekTrx = await axios.post(
                "https://atlantich2h.com/transaksi/status",
                new URLSearchParams({
                    api_key: apikey,
                    id: dataTrx.id,
                    type: "prabayar"
                })
            );
            trxStatus = cekTrx.data.data.status;

            if (trxStatus === "success") {
                const done = cekTrx.data.data;
                return m.reply(`✅ *TRANSAKSI SUKSES* ✅

🛒 Layanan: ${done.layanan}
📌 Code: ${done.code}
🎯 Target: ${done.target}
💰 Harga: Rp${toRupiah(done.price)}
🔑 SN: ${done.sn}
📶 Status: ${done.status}`);
            }

            if (trxStatus === "failed")
                return m.reply("❌ Transaksi gagal. Silakan hubungi admin.");
        }
    } catch (e) {
        console.error(e);
        return m.reply("❌ Terjadi kesalahan dalam memproses pesanan.");
    }
};

function toRupiah(angka) {
    let saldo = '';
    const angkarev = angka.toString().split('').reverse().join('');
    for (let i = 0; i < angkarev.length; i++)
        if (i % 3 === 0) saldo += angkarev.substr(i, 3) + '.';
    return saldo.split('', saldo.length - 1).reverse().join('');
}

module.exports = handler;