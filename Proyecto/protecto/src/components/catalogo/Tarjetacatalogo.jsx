import React, { useState } from "react";
import { Card, Badge, Modal, Button } from "react-bootstrap";

const TarjetaCatalogo = ({ producto, categoriaNombre }) => {
    const [mostrarModal, setMostrarModal] = useState(false);

    const descripcion = producto.descripcion_producto || "";

    const previsualizacionTexto =
        descripcion.length > 50
            ? descripcion.substring(0, 50) + "..."
            : descripcion;

    const tieneMasTexto = descripcion.length > 50;

    const precio = Number(producto.precio_venta || 0).toFixed(2);

    return (
        <>
            <Card
                className="h-100 border-0 shadow-lg overflow-hidden position-relative"
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onClick={() => setMostrarModal(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") setMostrarModal(true);
                }}
            >
                <div className="position-relative overflow-hidden">
                    {producto.url_imagen ? (
                        <img
                            src={producto.url_imagen}
                            alt={producto.nombre_producto}
                            className="card-img-top"
                            style={{
                                height: "180px",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        <div
                            className="d-flex align-items-center justify-content-center bg-light text-muted"
                            style={{ height: "180px" }}
                        >
                            Sin imagen
                        </div>
                    )}
                </div>

                <Card.Body className="d-flex flex-column p-3">
                    <Card.Title className="fw-bold text-dark mb-2">
                        {producto.nombre_producto}
                    </Card.Title>

                    {descripcion && (
                        <Card.Text className="text-muted small flex-grow-1">
                            {previsualizacionTexto}
                            {tieneMasTexto && (
                                <span className="text-primary fw-medium ms-1">
                                    Leer más
                                </span>
                            )}
                        </Card.Text>
                    )}

                    <div className="mt-2">
                        <Badge bg="secondary">
                            {categoriaNombre || "Sin categoría"}
                        </Badge>
                    </div>

                    <div className="mt-auto pt-2">
                        <h5 className="text-success fw-bold mb-0">
                            C${precio}
                        </h5>
                    </div>
                </Card.Body>
            </Card>

            <Modal
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold fs-4">
                        {producto.nombre_producto}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-4">
                    <div className="row g-4">
                        <div className="col-md-5">
                            {producto.url_imagen ? (
                                <img
                                    src={producto.url_imagen}
                                    alt={producto.nombre_producto}
                                    className="img-fluid rounded shadow-sm"
                                    style={{
                                        maxHeight: "400px",
                                        objectFit: "contain",
                                        width: "100%",
                                    }}
                                />
                            ) : (
                                <div
                                    className="bg-secondary-subtle rounded d-flex align-items-center justify-content-center"
                                    style={{ height: "400px" }}
                                >
                                    <span className="bi bi-image text-muted fs-1"></span>
                                </div>
                            )}
                        </div>

                        <div className="col-md-7">
                            <div className="d-flex align-items-center mb-3">
                                <Badge bg="secondary" pill className="me-2">
                                    Categoría
                                </Badge>
                                <span>{categoriaNombre || "Sin categoría"}</span>
                            </div>

                            <h3 className="text-success fw-bold mb-4">
                                C${precio}
                            </h3>

                            <div className="mb-4">
                                <h5 className="fw-semibold mb-2">
                                    Descripción
                                </h5>
                                <p className="text-muted text-break">
                                    {descripcion || "Sin descripción"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="border-0">
                    <Button
                        variant="secondary"
                        onClick={() => setMostrarModal(false)}
                    >
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TarjetaCatalogo;