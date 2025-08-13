module.exports = async function (data, conn, db) {
    const { id, participants, action, actor } = data;
  
    const groupSettings = db.get('group', id) || {};
    const isWelcomeEnabled = groupSettings.welcome !== false;
    const isDetectEnabled = groupSettings.detect !== false;  

    if (!isWelcomeEnabled && !isDetectEnabled) return;

    const formatMsg = (template, user, groupName, groupDesc) => {
        return template
            .replace(/@user/gi, `@${user.split("@")[0]}`)
            .replace(/@subject/gi, groupName)
            .replace(/@desc/gi, groupDesc || "");
    };

    try {
        const metadata = await conn.groupMetadata(id);
        const groupName = metadata.subject;
        const groupDesc = metadata.desc || "";
        const bg = "https://cloudkuimages.guru/uploads/images/6820744e84f73.jpg"; 

        for (const user of participants) {
            const jid = user;
            const username = "@" + jid.split("@")[0];
            const adminName = actor ? "@" + actor.split("@")[0] : "Seseorang";
            const ppuser = await conn
                .profilePictureUrl(jid, "image")
                .catch(() => "https://telegra.ph/file/e630bcc5ed3c835e34e45.jpg"); 

            let imageUrl, caption;

            switch (action) {
                case "add":
                    if (isWelcomeEnabled) {
                        const template = groupSettings.welcomeMsg || `Selamat datang @user di grup *@subject*!`;
                        const finalMsg = formatMsg(template, user, groupName, groupDesc);

                        await conn.sendMessage(id, {
                            video: { url: "https://raw.githubusercontent.com/NdikzDatabase/Database/main/Database/1751940387882-pmu6pr.mp4" },
                            gifPlayback: true,
                            caption: finalMsg,
                            mimetype: 'video/mp4',
                            mentions: [jid, ...(actor ? [actor] : [])],
                        });
                    }
                    break;

                case "remove":
                    if (isWelcomeEnabled) {
                        const template = groupSettings.leaveMsg || `Selamat tinggal @user dari grup *@subject*!`;
                        caption = formatMsg(template, user, groupName, groupDesc);
                        imageUrl = `https://flowfalcon.dpdns.org/api/goodbye?username=${encodeURIComponent(username)}&groupname=${encodeURIComponent(groupName)}&membercount=${metadata.participants.length}&profile=${encodeURIComponent(ppuser)}&background=${encodeURIComponent(bg)}`;
                    }
                    break;

                case "promote":
                    if (isDetectEnabled) {
                        imageUrl = `https://flowfalcon.dpdns.org/api/promote?username=${encodeURIComponent(username)}&profile=${encodeURIComponent(ppuser)}&background=${encodeURIComponent(bg)}`;
                        caption = `Selamat ${username}, Anda sekarang adalah admin!`;
                    }
                    break;

                case "demote":
                    if (isDetectEnabled) {
                        imageUrl = `https://flowfalcon.dpdns.org/api/demote?username=${encodeURIComponent(username)}&profile=${encodeURIComponent(ppuser)}&background=${encodeURIComponent(bg)}`;
                        caption = `Yah, ${username}, Anda bukan lagi seorang admin.`;
                    }
                    break;
            }

            if (imageUrl && caption) {
                await conn.sendMessage(id, {
                    image: { url: imageUrl },
                    caption,
                    mentions: [jid, ...(actor ? [actor] : [])],
                });
            }
        }
    } catch (e) {
        console.error(`Gagal memproses group-participants.update untuk grup ${id}:`, e);
    }
};
