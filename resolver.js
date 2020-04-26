const { getKHS, getMahasiswas, getMahasiswa } = require("./functions");
module.exports = {
  Query: {
    mahasiswa: async (_parent, args, _ctx, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      const getMhsOne = await getMahasiswa(args);
      return getMhsOne;
    },
    mahasiswas: async (_, args, _ctx, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      const getMhs = await getMahasiswas(args);
      return getMhs;
    },
  },
  Mahasiswa: {
    khs: async (parent, args, _, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      const resolved = await getKHS(parent, args);
      return resolved;
    },

    ipk: async ({ nim }, _, { loader }, info) => {
      info.cacheControl.setCacheHint({ maxAge: 240, scope: "PRIVATE" });
      const load = await loader.ipk.load(nim);
      return load.IPK;
    },
  },
};
