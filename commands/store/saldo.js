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
    let who
    let user = db.list().user[m.sender]
    let name = await conn.getName(m.sender)
    if (m.isGroup) who = m.mentionedJid ? m.mentionedJid : m.sender
    else who = m.sender
    if (typeof db.list().user[who] == 'undefined') throw 'Pengguna tidak ada didalam data base'
    m.reply(`*━━ CHECK YOUR INFO ━━*

 _• *Name:* ${name}_
 _• *Nomer:* ${m.sender.split('@')[0]}_
 _• *Saldo:* Rp${toRupiah(user.saldo)}_

*Note :*
_Saldo hanya bisa untuk beli di bot_
_Tidak bisa ditarik atau transfer_!`)
}
handler.command = ['saldo', 'ceksaldo'];
handler.category = 'store';
handler.description = 'Cek Saldo user.';

module.exports = handler;

function toRupiah(angka) {
    var saldo = '';
    var angkarev = angka.toString().split('').reverse().join('');
    for (var i = 0; i < angkarev.length; i++)
        if (i % 3 == 0) saldo += angkarev.substr(i, 3) + '.';
    return '' + saldo.split('', saldo.length - 1).reverse().join('');
}