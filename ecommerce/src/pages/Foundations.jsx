import { useState } from "react";
import { ArrowRight, Heart, Users, TrendingUp, MapPin, Phone, Mail, Globe, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Foundations() {
  // Datos de ejemplo de fundaciones
  const foundations = [
    {
      id: 1,
      name: "Fundación Esperanza",
      description: "Trabajando para mejorar la calidad de vida de niños en situación de vulnerabilidad a través de programas educativos y de desarrollo integral.",
      image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      beneficiaries: 1200,
      years: 8,
      location: "Ciudad de México",
      category: "Educación",
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      name: "Fundación Sonrisas",
      description: "Brindando apoyo nutricional y médico a niños de escasos recursos, asegurando su desarrollo saludable y acceso a servicios de salud.",
      image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      beneficiaries: 850,
      years: 5,
      location: "Guadalajara",
      category: "Salud",
      rating: 4.7,
      featured: true
    },
    {
      id: 3,
      name: "Fundación Futuro Brillante",
      description: "Promoviendo la educación de calidad y el desarrollo de habilidades en niños y jóvenes de comunidades marginadas.",
      image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      beneficiaries: 1500,
      years: 10,
      location: "Monterrey",
      category: "Educación",
      rating: 4.9,
      featured: true
    }
  ];

  // Estados para los filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todas");
  const [activeTab, setActiveTab] = useState("todas");

  // Obtener categorías únicas
  const categories = [...new Set(foundations.map(f => f.category))];

  // Filtrar fundaciones
  const filteredFoundations = foundations.filter((foundation) => {
    const matchesSearch =
      foundation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      foundation.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "todas" || foundation.category === selectedCategory;

    const matchesTab =
      activeTab === "todas" ||
      (activeTab === "destacadas" && foundation.featured) ||
      (activeTab === "recientes" && foundation.id > foundations.length - 3);

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Fundaciones que Transforman Vidas
              </h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Conoce a las organizaciones que están cambiando el mundo a través de su dedicación y compromiso.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white">
                Apoya una fundación
                <Heart className="ml-2 h-4 w-4 text-red-500 fill-red-500" />
              </Button>
              <Button size="lg" variant="outline">
                Conoce nuestro impacto
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filtros y Listado */}
      <section className="py-16">
        <div className="container px-4 md:px-6 mx-auto">
          {/* Filtros */}
          <div className="mb-8 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar fundaciones..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="todas" className="flex-1">
                    Todas
                  </TabsTrigger>
                  <TabsTrigger value="destacadas" className="flex-1">
                    Destacadas
                  </TabsTrigger>
                  <TabsTrigger value="recientes" className="flex-1">
                    Recientes
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <p className="text-sm text-gray-500">
              Mostrando {filteredFoundations.length} de {foundations.length} fundaciones
            </p>
          </div>

          {/* Grid de Fundaciones */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFoundations.map((foundation) => (
              <Card
                key={foundation.id}
                className="group overflow-hidden transition-all hover:shadow-lg"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={foundation.image}
                    alt={foundation.name}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  {foundation.featured && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-white">
                      Destacada
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </Button>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{foundation.name}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="ml-1 text-sm font-medium text-yellow-700">
                        {foundation.rating}
                      </span>
                    </div>
                  </div>
                  <Badge className="mb-4 bg-blue-100 text-blue-800">
                    {foundation.category}
                  </Badge>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {foundation.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                      {foundation.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-blue-500" />
                      <span>{foundation.beneficiaries.toLocaleString()}+ beneficiarios</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white">
                    Conocer más
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mensaje si no hay resultados */}
          {filteredFoundations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                No se encontraron fundaciones que coincidan con tu búsqueda.
              </p>
              <Button
                variant="link"
                className="mt-2 text-blue-600"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("todas");
                  setActiveTab("todas");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 