const moment = require("moment-timezone");
const fetch = require('node-fetch')
const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const {
    sizeFormatter
} = require('human-readable')
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
    const apikeyhost = env.apikeyhost // APIKEY LU OTPWEB.COM
    const sender = m.sender.split('@')[0]
    const admin = `${Math.floor(Math.random() * 500)}`
    const _type = (args[1] || '').toLowerCase()
    const jualbeli = (args[0] || '').toLowerCase()

    // WAKTU TIMES ZONE JAKARTA
    let wib = moment.tz('Asia/Jakarta').format('HH:mm:ss')
    let wibh = moment.tz('Asia/Jakarta').format('HH')
    let wibm = moment.tz('Asia/Jakarta').format('mm')
    let wibs = moment.tz('Asia/Jakarta').format('ss')
    let wit = moment.tz('Asia/Jayapura').format('HH:mm:ss')
    let wita = moment.tz('Asia/Makassar').format('HH:mm:ss')
    let wktuwib = `${wibh}:${wibm}:${wibs}`

    let d = new Date(new Date + 3600000)
    let locale = 'id'
    // d.getTimeZoneOffset()
    // Offset -420 is 18.00
    // Offset    0 is  0.00
    // Offset  420 is  7.00
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let week = d.toLocaleDateString(locale, {
        weekday: 'long'
    })
    const date = d.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    const calender = d.toLocaleDateString("id", {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const Styles = (text, style = 1) => {
        var xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
        var yStr = {
            1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
        };
        var replacer = [];
        xStr.map((v, i) =>
            replacer.push({
                original: v,
                convert: yStr[style].split('')[i]
            })
        );
        var str = text.toLowerCase().split('');
        var output = [];
        str.map((v) => {
            const find = replacer.find((x) => x.original == v);
            find ? output.push(find.convert) : output.push(v);
        });
        return output.join('');
    };
    const capt = `╭─「 *DEPOSIT INFO* 」
│Otomatis: ON 24JAM (Saldo Langsung masuk)
│Manual: ERROR (Tergantung Owner Aktif)
╰────
Apakah Kamu Ingin deposit manual atau otomatis?
Ketik /deposit otomatis (Untuk Lanjut)
Ketik /deposit manual (Untuk Lanjut)
Ketik /deposit cancel (Untuk Membatalkan)`
    if (!jualbeli) m.reply(Styles(capt));
    if (args[0] === 'otomatis' || args[0] === 'manual' || args[0] === 'cancel') {
        switch (jualbeli) {
            case "otomatis": {
                let q = args[1]
                if (!args[0]) throw 'Lengkapi Command kamu !\n\n_Contoh: .deposit otomatis 2000_'
                let jumlah = parseInt(args[1]) + parseInt(admin)
                if (!env.apikeyhost || env.apikeyhost.trim() === '') {
                    m.reply('API key host is empty\nSilahkan Menggunakan Deposit Manual');
                }
                if (fs.existsSync(`./database/datasaldo/${sender}.json`)) throw 'Selesaikan pembelian anda sebelumnya'
                // let [method, nomor] = q.split(" ")
                let ref = Math.floor(Math.random() * 100000000)
                let h2hkey = apikeyhost
                var config = {
                    method: 'POST',
                    url: 'https://atlantich2h.com/deposit/create',
                    data: new URLSearchParams(Object.entries({
                        api_key: h2hkey,
                        reff_id: ref,
                        nominal: jumlah,
                        type: 'ewallet',
                        metode: 'qrisfast'
                    }))
                };


                /*axios('https://atlantich2h.com/deposit/create',{
                  method: 'POST',
                  data: new URLSearchParams(Object.entries({
                    api_key: h2hkey,
                    reff_id: ref,
                    nominal: text,
                   type: 'ewallet',
                   metode: 'qris'
                  }))})*/
                axios(config)
                    .then(async res => {
                        if (res.data.data.status == false) {
                            m.reply(`*_${res.data.data.status}_*`) // Biar tau apa yang salah cuyyy
                        }
                        m.reply(`*「 DEPOSIT PENDING 」*\n\n_Mohon Tunggu Pesanan Anda Sedang Diproses_`)
                        let obj = {
                            id: sender,
                            ref: res.data.data.id,
                            status: res.data.data.status
                        }
                        fs.writeFileSync(`./database/datasaldo/${sender}.json`, JSON.stringify(obj))
                        let buffer = await QRCode(res.data.data.qr_string)
                        //   let anu = await convertToUrl(buffer)
                        //  let anu = `https://api.lolhuman.xyz/api/qrcode?apikey=IchanRTZ&text=${res.data.data.qr_string}`
                        //  let qrcode = await toqrcode(res.data.data.qr_string)
                        const abc = `── 「 DEPOSIT 」 ──

⚡ Id: ${res.data.data.id}
⚡ Reff ID: ${res.data.data.reff_id}
💰 Nominal: Rp${toRupiah(res.data.data.nominal)}
💸 Fee: Rp${toRupiah(res.data.data.fee)}
📥 Diterima: Rp${toRupiah(res.data.data.get_balance)}
📌 Status: ${res.data.data.status}
🕒 Dibuat: ${res.data.data.created_at}
⏳ Expired: ${res.data.data.expired_at}

_Scan QR di atas untuk pembayaran_
⏳ Batas transfer 1 jam, lewat dari itu auto expired
❌ Cancel: /deposit cancel`;
                        conn.sendMessage(m.chat, {
                            image: buffer,
                            caption: abc
                        })
                        var status = res.data.data.status;

                        var topup = {
                            method: 'POST',
                            url: 'https://atlantich2h.com/deposit/status',
                            data: new URLSearchParams(Object.entries({
                                api_key: h2hkey,
                                id: res.data.data.id
                            }))
                        };
                        var acc = {
                            method: 'POST',
                            url: 'https://atlantich2h.com/deposit/instant',
                            data: new URLSearchParams(Object.entries({
                                api_key: h2hkey,
                                id: res.data.data.id,
                                action: 'true'
                            }))
                        };

                        while (status !== 'processing') {
                            await sleep(1000);
                            const response = await axios(topup);
                            status = response.data.data.status;
                            console.log(status)
                            if (status == 'cancel') {
                                m.reply('Transaksi Dibatalkan')
                                //     fs.unlinkSync(`./database/datasaldo/${sender}.json`)
                                break;
                            }
                            if (status == 'expired') {
                                m.reply('Transaksi Dibatalkan')
                                fs.unlinkSync(`./database/datasaldo/${sender}.json`)
                                break;
                            }
                            if (status == 'success') {
                                db.list().user[m.sender].saldo += res.data.data.nominal * 1
                                let anjay = `✅ *DEPOSIT SUKSES*

💰 Nominal: Rp${toRupiah(res.data.data.nominal)}
📥 Masuk: Rp${toRupiah(res.data.data.get_balance)}
📌 Status: SUKSES`;
                                m.reply(anjay)
                                fs.unlinkSync(`./database/datasaldo/${sender}.json`)
                                break;
                            }
                        }

                    })
            }
            break
            case 'batal':
            case 'cancel': {
                try {
                    const prem = JSON.parse(fs.readFileSync(`./database/datasaldo/${sender}.json`));
                    //     if (!args[0]) return reply(`kirim .${command} id transaksi tadi\ncontoh: .cancel-deposit ${res.data.data.id}`)
                    let ref = Math.floor(Math.random() * 100000000)
                    let h2hkey = apikeyhost

                    var config = {
                        method: 'POST',
                        url: 'https://atlantich2h.com/deposit/cancel',
                        data: new URLSearchParams(Object.entries({
                            api_key: h2hkey,
                            id: prem.ref
                        }))
                    };
                    axios(config)
                    fs.unlinkSync(`./database/datasaldo/${sender}.json`)
                    m.reply('Sukses Cancel Deposit ✅')
                } catch (e) {
                    console.log(e)
                    m.reply('Kamu tidak melakukan pembelian')
                }
            }
            case "manual": {
                let q = args[1]
                if (!args[1]) throw `Minimal Deposit 1000 || *cara depositnya* :
.deposit manual 1000`
                if (q < 1000) {
                    m.reply('Minimal Depo 1000')
                } else if (q > 950) {
                    const db_Deposit = JSON.parse(fs.readFileSync("./database/userdepo.json"));
                    const {
                        addDeposit
                    } = require("../../core/deposit");

                    //   const prem = JSON.parse(fs.readFileSync("./lib/Ndikz/deposit.json"))
                    let qris = env.qris // ISI QRIS LU
                    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://telegra.ph/file/a2ae6cbfa40f6eeea0cf1.jpg')
                    let user = db.list().user[m.sender]
                    let thm = 'https://telegra.ph/file/5e52b6e8ab1ed136705ad.jpg'
                    let admin = `${Math.floor(Math.random() * 500)}`
                    let id = `${Math.floor(Math.random() * 99999)}`
                    let tg = `${m.sender.split('@')[0]}@s.whatsapp.net`
                    //let kata = `${pickRandom('1291912', '12177819', '928192', '12919929', '12729890', '7625410', '272829', '7524136', '2712514', '121872756' )}`
                    let cpt = `*ADA TRANSAKSI MASUK*\n*SEJUMLAH Rp${toRupiah(q)} DARI @${m.sender.split('@')[0]}*\n\nDENGAN ID DEPOSIT : ${id}\n*Tunggu sampai dia tf hihi*`
                    let capt = `*───◆⧽ TRANSAKSI DIBUAT ⧼◆───*
💸 NOMINAL: Rp.${toRupiah(q)}
💳 PAYMENT: QRIS
⚙️ SISTEM: DIRECT
id transaksi : ${id}

*MOHON DIBACA YA!!*
*DIMOHON JIKA SUDAH TOP UP SALDO ATAU TRANSFER JANGAN LUPA KONFIRMASI*
*BERIKUT DENGAN CARA PERINTAH: /bukti ${id}*`
                    let lastsald = db.list().user[m.sender].saldo
                    global.data = db_Deposit

                    global.data.users[m.sender.split('@')[0]] = {
                        name: m.name,
                        nowa: sender,
                        id: id,
                        date: calender,
                        lastsaldo: lastsald,
                        deposit: q,
                        limitdepo: 1
                    }

                    const databaseFilePath = './database/userdepo.json';

                    // Fungsi untuk membaca data dari file JSON
                    const readDatabase = () => {
                        let userData = {};
                        try {
                            const data = fs.readFileSync(databaseFilePath, 'utf8');
                            userData = JSON.parse(data);
                        } catch (err) {
                            console.error('Error reading database file:', err);
                        }
                        return userData;
                    };

                    // Fungsi untuk menulis data kembali ke file JSON
                    const writeDatabase = (data) => {
                        try {
                            fs.writeFileSync(databaseFilePath, JSON.stringify(data, null, 2));
                            // console.log('Database updated successfully.');
                        } catch (err) {
                            console.error('Error writing database file:', err);
                        }
                    };
                    writeDatabase(global.data)
                    await conn.sendFile(m.chat, qris, 'order.jpg', `${capt}`, m)
                    return conn.sendFile(env.creator, thm, 'order.jpg', `${cpt}`, m)
                }
            }
        }
    } else {
        m.reply(Styles(capt));
    }
}
handler.command = ["deposit",
    "confirm",
    "canceldepo",
    "transfer"
];
handler.category = 'store';
handler.description = 'Untuk Melakukan deposit.';

module.exports = handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)]
}

function toRupiah(angka) {
    var saldo = '';
    var angkarev = angka.toString().split('').reverse().join('');
    for (var i = 0; i < angkarev.length; i++)
        if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.';
    return '' + saldo.split('', saldo.length - 1).reverse().join('');
}
async function QRCode(qr) {
    const QRCode = require('qrcode');
    // Mendapatkan buffer dari QR code
    let buffer = await QRCode.toBuffer(qr);
    return buffer
    // Gunakan buffer sesuai kebutuhan
    console.log('Kode QR berhasil dibuat dalam bentuk buffer:', buffer);
}