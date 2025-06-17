export const checkoutDtoToOrden = (checkoutDto) => {
  return {
    // No agrego _id aquí porque lo genera Mongoose
    usuario: checkoutDto.receiverId, // ObjectId como string
    items: (checkoutDto.orderItems || []).map(item => ({
      foundationId: item.foundationId,
      productCategory: item.productCategory,
      producto: item.productId,  // ObjectId string
      productImage: item.productImage,
      nombre: item.productName,
      precioUnitario: Number(item.productPrice),
      cantidad: item.productQuantity,
      subtotal: Number(item.productPrice) * item.productQuantity
    })),
    envio: checkoutDto.shippingCost || 0,
    notas: checkoutDto.coupon || '',
    metodoPago: 'stripe',
    total: checkoutDto.totalPrice || 0,
    estadoEnvio: mapShippingStatusToEstadoEnvio(checkoutDto.shippingStatus),
    direccionEnvio: {
      pais: checkoutDto.receiverAddress || 'MX'
      // Podrías agregar calle, ciudad, etc si los recibes
    },
    datosContacto: {
      nombre: checkoutDto.receiverName || '',
      telefono: '',  // Si tienes disponible, agregar
      email: ''     // Si tienes disponible, agregar
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
