import { useState, useEffect } from "react"
import productService from "../lib/api/productService"

export const useProducts = (proveedorId = null) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [cart, setCart] = useState([])
  const [notification, setNotification] = useState(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('todos')
  const [priceRange, setPriceRange] = useState('todos')

  const categories = [
    { id: 'todos', name: 'Todos' },
    { id: 'materiales', name: 'Materiales' },
    { id: 'equipos', name: 'Equipos' },
    { id: 'alimentos', name: 'Alimentos' },
    { id: 'gaseosas', name: 'Gaseosas' },
    { id: 'otros', name: 'Otros' }
  ]

  const priceRanges = [
    { id: 'todos', name: 'Todos los precios' },
    { id: '0-50', name: 'Hasta $50' },
    { id: '50-100', name: 'De $50 a $100' },
    { id: '100+', name: 'Más de $100' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [proveedorId]) // Añadir proveedorId como dependencia

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory
    const price = product.price
    let matchesPrice = true

    switch (priceRange) {
      case '0-50':
        matchesPrice = price <= 50
        break
      case '50-100':
        matchesPrice = price > 50 && price <= 100
        break
      case '100+':
        matchesPrice = price > 100
        break
      default:
        matchesPrice = true
    }

    // Si hay un proveedorId, filtrar también por proveedor
    const matchesProvider = !proveedorId || product.providerId === proveedorId

    return matchesCategory && matchesPrice && matchesProvider
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      console.log("Token:", token)

      if (!token) {
        console.log("No hay token")
        setError("No se ha encontrado un token de autenticación")
        return
      }

      console.log("Obteniendo productos de la API...")
      
      // Crear filtros para el servicio
      const filters = {}
      if (proveedorId) {
        filters.provider = proveedorId
        console.log("Filtrando por proveedor:", proveedorId)
      }

      const data = await productService.getAllProducts(filters)
      console.log("Datos recibidos:", data)

      if (!data || data.length === 0) {
        console.log("No se encontraron productos")
        setProducts([])
        return
      }

      const transformedData = data.map((product) => ({
        id: product._id,
        name: product.nombre,
        description: product.descripcion,
        price: product.precio,
        image: product.imagenes && product.imagenes.length > 0 ? product.imagenes[0].url : "https://via.placeholder.com/300",
        category: product.categoria,
        rating: 4.5,
        tags: [product.categoria],
        stock: product.stock,
        unit: product.unidad,
        providerId: product.proveedor?._id || product.proveedor, // Guardar ID del proveedor
        providerName: product.proveedor?.nombre || 'Proveedor no especificado', // Nombre del proveedor
        foundations: product.fundaciones ? product.fundaciones.map(foundation => ({
          id: foundation._id,
          name: foundation.nombre
        })) : []
      }))

      console.log("Datos transformados:", transformedData)
      setProducts(transformedData)
    } catch (err) {
      console.error("Error completo:", err)
      setError("Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  // ✅ FUNCIÓN CORREGIDA - Evita duplicados y maneja cantidades correctamente
  const handleAddToCart = (product) => {
    // Verificar si el producto ya está en el carrito
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex !== -1) {
      // Si ya existe, incrementar la cantidad
      const updatedCart = [...cart];
      updatedCart[existingProductIndex] = {
        ...updatedCart[existingProductIndex],
        quantity: updatedCart[existingProductIndex].quantity + 1
      };
      setCart(updatedCart);
      showNotification(`Cantidad de ${product.name} actualizada en el carrito`);
    } else {
      // Si no existe, agregarlo con cantidad 1
      const newCartItem = { ...product, quantity: 1 };
      setCart(prevCart => [...prevCart, newCartItem]);
      showNotification(`${product.name} agregado al carrito`);
    }
  }

  const handleToggleFavorite = (product) => {
    const updatedFavorites = favorites.some((fav) => fav.id === product.id)
      ? favorites.filter((fav) => fav.id !== product.id)
      : [...favorites, product]

    setFavorites(updatedFavorites)
    showNotification(
      `${product.name} ${updatedFavorites.length < favorites.length ? "removido de favoritos" : "agregado a favoritos"}`,
    )
  }

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleRemoveFromCart = (index) => {
    const updatedCart = [...cart]
    const removed = updatedCart.splice(index, 1)
    setCart(updatedCart)
    showNotification(`${removed[0].name} eliminado del carrito`)
  }

  // ✅ NUEVA FUNCIÓN - Actualizar cantidad de un producto en el carrito
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Si la cantidad es 0 o menor, remover del carrito
      const productIndex = cart.findIndex(item => item.id === productId);
      if (productIndex !== -1) {
        handleRemoveFromCart(productIndex);
      }
      return;
    }

    const updatedCart = cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCart(updatedCart);
  }

  const clearFilters = () => {
    setSelectedCategory('todos')
    setPriceRange('todos')
  }

  return {
    products: filteredProducts,
    loading,
    error,
    favorites,
    setFavorites,
    cart,
    setCart,
    notification,
    setNotification,
    isCartOpen,
    setIsCartOpen,
    selectedCategory,
    setSelectedCategory,
    priceRange,
    setPriceRange,
    categories,
    priceRanges,
    fetchProducts,
    handleAddToCart,
    handleToggleFavorite,
    handleRemoveFromCart,
    handleUpdateQuantity,
    clearFilters,
    proveedorId // Exponer el proveedorId actual
  }
}