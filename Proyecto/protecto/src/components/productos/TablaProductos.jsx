import React from "react";
import { Table, Button, Image } from "react-bootstrap";
import categorias from "../../views/Categorias";

const TablaProductos = ({
  productos,
  abrirModalEdicion,
  abrirModalEliminacion,
  generarPDFProducto,
  categorias,
  generarQRImagen,
}) => {
  return (
    <Table striped hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th>Precio</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((producto) => (
          <tr key={producto.id_producto}>
            <td>{producto.id_producto}</td>
            <td>
              {producto.url_imagen ? (
                <Image
                  src={producto.url_imagen}
                  alt={producto.nombre_producto}
                  thumbnail
                  style={{ maxWidth: "60px", maxHeight: "60px" }}
                />
              ) : (
                <i className="bi bi-image text-muted"></i>
              )}
            </td>
            <td>{producto.nombre_producto}</td>
            <td className="d-none d-md-table-cell">
              {producto.descripcion_producto}
            </td>
            <td>${producto.precio_venta}</td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(producto)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => abrirModalEliminacion(producto)}
              >
                <i className="bi bi-trash"></i>
              </Button>
              <Button
                variant="outline-primary"
                size="sm"
                className="m-1"
                onClick={() => generarPDFProducto(producto, categorias)}
              >
                <i className="bi bi-file-earmark-pdf"></i>
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
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaProductos;