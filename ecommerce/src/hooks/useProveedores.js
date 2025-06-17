import { useEffect, useState } from "react";

export function useProveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProveedores = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        console.log('Token exists:', !!token);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
        
        console.log('Obteniendo proveedores desde:', `${API_URL}/proveedores`);
        
        const res = await fetch(`${API_URL}/proveedores`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('Proveedores obtenidos:', data);
        setProveedores(data);
      } catch (err) {
        console.error('Error al obtener proveedores:', err);
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProveedores();
  }, []);

  return { proveedores, loading, error };
}