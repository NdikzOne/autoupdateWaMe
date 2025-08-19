import os from "os";
import moment from "moment-timezone";
import env from "../../settings.js";

const handler = async (m, {
    conn,
    user,
    isOwner,
    isPremium,
    cmd,
    Func
}) => {
    const menu = {};

    Object.values(cmd.plugins).forEach(plugin => {
        const {
            command,
            category,
            description,
            owner
        } = plugin;

        if (!command || !category) return;
        if (owner && !isOwner) return;
        if (category !== 'main') return; // ✅ Filter hanya anime

        if (!menu[category]) {
            menu[category] = [];
        }

        // Jika command adalah array, masukkan semua
        const cmds = Array.isArray(command) ? command : [command];
        cmds.forEach(cmd => {
            menu[category].push({
                command: cmd,
                description: description || "Tanpa deskripsi"
            });
        });
    });

    const more = String.fromCharCode(8206);
    const readMore = more.repeat(4001);

    const userStatus = isOwner ?
        "👑 Owner" :
        isPremium ?
        "💎 Premium" :
        user.registered ?
        "👤 Free User" :
        "❓ Not Registered";

    const uptime = Func.toTime(process.uptime() * 1000);
    const serverUptime = Func.toTime(os.uptime() * 1000);
    const groupCount = Object.keys(await conn.groupFetchAllParticipating()).length;

    let caption = `Hi, *${m.name}* 👋
Saya adalah ${env.nameBot}, siap membantu Anda!

*乂 INFO PENGGUNA*
┌  ◦ *Status:* ${userStatus}
└  ◦ *Limit:* ${user.limit || 0}

*乂 INFO BOT*
┌  ◦ *Grup:* ${groupCount}
│  ◦ *Uptime:* ${uptime}
└  ◦ *Server Uptime:* ${serverUptime}

Jika menemukan bug, harap hubungi Owner.
${readMore}
`;

    const sortedCategories = Object.keys(menu).sort();
    for (let category of sortedCategories) {
        caption += `*– MENU ${category.toUpperCase()}*\n`;
        const commands = menu[category]
            .map(c => `│  ◦ .${c.command}`)
            .join("\n");
        caption += `${commands}\n└––\n\n`;
    }

    await conn.sendMessage(m.chat, {
        text: Func.Styles(caption),
        contextInfo: {
            externalAdReply: {
                title: `${env.nameBot} | ${moment().tz('Asia/Jakarta').format('HH:mm')}`,
                body: `Uptime: ${uptime}`,
                thumbnailUrl: env.thumb3,
                sourceUrl: env.lynk,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, {
        quoted: m
    });
};

handler.command = ["menumain"];
handler.category = "info";
handler.register = true;
handler.description = "Menampilkan daftar Menu main.";

export default handler;
