import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/components/Home";
import Login from "@/components/auth/Login";
import Register from "@/components/auth/Register";
import Products from "@/pages/Products";
import DeliveryPage from "@/pages/delivery";
import DeliverySimulation from "@/pages/delivery/DeliverySimulation";
import HistorialCompras from "@/pages/HistorialCompras";
import { CarritoProvider } from "@/context/CarritoContext";
import Proveedores from "@/pages/Proveedores";
// import CarritoMejorado from "@/components/carrito/CarritoMejorado"; // Eliminar importación

function App() {
  return (
    <CarritoProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/proveedores" element={<Proveedores />} />
          <Route path="/delivery" element={<DeliveryPage />} />
          <Route path="/delivery-simulation" element={<DeliverySimulation />} />
          <Route path="/historial-compras" element={<HistorialCompras />} />
        </Routes>
      </Router>
    </CarritoProvider>
  );
}

export default App;