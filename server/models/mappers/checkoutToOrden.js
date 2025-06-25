export const checkoutDtoToOrden = (checkoutDto) => {
  const items = (checkoutDto.orderItems || []).map(item => {
    const precioUnitario = Number(item.productPrice);
    const cantidad = item.productQuantity;

    return {
      producto: item.productId,
      proveedor: item.proveedorId,
      nombre: item.productName,
      precioUnitario,
      cantidad,
      subtotal: precioUnitario * cantidad
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    usuario: checkoutDto.receiverId,
    items,
    subtotal,
    envio: checkoutDto.shippingCost || 0,
    total: checkoutDto.totalPrice || subtotal + (checkoutDto.shippingCost || 0),
    metodoPago: checkoutDto.paymentMethod || 'stripe',
    estadoEnvio: mapShippingStatusToEstadoEnvio(checkoutDto.shippingStatus),
    notas: checkoutDto.coupon || '',
    direccionEnvio: {
      pais: checkoutDto.receiverAddress || 'MX',
      coordenadas: {
        type: 'Point',
        coordinates: checkoutDto.coordinates || [0, 0]
      }
    },
    datosContacto: {
      nombre: checkoutDto.receiverName || '',
      telefono: checkoutDto.receiverPhone || '',
      email: checkoutDto.receiverEmail || ''
    }
  };
};


function mapShippingStatusToEstadoEnvio(status) {
  switch (status) {
    case 'PENDIENTE': return 'pendiente';
    case 'PROCESANDO': return 'procesando';
    case 'EN_CAMINO': return 'enviado';
    case 'ENTREGADO': return 'entregado';
    case 'CANCELADO': return 'cancelado';
    default: return 'pendiente';
  }
}
