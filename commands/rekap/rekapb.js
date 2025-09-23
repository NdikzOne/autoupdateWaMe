const env = require("../../settings.js")

const handler = async (m, {
    text
}) => {
    if (!m.quoted || !m.quoted.text) {
        return m.reply("❌ Harap reply pesan dengan format data yang valid!");
    }

    // Daftar emoji random
    const emojis = ['🔥', '⚡', '💥', '🌟', '🚀', '👑', '💎', '🎯', '🐉', '🦅', '🐅', '🦊', '🐺', '🐲']

    // Range biaya
    const biayaRanges = [{
        min: 1,
        max: 9,
        biaya: 1
    }, {
        min: 10,
        max: 19,
        biaya: 2
    }, {
        min: 20,
        max: 29,
        biaya: 3
    }, {
        min: 30,
        max: 39,
        biaya: 4
    }, {
        min: 40,
        max: 49,
        biaya: 5
    }, {
        min: 50,
        max: 59,
        biaya: 6
    }, {
        min: 60,
        max: 69,
        biaya: 7
    }, {
        min: 70,
        max: 79,
        biaya: 8
    }, {
        min: 80,
        max: 89,
        biaya: 9
    }, {
        min: 90,
        max: 99,
        biaya: 10
    }, {
        min: 100,
        max: 109,
        biaya: 11
    }, {
        min: 110,
        max: 119,
        biaya: 12
    }, {
        min: 120,
        max: 129,
        biaya: 13
    }, {
        min: 130,
        max: 139,
        biaya: 14
    }, {
        min: 140,
        max: 149,
        biaya: 15
    }, {
        min: 150,
        max: 159,
        biaya: 16
    }, {
        min: 160,
        max: 169,
        biaya: 17
    }, {
        min: 170,
        max: 179,
        biaya: 18
    }, {
        min: 180,
        max: 189,
        biaya: 19
    }, {
        min: 190,
        max: 199,
        biaya: 20
    }, {
        min: 200,
        max: 209,
        biaya: 21
    }, {
        min: 210,
        max: 219,
        biaya: 22
    }, {
        min: 220,
        max: 229,
        biaya: 23
    }, {
        min: 230,
        max: 239,
        biaya: 24
    }, {
        min: 240,
        max: 249,
        biaya: 25
    }, {
        min: 250,
        max: 259,
        biaya: 26
    }, {
        min: 260,
        max: 269,
        biaya: 27
    }, {
        min: 270,
        max: 279,
        biaya: 30
    }, {
        min: 280,
        max: 289,
        biaya: 31
    }, {
        min: 290,
        max: 299,
        biaya: 32
    }, {
        min: 300,
        max: 309,
        biaya: 33
    }, {
        min: 310,
        max: 319,
        biaya: 34
    }, {
        min: 320,
        max: 329,
        biaya: 35
    }, {
        min: 330,
        max: 339,
        biaya: 36
    }, {
        min: 340,
        max: 349,
        biaya: 37
    }, {
        min: 350,
        max: 359,
        biaya: 38
    }, {
        min: 360,
        max: 369,
        biaya: 39
    }, {
        min: 370,
        max: 379,
        biaya: 40
    }, {
        min: 380,
        max: 389,
        biaya: 41
    }, {
        min: 390,
        max: 399,
        biaya: 42
    }, {
        min: 400,
        max: 409,
        biaya: 43
    }, {
        min: 410,
        max: 419,
        biaya: 44
    }, {
        min: 420,
        max: 429,
        biaya: 45
    }, {
        min: 430,
        max: 439,
        biaya: 46
    }, {
        min: 440,
        max: 449,
        biaya: 47
    }, {
        min: 450,
        max: 459,
        biaya: 48
    }, {
        min: 460,
        max: 469,
        biaya: 49
    }, {
        min: 470,
        max: 479,
        biaya: 50
    }, {
        min: 480,
        max: 489,
        biaya: 51
    }, {
        min: 490,
        max: 499,
        biaya: 52
    }, {
        min: 500,
        max: 509,
        biaya: 53
    }, {
        min: 510,
        max: 519,
        biaya: 54
    }, {
        min: 520,
        max: 529,
        biaya: 55
    }, {
        min: 530,
        max: 539,
        biaya: 56
    }, {
        min: 540,
        max: 549,
        biaya: 57
    }, {
        min: 550,
        max: 559,
        biaya: 58
    }, {
        min: 560,
        max: 569,
        biaya: 59
    }, {
        min: 570,
        max: 579,
        biaya: 60
    }, {
        min: 580,
        max: 589,
        biaya: 61
    }, {
        min: 590,
        max: 599,
        biaya: 62
    }, {
        min: 600,
        max: 609,
        biaya: 63
    }, {
        min: 610,
        max: 619,
        biaya: 64
    }, {
        min: 620,
        max: 629,
        biaya: 65
    }, {
        min: 630,
        max: 639,
        biaya: 66
    }, {
        min: 640,
        max: 649,
        biaya: 67
    }, {
        min: 650,
        max: 659,
        biaya: 68
    }, {
        min: 660,
        max: 669,
        biaya: 69
    }, {
        min: 670,
        max: 679,
        biaya: 70
    }, {
        min: 680,
        max: 689,
        biaya: 71
    }, {
        min: 690,
        max: 699,
        biaya: 72
    }, {
        min: 700,
        max: 709,
        biaya: 73
    }, {
        min: 710,
        max: 719,
        biaya: 74
    }, {
        min: 720,
        max: 729,
        biaya: 75
    }, {
        min: 730,
        max: 739,
        biaya: 76
    }, {
        min: 740,
        max: 749,
        biaya: 77
    }, {
        min: 750,
        max: 759,
        biaya: 78
    }, {
        min: 760,
        max: 769,
        biaya: 79
    }, {
        min: 770,
        max: 779,
        biaya: 80
    }, {
        min: 780,
        max: 789,
        biaya: 81
    }, {
        min: 790,
        max: 799,
        biaya: 82
    }, {
        min: 800,
        max: 809,
        biaya: 83
    }, {
        min: 810,
        max: 819,
        biaya: 84
    }, {
        min: 820,
        max: 829,
        biaya: 85
    }, {
        min: 830,
        max: 839,
        biaya: 86
    }, {
        min: 840,
        max: 849,
        biaya: 87
    }, {
        min: 850,
        max: 859,
        biaya: 88
    }, {
        min: 860,
        max: 869,
        biaya: 89
    }, {
        min: 870,
        max: 879,
        biaya: 90
    }, {
        min: 880,
        max: 889,
        biaya: 91
    }, {
        min: 890,
        max: 899,
        biaya: 92
    }, {
        min: 900,
        max: 909,
        biaya: 93
    }, {
        min: 910,
        max: 919,
        biaya: 94
    }, {
        min: 920,
        max: 929,
        biaya: 95
    }, {
        min: 930,
        max: 939,
        biaya: 96
    }, {
        min: 940,
        max: 949,
        biaya: 97
    }, {
        min: 950,
        max: 959,
        biaya: 98
    }, {
        min: 960,
        max: 969,
        biaya: 99
    }, {
        min: 970,
        max: 979,
        biaya: 100
    }, {
        min: 980,
        max: 989,
        biaya: 101
    }, {
        min: 990,
        max: 999,
        biaya: 102
    }, {
        min: 1000,
        max: 1009,
        biaya: 103
    }, {
        min: 1010,
        max: 1019,
        biaya: 104
    }, {
        min: 1020,
        max: 1029,
        biaya: 105
    }, {
        min: 1030,
        max: 1039,
        biaya: 106
    }, {
        min: 1040,
        max: 1049,
        biaya: 107
    }, {
        min: 1050,
        max: 1059,
        biaya: 108
    }, {
        min: 1060,
        max: 1069,
        biaya: 109
    }, {
        min: 1080,
        max: 1089,
        biaya: 110
    }, {
        min: 1090,
        max: 1099,
        biaya: 111
    }, {
        min: 1100,
        max: 1109,
        biaya: 112
    }, {
        min: 1110,
        max: 1119,
        biaya: 113
    }, {
        min: 1120,
        max: 1129,
        biaya: 114
    }, {
        min: 1130,
        max: 1139,
        biaya: 115
    }, {
        min: 1140,
        max: 1149,
        biaya: 116
    }, {
        min: 1150,
        max: 1159,
        biaya: 117
    }, {
        min: 1160,
        max: 1169,
        biaya: 118
    }, {
        min: 1170,
        max: 1179,
        biaya: 119
    }, {
        min: 1180,
        max: 1189,
        biaya: 120
    }, {
        min: 1190,
        max: 1199,
        biaya: 121
    }, {
        min: 1200,
        max: 1209,
        biaya: 122
    }, {
        min: 1210,
        max: 1219,
        biaya: 123
    }, {
        min: 1220,
        max: 1229,
        biaya: 124
    }, {
        min: 1230,
        max: 1239,
        biaya: 125
    }, {
        min: 1240,
        max: 1249,
        biaya: 126
    }, {
        min: 1250,
        max: 1259,
        biaya: 127
    }, {
        min: 1260,
        max: 1269,
        biaya: 128
    }, {
        min: 1270,
        max: 1279,
        biaya: 129
    }, {
        min: 1280,
        max: 1289,
        biaya: 130
    }, {
        min: 1290,
        max: 1299,
        biaya: 131
    }, {
        min: 1300,
        max: 1309,
        biaya: 132
    }, {
        min: 1310,
        max: 1319,
        biaya: 133
    }, {
        min: 1320,
        max: 1329,
        biaya: 134
    }, {
        min: 1330,
        max: 1339,
        biaya: 135
    }, {
        min: 1340,
        max: 1349,
        biaya: 136
    }, {
        min: 1350,
        max: 1359,
        biaya: 137
    }, {
        min: 1360,
        max: 1369,
        biaya: 138
    }, {
        min: 1370,
        max: 1379,
        biaya: 139
    }, {
        min: 1380,
        max: 1389,
        biaya: 140
    }, {
        min: 1390,
        max: 1399,
        biaya: 141
    }, {
        min: 1400,
        max: 1409,
        biaya: 142
    }, {
        min: 1410,
        max: 1419,
        biaya: 143
    }, {
        min: 1420,
        max: 1429,
        biaya: 144
    }, {
        min: 1430,
        max: 1439,
        biaya: 145
    }, {
        min: 1440,
        max: 1449,
        biaya: 146
    }, {
        min: 1450,
        max: 1459,
        biaya: 147
    }, {
        min: 1460,
        max: 1469,
        biaya: 148
    }, {
        min: 1470,
        max: 1479,
        biaya: 149
    }, {
        min: 1480,
        max: 1489,
        biaya: 150
    }, {
        min: 1490,
        max: 1499,
        biaya: 151
    }, {
        min: 1500,
        max: 1509,
        biaya: 152
    }];

    // Fungsi cari biaya
    const getBiaya = (angka) => {
        const found = biayaRanges.find(r => angka >= r.min && angka <= r.max)
        return found ? found.biaya : 0
    }

    const lines = m.quoted.text.split("\n").map(l => l.trim()).filter(Boolean)
    let currentKategori = null
    let hasilBesar = []
    let totalFee = 0

    for (let line of lines) {
        if (/^k(?:ecil)?\s*:/i.test(line)) {
            currentKategori = "kecil"
            continue
        }
        if (/^b(?:esar)?\s*:/i.test(line)) {
            currentKategori = "besar"
            continue
        }

        if (currentKategori === "besar") {
            const match = line.match(/^([a-zA-Z0-9_]+)\s+(\d+)\s*(\S*)$/)
            if (match) {
                const nama = match[1].toUpperCase()
                const angkaAwal = parseInt(match[2])
                const tambahanHuruf = match[3] ? match[3].toUpperCase() : ""

                const biaya = getBiaya(angkaAwal)
                totalFee += biaya

                const angkaAkhir = /LF|P|A/i.test(tambahanHuruf) ?
                    angkaAwal - biaya :
                    angkaAwal * 2 - biaya

                hasilBesar.push(
                    `${nama} ${angkaAwal} \\ ${angkaAkhir}${tambahanHuruf ? " " + tambahanHuruf : ""}`
                )
            }
        }
    }

    // Pilih emoji random
    const emoji = emojis[Math.floor(Math.random() * emojis.length)]

    let teks = `${emoji} *📊 REKAP BESAR* ${emoji}\n\n`
    teks += hasilBesar.length ? hasilBesar.join("\n") : "Tidak ada"
    teks += `\n\n💵 *Total Fee Admin:* ${totalFee}`
    teks += `\n\n© ${env.ownerName}`

    return m.reply(teks)
}

handler.command = ["rekapb"]
handler.category = "rekap"
handler.description = "Rekap hasil kategori besar saja"
handler.premium = true

module.exports = handler