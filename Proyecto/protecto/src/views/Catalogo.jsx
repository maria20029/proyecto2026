import React, { useEffect, useState, useMemo } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfing";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";

const Catalogo = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
    const [textoBusqueda, setTextoBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            setError(null);

            const [resProductos, resCategorias] = await Promise.all([
                supabase
                    .from("productos")
                    .select("*")
                    .order("nombre_producto", { ascending: true }),

                supabase
                    .from("categorias")
                    .select("id_categoria, nombre_categoria")
                    .order("nombre_categoria", { ascending: true }),
            ]);

            if (resProductos.error) throw resProductos.error;
            if (resCategorias.error) throw resCategorias.error;

            setProductos(resProductos.data || []);
            setCategorias(resCategorias.data || []);
        } catch (err) {
            console.error("Error al cargar catálogo:", err);
            setError("No se pudieron cargar los productos. Intenta más tarde.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const productosFiltrados = useMemo(() => {
        let filtrados = productos;

        if (categoriaSeleccionada !== "todas") {
            filtrados = filtrados.filter(
                (producto) =>
                    producto.categoria_producto === parseInt(categoriaSeleccionada)
            );
        }

        if (textoBusqueda.trim()) {
            const texto = textoBusqueda.toLowerCase().trim();

            filtrados = filtrados.filter((producto) => {
                const nombre = producto.nombre_producto?.toLowerCase() || "";
                const descripcion =
                    producto.descripcion_producto?.toLowerCase() || "";
                const precio = producto.precio_producto?.toString() || "";

                return (
                    nombre.includes(texto) ||
                    descripcion.includes(texto) ||
                    precio.includes(texto)
                );
            });
        }

        return filtrados;
    }, [productos, categoriaSeleccionada, textoBusqueda]);

    const manejarCambioCategoria = (e) => {
        setCategoriaSeleccionada(e.target.value);
    };

    const manejarCambioBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    const obtenerNombreCategoria = (idCategoria) => {
        const categoria = categorias.find(
            (cat) => cat.id_categoria === idCategoria
        );

        return categoria ? categoria.nombre_categoria : "Sin categoría";
    };

    return (
        <Container className="mt-3 px-1">
            <Row className="text-center mb-3">
                <Col>
                    <h2 className="fw-bold">Catálogo</h2>
                    <p className="lead text-muted">Nuestros productos disponibles</p>
                </Col>
            </Row>

            <Row className="mb-4 align-items-end">
                <Col md={6} lg={6} className="mb-2">
                    <Form.Group controlId="filtroCategoria">
                        <Form.Label>Categoría</Form.Label>

                        <Form.Select
                            value={categoriaSeleccionada}
                            onChange={manejarCambioCategoria}
                            className="shadow-sm"
                        >
                            <option value="todas">Todas las categorías</option>

                            {categorias.map((cat) => (
                                <option
                                    key={`categoria-${cat.id_categoria}`}
                                    value={cat.id_categoria}
                                >
                                    {cat.nombre_categoria}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col md={6} lg={6} className="mb-2">
                    <Form.Group controlId="busquedaProducto">
                        <Form.Label>Buscar producto</Form.Label>

                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre, descripción o precio..."
                            value={textoBusqueda}
                            onChange={manejarCambioBusqueda}
                            className="shadow-sm"
                        />
                    </Form.Group>
                </Col>
            </Row>

            {cargando && (
                <Row className="text-center py-5">
                    <Col>
                        <Spinner animation="border" variant="success" size="lg" />
                        <p className="mt-3 text-muted">Cargando productos...</p>
                    </Col>
                </Row>
            )}

            {!cargando && error && (
                <Alert variant="danger" className="text-center">
                    {error}
                </Alert>
            )}

            {!cargando && !error && productosFiltrados.length === 0 && (
                <Alert variant="info" className="text-center">
                    No se encontraron productos que coincidan con tu búsqueda.
                </Alert>
            )}

            {!cargando && !error && productosFiltrados.length > 0 && (
                <Row className="g-3">
                    {productosFiltrados.map((producto) => (
                        <Col
                            xs={6}
                            sm={6}
                            md={4}
                            lg={3}
                            key={`producto-${producto.id_producto}`}
                        >
                            <TarjetaCatalogo
                                producto={producto}
                                categoriaNombre={obtenerNombreCategoria(
                                    producto.categoria_producto
                                )}
                            />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default Catalogo;