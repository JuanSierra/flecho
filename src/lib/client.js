const Client = class {
    #logout;
    #renawal;

    constructor() {
      this.#logout = false;
      this.#renawal = null;
    }

    get logout() {
        return this.#logout;
    }

    set logout(val) {
        this.#logout = val;
    }

    get renawal() {
        return this.#renawal;
    }

    set renawal(val) {
        this.#renawal = val;
    }
};
  
module.exports = {
    Client
};