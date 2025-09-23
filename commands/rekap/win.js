const fs = require("fs");
const path = require("path");

const handler = async (m, {
    command,
    args
}) => {
    if (!m.quoted || !m.quoted.text) {
        return m.reply("❗Reply pesan berisi data taruhan");
    }
    if (!global.lastWinMsg) global.lastWinMsg = {};

    const winner = command === "winb" ? "B" : "K";
    const skor = args[0];
    if (!skor) return m.reply("❗ Gunakan: *.winb skor* atau *.wink skor*");

    const baseDir = "./database";
    const userFile = path.join(baseDir, "userdata.json");
    const gameLogFile = path.join(baseDir, "gamehistory.json");
    const jancoFile = path.join(baseDir, "janco.json");
    const lwFile = path.join(baseDir, "lwinfo.json");

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, {
        recursive: true
    });

    const userData = fs.existsSync(userFile) ? JSON.parse(fs.readFileSync(userFile)) : {};
    const gameLog = fs.existsSync(gameLogFile) ? JSON.parse(fs.readFileSync(gameLogFile)) : {};
    const jancoData = fs.existsSync(jancoFile) ? JSON.parse(fs.readFileSync(jancoFile)) : {};
    const lwData = fs.existsSync(lwFile) ? JSON.parse(fs.readFileSync(lwFile)) : {};

    const chatId = m.sender;
    if (!userData[chatId]) userData[chatId] = {
        saldo: {},
        pernahLF: {},
        backupSaldo: {}
    };

    // parsing taruhan
    const lines = m.quoted.text.split("\n");
    let current = "";
    let data = {
        B: [],
        K: []
    };

    for (let line of lines) {
        line = line.trim();
        if (/^b(?:esar)?\s*:?\s*$/i.test(line)) {
            current = "B";
            continue;
        }
        if (/^k(?:ecil)?\s*:?\s*$/i.test(line)) {
            current = "K";
            continue;
        }

        const match = line.match(/^([^\d]+)\s+(\d+)[pP]?\s*(lf)?$/i);
        if (!match || !current) continue;

        let [, nama, angkaStr, lfFlag] = match;
        nama = nama.trim().toUpperCase();
        const angka = parseInt(angkaStr);
        const huruf = lfFlag ? "lf" : "";

        if (huruf === "lf") {
            userData[chatId].pernahLF[nama] = true;
        }

        data[current].push({
            nama,
            angka,
            huruf
        });
    }

    // backup saldo
    userData[chatId].backupSaldo = JSON.parse(JSON.stringify(userData[chatId].saldo));

    // === Fee function ===
    const getFee = (n) => {
        if (n <= 9) return 1
        if (n <= 19) return 2
        if (n <= 29) return 3
        if (n <= 39) return 4
        if (n <= 49) return 5
        if (n <= 59) return 6
        if (n <= 69) return 7
        if (n <= 79) return 8
        if (n <= 89) return 9
        if (n <= 99) return 10
        if (n <= 109) return 11
        if (n <= 119) return 12
        if (n <= 129) return 13
        if (n <= 139) return 14
        if (n <= 149) return 15
        if (n <= 159) return 16
        if (n <= 169) return 17
        if (n <= 179) return 18
        if (n <= 189) return 19
        if (n <= 199) return 20
        if (n <= 209) return 21
        if (n <= 219) return 22
        if (n <= 229) return 23
        if (n <= 239) return 24
        if (n <= 249) return 25
        if (n <= 259) return 26
        if (n <= 269) return 27
        if (n <= 279) return 28
        if (n <= 289) return 29
        if (n <= 299) return 30
        if (n <= 309) return 31
        if (n <= 319) return 32
        if (n <= 329) return 33
        if (n <= 339) return 34
        if (n <= 349) return 35
        if (n <= 359) return 36
        if (n <= 369) return 37
        if (n <= 379) return 38
        if (n <= 389) return 39
        if (n <= 399) return 40
        if (n <= 409) return 41
        if (n <= 419) return 42
        if (n <= 429) return 43
        if (n <= 439) return 44
        if (n <= 449) return 45
        if (n <= 459) return 46
        if (n <= 469) return 47
        if (n <= 479) return 48
        if (n <= 489) return 49
        if (n <= 499) return 50
        if (n <= 509) return 51
        if (n <= 519) return 52
        if (n <= 529) return 53
        if (n <= 539) return 54
        if (n <= 549) return 55
        if (n <= 559) return 56
        if (n <= 569) return 57
        if (n <= 579) return 58
        if (n <= 589) return 59
        if (n <= 599) return 60
        if (n <= 609) return 61
        if (n <= 619) return 62
        if (n <= 629) return 63
        if (n <= 639) return 64
        if (n <= 649) return 65
        if (n <= 659) return 66
        if (n <= 669) return 67
        if (n <= 679) return 68
        if (n <= 689) return 69
        if (n <= 699) return 70
        if (n <= 709) return 71
        if (n <= 719) return 72
        if (n <= 729) return 73
        if (n <= 739) return 74
        if (n <= 749) return 75
        if (n <= 759) return 76
        if (n <= 769) return 77
        if (n <= 779) return 78
        if (n <= 789) return 79
        if (n <= 799) return 80
        if (n <= 809) return 81




















        // di atas 60000 → lanjut nambah 1000 per 10k
        // ambil kelipatan 10000
        const extra = Math.floor((n - 50000) / 10000) + 1
        return 6000 + (extra * 1000)
    }

    // update saldo
    for (let team of ["B", "K"]) {
        const menang = team === winner;
        for (let {
                nama,
                angka,
                huruf
            }
            of data[team]) {
            const fee = getFee(angka);
            const sAwal = userData[chatId].saldo[nama] ?? 0;
            let sAkhir = 0;

            if (menang) {
                if (huruf === "lf") sAkhir = sAwal + (angka - fee);
                else sAkhir = sAwal > 0 ? sAwal + (angka - fee) : angka * 2 - fee;
            } else {
                if (huruf === "lf") sAkhir = sAwal - angka;
                else {
                    sAkhir = sAwal - angka;
                    if (sAwal <= 0 || sAkhir < 0) sAkhir = 0;
                }
            }

            userData[chatId].saldo[nama] = sAkhir;
        }
    }

    const totalSkor = data[winner].reduce((sum, obj) => sum + obj.angka, 0);
    const totalFee = data[winner].reduce((sum, obj) => sum + getFee(obj.angka), 0);

    jancoData[chatId] = {
        ...(jancoData[chatId] || {}),
        n: totalSkor,
        b: totalFee
    };
    fs.writeFileSync(jancoFile, JSON.stringify(jancoData, null, 2));
    fs.writeFileSync(userFile, JSON.stringify(userData, null, 2));

    if (!gameLog[chatId]) gameLog[chatId] = [];
    gameLog[chatId].push({
        winner,
        skor: skor,
        total: totalSkor,
        fee: totalFee
    });
    fs.writeFileSync(gameLogFile, JSON.stringify(gameLog, null, 2));

    // === OUTPUT ===
    const lwText = lwData[chatId] || "⁉️ Belum diset melalui .setlw";
    const labels = jancoData[chatId] || {
        pemain: "ABANG PENJUDI",
        pemain2: "KACUNG TOLOL"
    };

    const now = new Date();
    const weekday = new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            timeZone: "Asia/Jakarta"
        })
        .format(now).toUpperCase();
    const day = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        timeZone: "Asia/Jakarta"
    }).format(now);
    const month = new Intl.DateTimeFormat("id-ID", {
        month: "2-digit",
        timeZone: "Asia/Jakarta"
    }).format(now);
    const year = new Intl.DateTimeFormat("id-ID", {
        year: "numeric",
        timeZone: "Asia/Jakarta"
    }).format(now);
    const dateStr = `${weekday}, ${day}-${month}-${year}`;

    // random emoji biar lebih asik
    const emojis = ["🎲", "🏆", "🔥", "⚡", "💥", "👑", "🎯", "🃏"];
    const pick = () => emojis[Math.floor(Math.random() * emojis.length)];

    let out = `${lwText}\n\n⋆ ♛ ${dateStr}\n\n`;
    (gameLog[chatId] || []).forEach((g, i) => {
        if (typeof g === "string") {
            out += `*GAME ${i + 1}* : ${g}\n`;
        } else {
            out += `*GAME ${i + 1}* : ${g.winner} ${g.skor} (${g.total}) \\ ${g.fee}\n`;
        }
    });

    const semuaNama = Object.entries(userData[chatId].saldo || {});
    const pernahLF = userData[chatId].pernahLF || {};

    const positif = semuaNama.filter(([_, s]) => s > 0).map(([n, s]) => `${pick()} ${n} ${s}`);
    const negatif = semuaNama.filter(([n, s]) => s < 0 && pernahLF[n]).map(([n, s]) => `${pick()} ${n} ${s}`);

    const totalPositif = semuaNama.filter(([_, s]) => s > 0).reduce((a, [, s]) => a + s, 0);
    const totalNegatif = semuaNama.filter(([n, s]) => s < 0 && pernahLF[n]).reduce((a, [, s]) => a + s, 0);

    out += `\n*${labels.pemain}: (${totalPositif})*\n${positif.join("\n") || "-"}`;
    out += `\n\n*${labels.pemain2}: (${totalNegatif})*\n${negatif.join("\n") || "-"}`;

    m.reply(out);
};

handler.command = ["winb", "wink"];
handler.category = "rekap";
handler.description = "Hitung hasil taruhan besar/kecil dengan fee otomatis";
handler.premium = true

module.exports = handler;