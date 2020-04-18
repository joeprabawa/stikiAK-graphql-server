const { gql } = require("apollo-server");
module.exports = gql`
  type Mahasiswa {
    id: Int
    nim: ID
    nama: String
    ttl: String
    kota: String
    jurusan: String
    angkatan: String
    background: String
    statMenikah: String
    statKerja: String
    khs: [Semester]
  }

  type Semester {
    semester: Int
    totalSKS: Int
    indeksSemester: Float
    data: [Nilai]
  }

  type Nilai {
    kodeMK: String
    namaMatkul: String
    semester: Int
    nilaiReg: Float
    nilaiSKS: Float
    jumlahSKS: Int
  }

  type Query {
    mahasiswas(jurusan: String, angkatan: String, limit: Int): [Mahasiswa]
    mahasiswa(nim: String): Mahasiswa
  }
`;
