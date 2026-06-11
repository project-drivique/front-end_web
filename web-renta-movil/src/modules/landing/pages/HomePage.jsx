import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Renta Móvil Location</h1>

          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/" className="hover:underline">
              Inicio
            </Link>
            <Link to="/vehiculos" className="hover:underline">
              Catálogo
            </Link>
            <Link to="/reservas" className="hover:underline">
              Reservas
            </Link>
            <Link to="/contratos" className="hover:underline">
              Contratos
            </Link>
            {!isAuthenticated ? (
              <Link to="/login" className="hover:underline">
                Login
              </Link>
            ) : (
              <Link to="/perfil" className="hover:underline">
                Perfil
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <section className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Bienvenido a Renta Móvil
          </h2>
          <p className="text-gray-600 max-w-2xl">
            {isAuthenticated
              ? `Hola, ${user?.nombre || user?.name || "usuario"}. Usa el menú para entrar al catálogo de vehículos y continuar con el flujo.`
              : "Usa el menú para explorar el catálogo de vehículos y acceder a las demás secciones."}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/vehiculos"
              className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold"
            >
              Ir al catálogo
            </Link>
            <Link
              to="/reservas"
              className="px-5 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            >
              Ver reservas
            </Link>
            <Link
              to="/contratos"
              className="px-5 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold"
            >
              Ver contratos
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;