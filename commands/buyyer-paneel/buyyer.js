const moment = require("moment-timezone");
const fetch = require('node-fetch')
const crypto = require('crypto')
const {
    sizeFormatter
} = require('human-readable')

const format = sizeFormatter()
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
    const linkgc = '-' // Group
    var who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
    else who = m.sender

    // Time
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
    var userz = db.list().user[m.sender]

    const webPage = env.login // Web Page

    switch (command) {
        case "addusr": {
            if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor/tag`);

            let nomor = t[0];
            let name = t[1];

            //let password
            let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
            let dms = nomor + "@s.whatsapp.net";

            if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
            let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
            let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
            let password = d.exists ? crypto.randomBytes(3).toString("hex") : t[3]

            let f = await fetch(env.domain + "/api/application/users", {
                "method": "POST",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                },
                "body": JSON.stringify({
                    "email": name + profil.toString() + "@gmail.com", // Email
                    "username": name + profil.toString(), // Username
                    "first_name": name + profil.toString(), // Nama Depan
                    "last_name": name, // Nama Belakang
                    "language": "en", // Bahasa
                    "password": name + password.toString() // Password
                })
            })
            let data = await f.json();
            if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
            let user = data.attributes

            let p = await conn.reply(m.chat, `
*===[ Sukses Membuat Akun ]===*

Id: ${user.id}
Username: ${user.username}
Detail Dikirim Ke : @${u.split`@`[0]}`, m, {
                mentions: [u]
            })

            await conn.sendMessage(u, {
                text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: hehe${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
            })

            conn.sendMessage(dms, {
                text: `*===[ Pesanan Panel ]===*\n
Akun Punya : @${u.split`@`[0]} 
Id: ${user.id}

Email: ${user.email}
Username: ${user.username}
Password: ${password}
Dibuat: ${user.created_at}
`,
            })


            conn.sendMessage(u, {
                text: `*===[ Peringatan ]===*\n
Gunakan Dengan Sebaik Mungkin, Simpan Informasi Akun Karna Jika Hilang Maka Bukan Tanggung Jawab Kami!

- Dilarang Menjual Kembali
- Dilarang Menyebarkan Akun
- Dilarang Menggunakan Berlebihan
- Jika Terjadi Error Segera Lapor

- Garansi 5Hari
-Admin : 085760451683`,
            })
        }
        break
        case "delusr": {
            if (!isOwner) return global.dfail("rowner", m, conn)
            let usr = args[0]
            if (!usr) return m.reply("Masukkan ID")
            let f = await fetch(env.domain + "/api/application/users/" + usr, {
                "method": "DELETE",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                }
            })
            //let res = await f.json()
            let res = f.ok ? {
                errors: null
            } : await f.json()
            if (res.errors) return m.reply("*User Tidak Terdaftar*")
            m.reply("*Sukses Menghapus User*")
        }
        break
        case "detusr": {
            let usr = args[0]
            let f = await fetch(env.domain + "/api/application/users/" + usr, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                }
            })
            let res = await f.json()
            if (res.errors) return m.reply("*User Tidak Ada*")
            let u = res.attributes
            m.reply(`*${u.username.toUpperCase()} Detail User*

\`\`\`ID: ${u.id}
UUID: ${u.uuid}
Username: ${u.username}
Email: ${u.email}
Name: ${u.first_name} ${u.last_name}
Language: ${u.language}
Admin: ${u.root_admin}
Dibuat: ${u.created_at}\`\`\``)
        }
        break
        case "addsrv": {
            if (!isOwner) return global.dfail("rowner", m, conn)
            let s = text.split(",");
            if (s.length < 7) return m.reply(`> Perintah :\n
${usedPrefix + command} name,desc,userId,eggId,locId,memory/disk,cpu`)
            let name = s[0];
            let desc = s[1] || ""
            let usr_id = s[2];
            let egg = s[3];
            let loc = s[4];
            let memo_disk = s[5].split`/`;
            let cpu = s[6];

            let f1 = await fetch(env.domain + "/api/application/nests/6/env.egg/" + egg, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                }
            })
            let data = await f1.json();
            //console.log(data.attributes.startup)
            let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

            let f = await fetch(env.domain + "/api/application/servers", {
                "method": "POST",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey,
                },
                "body": JSON.stringify({
                    "name": name,
                    "description": desc,
                    "user": usr_id,
                    "egg": parseInt(egg),
                    "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                    "startup": startup_cmd,
                    "environment": {
                        "INST": "npm",
                        "USER_UPLOAD": "0",
                        "AUTO_UPDATE": "0",
                        "CMD_RUN": "node index.js"
                    },
                    "limits": {
                        "memory": memo_disk[0],
                        "swap": 0,
                        "disk": memo_disk[1],
                        "io": 500,
                        "cpu": cpu
                    },
                    "feature_limits": {
                        "databases": 0,
                        "backups": 1,
                        "allocations": 0
                    },
                    // "allocation": {
                    //     "default": 36
                    // }
                    deploy: {
                        locations: [parseInt(loc)],
                        dedicated_ip: false,
                        port_range: [],
                    },
                })
            })
            let res = await f.json()
            if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
            let server = res.attributes
            m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
        }
        break
        case "delsrv": {
            if (!isOwner) return global.dfail("rowner", m, conn)
            let srv = args[0]
            if (!srv) return m.reply("ID nya mana?")
            let f = await fetch(env.domain + "/api/application/servers/" + srv, {
                "method": "DELETE",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey,
                }
            })
            let res = f.ok ? {
                errors: null
            } : await f.json()
            if (res.errors) return m.reply("*Server Tidak Ditemukan*")
            m.reply("*Sukses Menghapus Server*")
        }
        break
        case "detsrv": {
            let srv = args[0]
            if (!srv) return m.reply("ID nya mana?")
            let f = await fetch(env.domain + "/api/application/servers/" + srv, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                }
            })
            let res = await f.json();
            if (res.errors) return m.reply("*Server Tidak Ditemukan*")
            let s = res.attributes
            let f2 = await fetch(env.domain + "/api/client/servers/" + s.uuid.split`-` [0] + "/resources", {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.capikey
                }
            })
            let data = await f2.json();
            let t = data.attributes
            m.reply(`*${s.name.toUpperCase()} Detail Server*

\`\`\`Status: ${t.current_state}

ID: ${s.id}
UUID: ${s.uuid}
Name: ${s.name}
Desc: ${s.description}
Memory: ${await (format(t.resources.memory_bytes)).toString()} / ${s.limits.memory === 0 ? "Unlimited" : s.limits.memory + "Mb"}
Disk: ${await (format(t.resources.disk_bytes)).toString()} / ${s.limits.disk === 0 ? "Unlimited" : s.limits.disk + "Mb"}
Cpu: ${t.resources.cpu_absolute}% / ${s.limits.cpu === 0 ? "Unlimited" : s.limits.cpu + "%"}
Dibuat: ${s.created_at}\`\`\``)
        }
        break
        case "updatesrv": {
            if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 4) return m.reply(`Perintah :\n
${usedPrefix + command} srvId,locId,memory/disk,cpu`)
            let srv = t[0];
            let loc = t[1];
            let memo_disk = t[2].split`/`;
            let cpu = t[3];
            let f1 = await fetch(env.domain + "/api/application/servers/" + srv, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                }
            })
            let data = await f1.json()

            let f = await fetch(env.domain + "/api/application/servers/" + srv + "/build", {
                "method": "PATCH",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                },
                "body": JSON.stringify({
                    "allocation": parseInt(loc) || data.attributes.allocation,
                    "memory": memo_disk[0] || data.attributes.limits.memory,
                    "swap": data.attributes.limits.swap || 0,
                    "disk": memo_disk[1] || data.attributes.limits.disk,
                    "io": 500,
                    "cpu": cpu || data.attributes.limits.cpu,
                    "threads": null,
                    "feature_limits": {
                        "databases": 5,
                        "allocations": 5,
                        "backups": 5
                    }
                })
            })
            let res = await f.json()
            if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
            let server = res.attributes
            m.reply(`*Update Server Info*

Type: ${res.object}

ID: ${server.id}
UUID: ${server.uuid}
Name: ${server.name}
Desc: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Diupdate: ${server.updated_at}`)
        }
        break
        case "startsrv":
        case "stopsrv":
        case "restartsrv": {
            let srv = args[0]
            let action = command.replace("srv", "")
            if (!isOwner) return global.dfail("rowner", m, conn)
            if (!srv) return m.reply("ID nya mana?")
            let f = await fetch(env.domain + "/api/client/servers/" + srv + "/power", {
                "method": "POST",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.capikey,
                },
                "body": JSON.stringify({
                    "signal": action
                })
            })

            let res = f.ok ? {
                errors: null
            } : await f.json()
            if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
            m.reply(`*Sukses ${action.toUpperCase()} THE SERVER*`)
        }
        break

        case "buysrv-1gb": {
            //     if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga1gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga1gb) {
                let name = t[1];
                let memo = '1024'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '40'
                db.list().user[who].saldo -= env.harga1gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 1024,
                            "swap": 0,
                            "disk": 1024,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
            }
        }
        break
        case "buysrv-2gb": {
            //       if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga2gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga2gb) {

                let name = t[1];
                let memo = '2048'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '70'
                db.list().user[who].saldo -= env.harga2gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 2048,
                            "swap": 0,
                            "disk": 2048,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
            }
        }
        break
        case "buysrv-3gb": {
            //       if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga3gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga3gb) {

                let name = t[1];
                let memo = '3072'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '100'
                db.list().user[who].saldo -= env.harga3gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 3072,
                            "swap": 0,
                            "disk": 3072,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)

            }
        }
        break
        case "buysrv-4gb": {
            //       if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga4gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga4gb) {

                let name = t[1];
                let memo = '4114'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '120'
                db.list().user[who].saldo -= env.harga4gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 4114,
                            "swap": 0,
                            "disk": 4114,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)

            }
        }
        break
        case "buysrv-5gb": {
            //     if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga5gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga5gb) {

                let name = t[1];
                let memo = '5138'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '140'
                db.list().user[who].saldo -= env.harga5gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 5138,
                            "swap": 0,
                            "disk": 5138,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
            }
        }
        break
        case "buysrv-6gb": {
            //      if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga6gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga6gb) {

                let name = t[1];
                let memo = '6144'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '170'
                db.list().user[who].saldo -= env.harga6gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 6144,
                            "swap": 0,
                            "disk": 6144,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
            }
        }
        break
        case "buysrv-7gb": {
            //          if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.harga7gb) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.harga7gb) {

                let name = t[1];
                let memo = '7168'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '200'
                db.list().user[who].saldo -= env.harga7gb

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 7168,
                            "swap": 0,
                            "disk": 7168,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
            }
        }
        break
        case "listsrv": {
            let page = args[0] ? args[0] : '1';
            let f = await fetch(env.domain + "/api/application/servers?page=" + page, {
                "method": "GET",
                "headers": {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + env.apikey
                }
            });
            let res = await f.json();
            let servers = res.data;
            let sections = [];
            let messageText = "Berikut adalah daftar server:\n\n";

            for (let server of servers) {
                let s = server.attributes;

                let f3 = await fetch(env.domain + "/api/client/servers/" + s.uuid.split`-` [0] + "/resources", {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.capikey
                    }
                });

                let data = await f3.json();
                let status = data.attributes ? data.attributes.current_state : s.status;

                messageText += `📦ID Server: ${s.id}\n`;
                messageText += `✉️Nama Server: ${s.name}\n`;
                messageText += `✅Status: ${status}\n`;
                messageText += `⌛Ram: ${s.limits.memory === 0 ? "Unlimited" : s.limits.memory} Mb\n`
                messageText += `⌛Cpu: ${s.limits.cpu}%\n\n`
            }

            messageText += `Halaman: ${res.meta.pagination.currentusedPrefixage}/${res.meta.pagination.totalusedPrefixages}\n`;
            messageText += `Total Server: ${res.meta.pagination.count}`;

            await conn.sendMessage(m.chat, {
                text: messageText
            }, {
                quoted: m
            });

            if (res.meta.pagination.currentusedPrefixage < res.meta.pagination.totalusedPrefixages) {
                reply(`Gunakan perintah ${command}listsrv ${res.meta.pagination.currentusedPrefixage + 1} untuk melihat halaman selanjutnya.`);
            }
        }
        break
        case "buysrv-unli": {
            //       if (!isOwner) return global.dfail("rowner", m, conn)
            let t = text.split(",");
            if (t.length < 2) return m.reply(`
> Perintah :\n${usedPrefix + command} nomor,namaserver`);
            let nomor = t[0]
            if (userz.saldo < env.hargaunli) {
                m.reply('Saldo User Anda Kurang!. Silahkan Melakukan Deposit Terlebih Dahulu')
            } else if (userz.saldo > env.hargaunli) {

                let name = t[1];
                let memo = '0'
                let egg = env.egg
                let loc = env.loc
                let memo_disk = memo.split`/`;
                let cpu = '0'
                db.list().user[who].saldo -= env.hargaunli

                //let password
                let u = m.quoted ? m.quoted.sender : t[0] ? t[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.mentionedJid[0];
                let dms = nomor + "@s.whatsapp.net";

                if (!u) return m.reply(`*Format salah!*

> Perintah : ${usedPrefix + command} nomer/tag`);
                let d = (await conn.onWhatsApp(u.split`@` [0]))[0] || {}
                let profil = d.exists ? crypto.randomBytes(2).toString("hex") : t[2]
                let password = name + "001"

                let f = await fetch(env.domain + "/api/application/users", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    },
                    "body": JSON.stringify({
                        "email": name + profil.toString() + "@gmail.com", // Email
                        "username": name + profil.toString(), // Username
                        "first_name": name + profil.toString(), // Nama Depan
                        "last_name": name, // Nama Belakang
                        "language": "en", // Bahasa
                        "password": password // Password
                    })
                })
                let data = await f.json();
                if (data.errors) return m.reply(JSON.stringify(data.errors[0], null, 2));
                let user = data.attributes
                await conn.sendMessage(u, {
                    text: `*===[ Pesanan Panel ]===*\n
Id: ${user.id}                
Username: ${user.username}
Password: ${password}
Login: ${webPage}
Aktif : 1 Bulan
`,
                })

                let f1 = await fetch(env.domain + "/api/application/nests/6/eggs/" + egg, {
                    "method": "GET",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey
                    }
                })
                let dataa = await f1.json();
                //console.log(data.attributes.startup)
                let startup_cmd = 'if [[ -d .git ]] && [[ {{AUTO_UPDATE}} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi;  if [[ ! -z ${CUSTOM_ENVIRONMENT_VARIABLES} ]]; then      vars=$(echo ${CUSTOM_ENVIRONMENT_VARIABLES} | tr ";" "\n");      for line in $vars;     do export $line;     done fi;  /usr/local/bin/' + "${CMD_RUN}"

                let f3 = await fetch(env.domain + "/api/application/servers", {
                    "method": "POST",
                    "headers": {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + env.apikey,
                    },
                    "body": JSON.stringify({
                        "name": name,
                        "description": `Dibuat Pada ${date} Aktif 1Bulan`,
                        "user": user.id,
                        "egg": parseInt(egg),
                        "docker_image": "ghcr.io/parkervcp/yolks:nodejs_18",
                        "startup": startup_cmd,
                        "environment": {
                            "INST": "npm",
                            "USER_UPLOAD": "0",
                            "AUTO_UPDATE": "0",
                            "CMD_RUN": "npm start"
                        },
                        "limits": {
                            "memory": 0,
                            "swap": 0,
                            "disk": 0,
                            "io": 500,
                            "cpu": cpu
                        },
                        "feature_limits": {
                            "databases": 0,
                            "backups": 1,
                            "allocations": 0
                        },
                        // "allocation": {
                        //     "default": 36
                        // }
                        deploy: {
                            locations: [parseInt(loc)],
                            dedicated_ip: false,
                            port_range: [],
                        },
                    })
                })
                let res = await f3.json()
                if (res.errors) return m.reply(JSON.stringify(res.errors[0], null, 2))
                let server = res.attributes
                await m.reply(`*== [ Info Server Dibuat ] ==*

Type: ${res.object}
ID: ${server.id}
Name: ${server.name}
Description: ${server.description}
Memory: ${server.limits.memory === 0 ? "Unlimited" : server.limits.memory} Mb
Disk: ${server.limits.disk === 0 ? "Unlimited" : server.limits.disk} Mb
Cpu: ${server.limits.cpu}%
Dibuat: ${server.created_at}
Expired: 1 Bulan`)
            }
        }

    }
}
handler.command = ["buysrv-1gb",
    "buysrv-2gb",
    "buysrv-3gb",
    "buysrv-4gb",
    "buysrv-5gb",
    "buysrv-6gb",
    "buysrv-7gb",
    "buysrv-8gb",
    "buysrv-9gb",
    "buysrv-unli"
];
handler.category = 'store';
handler.description = 'Beli Panel dengan harga tertentu.';
handler.register = true;

module.exports = handler;