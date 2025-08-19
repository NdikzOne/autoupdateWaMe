const fs = require('fs');

const addDeposit = (userId, amount, _dir) => {
let position = null
Object.keys(_dir).forEach((x) => {
if (_dir[x].id === userId) {
position = x
}
})
if (position !== null) {
_dir[position].saldo += amount
fs.writeFileSync('./database/userdepo.json', JSON.stringify(_dir, null, 3))
} else {
var object_add = (amount)
_dir.push(object_add)
fs.writeFileSync('./database/userdepo.json', JSON.stringify(_dir, null, 3))
}
}

module.exports = { addDeposit }