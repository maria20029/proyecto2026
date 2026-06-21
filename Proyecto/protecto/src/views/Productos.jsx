import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfing";

import ModalRegistroProducto from "../components/productos/ModalRegistroProducto";
import ModalEdicionProducto from "../components/productos/ModalEdicionProducto";
import ModalEliminacionProducto from "../components/productos/ModalEliminacionProducto";
import ModalQRProducto from "../components/productos/ModalQRProducto";

import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusqueda";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaProductos from "../components/productos/TablaProductos";
import TarjetaProductos from "../components/productos/TarjetaProductos";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    categoria_producto: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Manejo de inputs
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  // Filtrado de productos
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();
      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";
        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });
      setProductosFiltrados(filtrados);
    }
  }, [textoBusqueda, productos]);

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, []);

  // Cargar categorías
  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_categoria", { ascending: true });
      if (error) throw error;
      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  // Cargar productos
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("id_producto", { ascending: true });
      if (error) throw error;
      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al cargar productos",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // Agregar producto con imagen
  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.categoria_producto ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          mensaje:
            "Completa los campos obligatorios (nombre, categoría, precio e imagen)",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModal(false);

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);
      const urlPublica = urlData.publicUrl;

      const { error } = await supabase.from("productos").insert([
        {
          nombre_producto: nuevoProducto.nombre_producto,
          descripcion_producto: nuevoProducto.descripcion_producto || null,
          categoria_producto: nuevoProducto.categoria_producto,
          precio_venta: parseFloat(nuevoProducto.precio_venta),
          url_imagen: urlPublica,
        },
      ]);

      if (error) throw error;

      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        archivo: null,
      });

      setToast({
        mostrar: true,
        mensaje: "Producto registrado correctamente",
        tipo: "exito",
      });
      await cargarProductos();
    } catch (err) {
      console.error("Error al agregar producto:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al registrar producto",
        tipo: "error",
      });
    }
  };

  // Manejo de inputs de edición
  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setProductoEditar((prev) => ({ ...prev, [name]: value }));
  };

  const manejoCambioArchivoActualizar = (e) => {
    const archivo = e.target.files[0];
    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({ ...prev, archivo }));
    } else {
      alert("Selecciona una imagen válida (JPG, PNG, etc.)");
    }
  };

  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombre_producto.trim() ||
        !productoEditar.categoria_producto ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa los campos obligatorios",
          tipo: "advertencia",
        });
        return;
      }

      setMostrarModalEdicion(false);

      let datosActualizados = {
        nombre_producto: productoEditar.nombre_producto,
        descripcion_producto: productoEditar.descripcion_producto || null,
        categoria_producto: productoEditar.categoria_producto,
        precio_venta: parseFloat(productoEditar.precio_venta),
        url_imagen: productoEditar.url_imagen,
      };

      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);
        datosActualizados.url_imagen = urlData.publicUrl;

        if (productoEditar.url_imagen) {
          const nombreAnterior = productoEditar.url_imagen
            .split("/")
            .pop()
            .split("?")[0];
          await supabase.storage
            .from("imagenes_productos")
            .remove([nombreAnterior])
            .catch(() => {});
        }
      }

      const { error } = await supabase
        .from("productos")
        .update(datosActualizados)
        .eq("id_producto", productoEditar.id_producto);

      if (error) throw error;

      await cargarProductos();

      setProductoEditar({
        id_producto: "",
        nombre_producto: "",
        descripcion_producto: "",
        categoria_producto: "",
        precio_venta: "",
        url_imagen: "",
        archivo: null,
      });

      setToast({
        mostrar: true,
        mensaje: "Producto actualizado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al actualizar:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al actualizar producto",
        tipo: "error",
      });
    }
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    try {
      setMostrarModalEliminacion(false);

      if (productoAEliminar.url_imagen) {
        const nombreArchivo = productoAEliminar.url_imagen
          .split("/")
          .pop()
          .split("?")[0];
        await supabase.storage
          .from("imagenes_productos")
          .remove([nombreArchivo])
          .catch(() => {});
      }

      const { error } = await supabase
        .from("productos")
        .delete()
        .eq("id_producto", productoAEliminar.id_producto);

      if (error) throw error;

      await cargarProductos();

      setToast({
        mostrar: true,
        mensaje: "Producto eliminado correctamente",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al eliminar:", err);
      setToast({
        mostrar: true,
        mensaje: "Error al eliminar producto",
        tipo: "error",
      });
    }
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditar(producto);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoAEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const generarPDFProducto = (producto, categorias = []) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Reporte de Producto", 14, 20);
    doc.line(14, 25, 195, 25);

    // Buscar nombre de la categoría solo si categorias es array
    let categoriaNombre = "Sin categoría";
    if (Array.isArray(categorias)) {
      const categoria = categorias.find(
        (cat) => cat.id_categoria === producto.categoria_producto,
      );
      if (categoria) categoriaNombre = categoria.nombre_categoria;
    }

    autoTable(doc, {
      startY: 35,
      head: [["Campo", "Valor"]],
      body: [
        ["ID", producto.id_producto],
        ["Nombre", producto.nombre_producto],
        ["Descripción", producto.descripcion_producto || "Sin descripción"],
        ["Precio", `C$ ${parseFloat(producto.precio_venta).toFixed(2)}`],
        ["Categoría", categoriaNombre],
      ],
    });

    doc.save(`producto_${producto.id_producto}.pdf`);
  };

  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [productoQR, setProductoQR] = useState(null);

  const generarQRImagen = (producto) => {
    if (!producto?.url_imagen) {
      setToast({
        mostrar: true,
        mensaje: "Este producto no tiene imagen asociada",
        tipo: "advertencia",
      });
      return;
    }

    setProductoQR(producto);
    setMostrarModalQR(true);
  };

  return (
    <Container className="mt-3">
      {/* Título y botón */}
      <Row className="align-items-center mb-3">
        <Col className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-bag-heart-fill me-2"></i> Productos
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} size="md">
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Producto</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Cuadro de búsqueda */}
      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio ..."
          />
        </Col>
      </Row>

      {/* Vista en tabla para escritorio */}
      <Row>
        <Col lg={12} className="d-none d-lg-block">
          {cargando ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" size="lg" />
              <p className="mt-3 text-muted">Cargando productos ...</p>
            </div>
          ) : (
            productosFiltrados.length > 0 && (
              <TablaProductos
                productos={productosFiltrados}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
                generarPDFProducto={generarPDFProducto}
                categorias={categorias}
                generarQRImagen={generarQRImagen}
                
              />
            )
          )}
        </Col>
      </Row>

      {/* Vista en tarjetas para móvil */}
      <Col xs={12} className="d-lg-none">
        {cargando ? (
          <div className="text-center my-5">
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando productos ...</p>
          </div>
        ) : (
          productosFiltrados.length > 0 && (
            <TarjetaProductos
              productos={productosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
              generarPDFProducto={generarPDFProducto}
              generarQRImagen={generarQRImagen}
            />
          )
        )}
      </Col>

      {/* Modales */}
      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoActualizar={manejoCambioArchivoActualizar}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        producto={productoAEliminar}
        eliminarProducto={eliminarProducto}
      />

      <ModalQRProducto
        mostrar={mostrarModalQR}
        onHide={() => setMostrarModalQR(false)}
        producto={productoQR}
      />

      {/* Notificación */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Productos;