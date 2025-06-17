import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function FoundationsSection({ foundations, title = "Fundaciones que apoyamos", subtitle = "Conoce a las organizaciones bolivianas que están cambiando vidas gracias a tu apoyo" }) {
  return (
    <section className="w-full py-20 md:py-32 bg-white">
      <div className="container px-6 md:px-8 mx-auto">
        <div className="text-center space-y-6 mb-20">
          <Badge className="bg-emerald-100 text-emerald-800 px-4 py-2">
            Nuestro Impacto
          </Badge>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-12">
          {foundations.map((foundation) => (
            <Card key={foundation.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-white">
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={foundation.image}
                  alt={foundation.name}
                  className="object-cover w-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{foundation.name}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {foundation.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {foundation.focus.map((focus, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                    <div className="text-center">
                      <span className="text-2xl font-bold text-orange-600">{foundation.beneficiaries}</span>
                      <p className="text-sm text-gray-500">Beneficiarios</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-orange-600">{foundation.years}</span>
                      <p className="text-sm text-gray-500">Años de trabajo</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300">
                      Conocer más
                    </Button>
                    <a 
                      href={foundation.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-center text-gray-500 hover:text-orange-600 transition-colors duration-300"
                    >
                      Visitar sitio web
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button size="lg" variant="outline" className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-4 text-lg">
            Ver todas las fundaciones
          </Button>
        </div>
      </div>
    </section>
  );
} 