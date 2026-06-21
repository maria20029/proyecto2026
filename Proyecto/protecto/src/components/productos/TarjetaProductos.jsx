
import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Button, Image, Spinner } from "react-bootstrap";

const TarjetaProductos = ({ productos, abrirModalEdicion, abrirModalEliminacion, generarQRImagen }) => {
    const [cargando, setCargando] = useState(true);
    const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

    useEffect(() => {
        setCargando(!(productos && productos.length > 0));
    }, [productos]);

    const manejarTeclaEscape = useCallback((evento) => {
        if (evento.key === "Escape") setIdTarjetaActiva(null);
    }, []);

    useEffect(() => {
        window.addEventListener("keydown", manejarTeclaEscape);
        return () => window.removeEventListener("keydown", manejarTeclaEscape);
    }, [manejarTeclaEscape]);

    const alternarTarjetaActiva = (id) => {
        setIdTarjetaActiva((prev) => (prev === id ? null : id));
    };

    return (
        <>
            {cargando ? (
                <div className="text-center my-5">
                    <h5>Cargando productos ...</h5>
                    <Spinner animation="border" variant="success" />
                </div>
            ) : (
                <div>
                    {productos.map((producto) => {
                        const tarjetaActiva = idTarjetaActiva === producto.id_producto;

                        return (
                            <Card
                                key={producto.id_producto}
                                className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-producto-contenedor"
                                onClick={() => alternarTarjetaActiva(producto.id_producto)}
                            >
                                <Card.Body
                                    className={`p-2 tarjeta-producto-cuerpo ${tarjetaActiva
                                        ? "tarjeta-producto-cuerpo-activo"
                                        : "tarjeta-producto-cuerpo-inactivo"
                                        }`}
                                >
                                    <Row className="align-items-center gx-3">
                                        <Col xs={2}>
                                            {producto.url_imagen ? (
                                                <Image
                                                    src={producto.url_imagen}
                                                    alt={producto.nombre_producto}
                                                    thumbnail
                                                    style={{ maxWidth: "50px", maxHeight: "50px" }}
                                                />
                                            ) : (
                                                <i className="bi bi-image text-muted fs-3"></i>
                                            )}
                                        </Col>
                                        <Col xs={6}>
                                            <div className="fw-semibold text-truncate">
                                                {producto.nombre_producto}
                                            </div>
                                            <div className="small text-muted text-truncate">
                                                {producto.descripcion_producto}
                                            </div>
                                        </Col>
                                        <Col xs={4} className="text-end">
                                            <div className="fw-semibold">${producto.precio_venta}</div>
                                        </Col>
                                    </Row>
                                </Card.Body>

                                {tarjetaActiva && (
                                    <div
                                        role="dialog"
                                        aria-modal="true"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIdTarjetaActiva(null);
                                        }}
                                        className="tarjeta-producto-capa"
                                    >
                                        <div
                                            className="d-flex gap-2 tarjeta-producto-botones-capa"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                variant="outline-warning"
                                                size="sm"
                                                onClick={() => {
                                                    abrirModalEdicion(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    abrirModalEliminacion(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                            >
                                                <i className="bi bi-trash"></i>
                                            </Button>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => {
                                                    generarQRImagen(producto);
                                                    setIdTarjetaActiva(null);
                                                }}
                                                title="Generar código QR de la imagen"
                                            >
                                                <i className="bi bi-qr-code"></i>
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default TarjetaProductos;