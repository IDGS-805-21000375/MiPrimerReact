import React, { useState, useEffect } from 'react';
import './App.css';

// Componente para mostrar cada vuelo individual
function Vuelo({ vuelo }) {
  const [, codigo, pais, , , lon, lat, , , velocidad] = vuelo;

  return (
    <tr>
      <td>{codigo || "Desconocido"}</td>
      <td>{pais || "N/A"}</td>
      <td>{lon ? lon.toFixed(2) : "N/A"}</td>
      <td>{lat ? lat.toFixed(2) : "N/A"}</td>
      <td>{velocidad ? `${velocidad.toFixed(2)} m/s` : "N/A"}</td>
    </tr>
  );
}

// Componente para la tabla de vuelos
function TablaVuelos({ vuelos }) {
  return (
    <div className="table-responsive shadow rounded">
      <table className="table table-hover table-bordered text-center align-middle">
        <thead className="table-primary">
          <tr>
            <th>Código Vuelo</th>
            <th>País Origen</th>
            <th>Longitud</th>
            <th>Latitud</th>
            <th>Velocidad</th>
          </tr>
        </thead>
        <tbody>
          {vuelos.length > 0 ? (
            vuelos.map((v, i) => <Vuelo key={i} vuelo={v} />)
          ) : (
            <tr>
              <td colSpan="5" className="text-muted">No hay vuelos disponibles</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Componente principal App
function App() {
  const [vuelos, setVuelos] = useState([]);
  const [paisFiltro, setPaisFiltro] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const titulo = "✈️ Vuelos en Tiempo Real";

  useEffect(() => {
    async function fetchVuelos() {
      try {
        setCargando(true);
        let response = await fetch("https://opensky-network.org/api/states/all");
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        let data = await response.json();
        // Guardamos solo 50 vuelos para mostrar
        if (data.states) {
          setVuelos(data.states.slice(0, 50));
        } else {
          setVuelos([]);
        }
        setError(null);
      } catch (error) {
        console.error("Error al obtener vuelos:", error);
        setError("Error al cargar los vuelos. Intenta nuevamente.");
      } finally {
        setCargando(false);
      }
    }

    fetchVuelos();
    const intervalo = setInterval(fetchVuelos, 15000); 
    
    // Cleanup function
    return () => clearInterval(intervalo);
  }, []);

  // Función para filtrar vuelos por país
  const filtrarPorPais = (vuelos) => {
    if (!paisFiltro) return vuelos;
    return vuelos.filter((v) => 
      v[2]?.toLowerCase().includes(paisFiltro.toLowerCase())
    );
  };

  const vuelosFiltrados = filtrarPorPais(vuelos);

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <h1 className="text-center text-primary fw-bold mb-4">
          {titulo}
        </h1>

        {/* Imagen decorativa */}
        <div className="text-center mb-4">
          <img
            src="https://img.icons8.com/color/96/airplane-take-off.png"
            alt="Avión"
            className="img-fluid"
          />
        </div>

        {/* Input de filtro */}
        <div className="input-group mb-4 shadow-sm">
          <span className="input-group-text bg-primary text-white">Filtrar por País</span>
          <input
            type="text"
            className="form-control"
            placeholder="Ejemplo: Mexico"
            value={paisFiltro}
            onChange={(e) => setPaisFiltro(e.target.value)}
          />
        </div>

        {/* Estados de carga y error */}
        {cargando && (
          <div className="text-center mb-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando vuelos...</span>
            </div>
            <p className="mt-2 text-muted">Cargando vuelos en tiempo real...</p>
          </div>
        )}

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        {/* Información de resultados */}
        {!cargando && !error && paisFiltro && (
          <div className="alert alert-info mb-3">
            Mostrando {vuelosFiltrados.length} vuelos filtrados por: "{paisFiltro}"
          </div>
        )}

        {/* Tabla con los vuelos filtrados */}
        {!cargando && !error && <TablaVuelos vuelos={vuelosFiltrados} />}
      </div>
    </div>
  );
}

export default App;