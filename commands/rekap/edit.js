const fs = require("fs");
const path = require("path");

const handler = async (m, {
    command,
    args
}) => {
    const baseDir = "./database";
    const userdataPath = path.join(baseDir, "userdata.json");
    const gameHistoryPath = path.join(baseDir, "gamehistory.json");
    const jancoPath = path.join(baseDir, "janco.json");
    const lwinfoPath = path.join(baseDir, "lwinfo.json");

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, {
        recursive: true
    });

    // join argumen, pisah pakai #
    let argsJoined = args.join(" ");
    const parts = argsJoined.split("#").map(s => s.trim());

    if (parts.length < 3 || parts.some(p => p.length === 0)) {
        return m.reply(
            `> ❗ Contoh:
.setlw DULZ ROLL GOOGLE DEV IP 15 #SALDO PEMAIN #SALDO LF\n\n` +
            `Format pakai tanda *#* untuk memisahkan bagian:\n` +
            `1️⃣ Judul LW\n2️⃣ Label pemain\n3️⃣ Label lawan`
        );
    }

    const [lwText, playerLabel, opponentLabel] = parts;

    const userdata = fs.existsSync(userdataPath) ? JSON.parse(fs.readFileSync(userdataPath)) : {};
    const gameHistory = fs.existsSync(gameHistoryPath) ? JSON.parse(fs.readFileSync(gameHistoryPath)) : {};
    const janco = fs.existsSync(jancoPath) ? JSON.parse(fs.readFileSync(jancoPath)) : {};
    const lwinfo = fs.existsSync(lwinfoPath) ? JSON.parse(fs.readFileSync(lwinfoPath)) : {};

    const chatId = m.sender;
    if (!userdata[chatId]) userdata[chatId] = {};
    userdata[chatId].saldo = userdata[chatId].saldo || {};
    userdata[chatId].pernahLF = userdata[chatId].pernahLF || {};

    // simpan teks LW
    lwinfo[chatId] = lwText.toUpperCase();

    // tanggal WIB
    const now = new Date(new Date().toLocaleString("en-US", {
        timeZone: "Asia/Jakarta"
    }));
    const weekday = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        timeZone: "Asia/Jakarta"
    }).format(now).toUpperCase();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const dateStr = `${weekday}, ${day}-${month}-${year}`.toUpperCase();

    // simpan label + tanggal
    janco[chatId] = {
        admin: lwText.toUpperCase(),
        tanggal: dateStr,
        pemain: playerLabel.toUpperCase(),
        pemain2: opponentLabel.toUpperCase()
    };

    // kalau ada reply data B/K, parsing sekalian
    if (m.quoted && m.quoted.text) {
        const lines = m.quoted.text.split("\n");
        let current = "";
        const parsed = {
            B: [],
            K: []
        };

        for (let line of lines) {
            if (/^b\s*:?\s*$/i.test(line)) {
                current = "B";
                continue;
            }
            if (/^k\s*:?\s*$/i.test(line)) {
                current = "K";
                continue;
            }

            const match = line.trim().match(/^([^\d]+)\s+(\d+)\s*(lf)?$/i);
            if (!match || !current) continue;

            let name = match[1].trim().toUpperCase();
            let number = parseInt(match[2], 10);
            let lf = !!match[3];

            if (lf) userdata[chatId].pernahLF[name] = true;

            parsed[current].push({
                nama: name,
                angka: number,
                lf
            });
        }

        // backup saldo & history
        userdata[chatId].backupSaldo = JSON.parse(JSON.stringify(userdata[chatId].saldo || {}));
        userdata[chatId].backupGame = Array.isArray(gameHistory[chatId]) ? JSON.parse(JSON.stringify(gameHistory[chatId])) : [];

        // update saldo dasar (contoh simple)
        parsed.B.forEach(p => {
            userdata[chatId].saldo[p.nama] = (userdata[chatId].saldo[p.nama] || 0) + p.angka;
        });
        parsed.K.forEach(p => {
            userdata[chatId].saldo[p.nama] = (userdata[chatId].saldo[p.nama] || 0) - p.angka;
        });
    }

    // simpan ke file
    fs.writeFileSync(lwinfoPath, JSON.stringify(lwinfo, null, 2));
    fs.writeFileSync(jancoPath, JSON.stringify(janco, null, 2));
    fs.writeFileSync(userdataPath, JSON.stringify(userdata, null, 2));

    await m.reply("✅ LW dan data berhasil disimpan!");
};

handler.command = ["setlw"];
handler.category = "rekap";
handler.description = "Set teks LW, label pemain, dan label lawan";
handler.premium = true

module.exports = handler;