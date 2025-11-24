import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Presentacion from "./pages/Presentacion";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Intereses from "./pages/Intereses";
import ForYouPage from "./pages/ForYouPage";
import LugaresPage from "./pages/LugaresPage";
import RDFViewer from "./pages/RDFViewer";
import FavoritosPage from "./pages/FavoritosPage";
import ReseñasPage from "./pages/ReseñasPage";
import ContactanosPage from "./pages/ContactanosPage";
import Rutas from "./pages/Rutas";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Presentacion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/intereses" element={<Intereses />} />
        <Route path="/foryou" element={<ForYouPage />} />
        <Route path="lugares" element={<LugaresPage />} />
        <Route path="/rdf" element={<RDFViewer />} />
        <Route path="/favoritos" element={<FavoritosPage />} />
        <Route path="/reseñas" element={<ReseñasPage />} />
        <Route path="/contactanos" element={<ContactanosPage />} />
        <Route path="/rutas" element={<Rutas />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;