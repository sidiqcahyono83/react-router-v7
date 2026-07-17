export function Welcome() {
  const features = [
    {
      title: "Internet Cepat",
      description:
        "Kecepatan hingga 1 Gbps dengan koneksi Fiber Optic yang stabil.",
      icon: "⚡",
    },
    {
      title: "Support 24/7",
      description: "Tim teknis siap membantu kapan pun Anda membutuhkan.",
      icon: "🎧",
    },
    {
      title: "99.9% Uptime",
      description: "Jaringan handal dengan monitoring selama 24 jam.",
      icon: "🛡️",
    },
    {
      title: "Harga Terjangkau",
      description:
        "Berbagai pilihan paket sesuai kebutuhan rumah maupun bisnis.",
      icon: "💰",
    },
  ];
  const packages = [
    { name: "Home", speed: "30 Mbps", price: "Rp 165.000" },
    { name: "Premium", speed: "60 Mbps", price: "Rp 399.000" },
    { name: "Business", speed: "300 Mbps", price: "Hubungi Kami" },
  ];
  return (
    <div className="bg-white text-gray-800">
      {" "}
      {/* Navbar */}{" "}
      <nav className="sticky top-0 z-50 bg-white shadow">
        {" "}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          {" "}
          {/* <h1 className="text-2xl font-bold text-blue-600">
            {" "}
            BillingISP{" "}
          </h1>{" "} */}
          <div className="flex gap-4 text-sm md:gap-8 md:text-base">
            {" "}
            <a href="#home" className="hover:text-blue-600">
              {" "}
              Home{" "}
            </a>{" "}
            <a href="#fitur" className="hover:text-blue-600">
              {" "}
              Fitur{" "}
            </a>{" "}
            <a href="#paket" className="hover:text-blue-600">
              {" "}
              Paket{" "}
            </a>{" "}
            <a href="#kontak" className="hover:text-blue-600">
              {" "}
              Kontak{" "}
            </a>{" "}
          </div>{" "}
          {/* <a
            href="/login"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
          >
            {" "}
            Login Admin{" "}
          </a>{" "} */}
        </div>{" "}
      </nav>{" "}
      {/* Hero */}{" "}
      <section id="home" className="bg-blue-700 to-cyan-500 text-white">
        {" "}
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-10 items-center">
          {" "}
          <div>
            {" "}
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {" "}
              Internet Cepat, <br /> Stabil &{" "}
              <span className="text-yellow-300"> Terpercaya </span>{" "}
            </h1>{" "}
            <p className="mt-8 text-lg text-blue-100 leading-8">
              {" "}
              Kami menyediakan layanan internet Fiber Optic berkualitas tinggi
              untuk rumah, kantor, sekolah, UMKM, hingga perusahaan dengan
              dukungan teknisi profesional.{" "}
            </p>{" "}
            <div className="mt-10 flex flex-wrap gap-4">
              {" "}
              <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300">
                {" "}
                Daftar Sekarang{" "}
              </button>{" "}
              <button className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700">
                {" "}
                Lihat Paket{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex justify-center">
            {" "}
            <img
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
              alt="Internet"
              className="rounded-2xl shadow-2xl"
            />{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Statistik */}{" "}
      <section className="bg-gray-200 py-16">
        {" "}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {" "}
          <div>
            {" "}
            <h2 className="text-4xl font-bold text-blue-600">10+</h2>{" "}
            <p>Tahun Pengalaman</p>{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-4xl font-bold text-blue-600">5000+</h2>{" "}
            <p>Pelanggan</p>{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-4xl font-bold text-blue-600">99.9%</h2>{" "}
            <p>Network Uptime</p>{" "}
          </div>{" "}
          <div>
            {" "}
            <h2 className="text-4xl font-bold text-blue-600">24/7</h2>{" "}
            <p>Technical Support</p>{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* Features */}{" "}
      <section id="fitur" className="max-w-7xl mx-auto px-6 py-24">
        {" "}
        <div className="text-center">
          {" "}
          <h2 className="text-4xl font-bold"> Kenapa Memilih Kami? </h2>{" "}
          <p className="text-gray-500 mt-4">
            {" "}
            Kami selalu memberikan layanan terbaik kepada pelanggan.{" "}
          </p>{" "}
        </div>{" "}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {" "}
          {features.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border p-8 hover:shadow-xl transition"
            >
              {" "}
              <div className="text-5xl"> {item.icon} </div>{" "}
              <h3 className="font-bold text-xl mt-5"> {item.title} </h3>{" "}
              <p className="text-gray-500 mt-3"> {item.description} </p>{" "}
            </div>
          ))}{" "}
        </div>{" "}
      </section>{" "}
      {/* Paket */}{" "}
      <section id="paket" className="bg-gray-100 py-24">
        {" "}
        <div className="max-w-7xl mx-auto px-6">
          {" "}
          <div className="text-center">
            {" "}
            <h2 className="text-4xl font-bold"> Paket Internet </h2>{" "}
            <p className="text-gray-500 mt-3">
              {" "}
              Pilih paket sesuai kebutuhan Anda.{" "}
            </p>{" "}
          </div>{" "}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {" "}
            {packages.map((item) => (
              <div
                key={item.name}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                {" "}
                <h3 className="text-2xl font-bold"> {item.name} </h3>{" "}
                <p className="text-5xl font-bold text-blue-600 mt-8">
                  {" "}
                  {item.speed}{" "}
                </p>{" "}
                <p className="text-2xl mt-8"> {item.price} </p>{" "}
                <button className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                  {" "}
                  Pilih Paket{" "}
                </button>{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>{" "}
      </section>{" "}
      {/* CTA */}{" "}
      <section className="bg-blue-700 text-white py-24">
        {" "}
        <div className="max-w-5xl mx-auto text-center px-6">
          {" "}
          <h2 className="text-5xl font-bold"> Siap Berlangganan? </h2>{" "}
          <p className="mt-6 text-xl text-blue-100">
            {" "}
            Hubungi kami sekarang dan nikmati internet cepat tanpa batas.{" "}
          </p>{" "}
          <button className="mt-10 bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-300">
            {" "}
            Hubungi Kami{" "}
          </button>{" "}
        </div>{" "}
      </section>{" "}
      {/* Footer */}{" "}
      <footer id="kontak" className="bg-gray-900 text-gray-300 py-10">
        {" "}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6">
          {" "}
          <div>
            {" "}
            <h2 className="text-white text-2xl font-bold"> BillingISP </h2>{" "}
            <p className="mt-3">
              {" "}
              Solusi Internet Cepat untuk Rumah dan Bisnis.{" "}
            </p>{" "}
          </div>{" "}
          <div>
            {" "}
            <p>Email : info@billingisp.com</p>{" "}
            <p>Telepon : 0812-3456-7890</p>{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
    </div>
  );
}
