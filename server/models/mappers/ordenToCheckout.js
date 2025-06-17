export const ordenToCheckoutDto = (orden) => {
  const date = new Date(orden.createdAt);

  return {
    _id: orden._id.toString(),
    receiverId: orden.usuario?._id?.toString() || '',
    receiverName: orden.datosContacto?.nombre || '',
    receiverAddress: `${orden.direccionEnvio?.pais || ''}`,
    orderItems: orden.items.map(item => ({
      foundationId: item.foundationId || '',
      productCategory: item.productCategory || '',
      productId: item.producto?._id?.toString() || '',
      productImage: item.productImage || '',
      productName: item.nombre || '',
      productPrice: item.precioUnitario.toString(),
      productQuantity: item.cantidad
    })),
    shippingMethod: 'ESTANDAR', // o mapeo según lógica
    coupon: orden.notas || '',
    formattedCheckoutDate: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
    formattedCheckoutTime: date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: true }),
    checkoutDate: date.getTime(),
    shippingCost: orden.envio || 0,
    shippingDescription: 'Tiempo estimado de llegada al almacen 2 - 3 dias',
    paymentMethod: orden.metodoPago === 'efectivo' ? 'Cash On Delivery' : orden.metodoPago,
    totalPrice: orden.total,
    shippingStatus: mapEstadoEnvio(orden.estadoEnvio),
    __v: orden.__v
  };
};

function mapEstadoEnvio(estado) {
  switch (estado) {
    case 'pendiente': return 'PENDIENTE';
    case 'procesando': return 'PROCESANDO';
    case 'enviado': return 'EN_CAMINO';
    case 'entregado': return 'ENTREGADO';
    case 'cancelado': return 'CANCELADO';
    default: return 'PENDIENTE';
  }
}
