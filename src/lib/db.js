const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const crypto = require("crypto");

module.exports = class DB {
    #db;
    constructor() {
        const adapter = new FileSync('db.json');
        this.#db = low(adapter);
    }

    init(){
        this.#db.defaults({ clients: [] })
        .write();
    }

    add(client) {
        client.id = crypto.randomBytes(16).toString("hex");

        this.#db.get('clients')
        .push(client)
        .write();

        return client.id;
    }

    getById(id) {
        var client = this.#db.get('clients').filter({ id: id }).value()

        return client;
    }

    // property -> { renewal: '20120504'}
    update(id, property) {
        this.#db.get('clients')
            .find({ id: id })
            .assign(property)
            .write();
    }
}