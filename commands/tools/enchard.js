const fs = require("fs");
const Obfus = require("js-confuser");

const handler = async (m, {
    conn,
    text,
    args
}) => {
    const q = m.quoted || m;
    const mime = (q.msg || q).mimetype || "";

    let fileBuffer, fileName;

    if (mime && /javascript|octet-stream/.test(mime)) {
        fileBuffer = await q.download();
        const ext = mime.split("/")[1] || "js";
        fileName = `file.${ext}`;
    } else if (q.text) {
        fileBuffer = Buffer.from(q.text, "utf-8");
        fileName = "text.js";
    } else {
        return m.reply("🚨 Kirim file JavaScript atau balas teks JavaScript.");
    }

    await m.reply("🔐 Mengenkripsi file...");

    try {
        const key = args[0] || "NdikzOne";
        await m.reply("🛠 Proses Encrypt...");

        const obfuscated = await Obfus.obfuscate(fileBuffer.toString(), {
            target: "node",
            preset: "high",
            compact: true,
            minify: true,
            flatten: true,

            identifierGenerator: () => {
                const originalString = `素晴座素晴${key}`;
                const cleaned = originalString.replace(/[^a-zA-Z/*ᨒZenn/*^/*($break)*/]/g, "");
                const randomString = Array.from({
                        length: 2
                    }, () =>
                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" [Math.floor(Math.random() * 52)]
                ).join("");
                return cleaned + randomString;
            },

            renameVariables: true,
            renameGlobals: true,

            stringEncoding: 0.01,
            stringSplitting: 0.1,
            stringConcealing: true,
            stringCompression: true,
            duplicateLiteralsRemoval: true,

            shuffle: {
                hash: false,
                true: false
            },
            controlFlowFlattening: false,
            opaquePredicates: false,
            deadCode: false,
            dispatcher: false,
            rgf: false,
            calculator: false,
            hexadecimalNumbers: false,
            movedDeclarations: true,
            objectExtraction: true,
            globalConcealing: true
        });

        const outputFile = `./enchard-${fileName}`;
        fs.writeFileSync(outputFile, obfuscated.code);

        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(outputFile),
            mimetype: "application/javascript",
            fileName: `encrypted-${fileName}`,
            caption: `✅ Berhasil mengenkripsi file: *${fileName}*`
        }, {
            quoted: m
        });

        fs.unlinkSync(outputFile);
    } catch (err) {
        console.error(err);
        m.reply("❌ Terjadi kesalahan saat enkripsi:\n" + err.message);
    }
};

handler.command = ["enchard", "encrypthard"];
handler.category = "tools";
handler.description = "Enkripsi file JavaScript dengan tingkat tinggi";

module.exports = handler;