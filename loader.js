const DataLoader = require("dataloader");
const knex = require("./knexInit");

const loader = {
  ipk: new DataLoader(async (nim) => {
    const searchIPK = await knex
      .raw(
        `SELECT d.nim, (SELECT SUM((teori+prak)*na)/SUM(teori+prak) FROM nilai WHERE nim=d.nim) AS IPK FROM du d WHERE d.nim = any(?)`,
        [[nim]]
      )
      .toSQL();
    const found = searchIPK[0];
    const conc = searchIPK.bindings.reduce((acc, val, _, arr) => {
      return acc.concat(val[0]);
    }, []);

    const reduced = conc.reduce((acc, val) => {
      acc[val.nim] = val;
      return acc;
    }, {});
    return nim.map((val) => reduced[val.nim] || null);
  }),
};

module.exports = { loader };
