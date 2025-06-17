import { Link } from "react-router-dom";
import { Anchor, ShoppingBag, ArrowRight, Gift, Users, TrendingUp, Heart, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "@/components/image-carousel";
import Header from "@/components/layout/Header";
import FoundationsSection from "@/components/FoundationsSection";
import { getFoundations } from "@/controllers/foundationController";

export default function Home() {
  const carouselImages = [
     {
      src: "https://scontent.fsrz1-2.fna.fbcdn.net/v/t39.30808-6/485723814_993465302896503_5361188402991283276_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=127cfc&_nc_ohc=CHv9Vu2dOgYQ7kNvwE5LdtY&_nc_oc=AdnU-bdHFdKQd2gtB51dQWkH2634cjwcDYxiKplhVPRaePQS8XAMe5V6iGjUEWt5Erg&_nc_zt=23&_nc_ht=scontent.fsrz1-2.fna&_nc_gid=-9N1mPZ78rb6fkn-n_dTyw&oh=00_AfK8rVXUZQEs0Nn0q9nahgpOOrkN1L-SSpA7Vs4Pk9Qx-Q&oe=683F8CBA",
      alt: "Reforestación y plantación de árboles tras un incendio"
    },
    {
      src: "https://scontent.fsrz1-2.fna.fbcdn.net/v/t39.30808-6/474559056_1383157843058938_1036400792571714168_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Nd9UxHIkKUUQ7kNvwFXmLnv&_nc_oc=Adkb2Q6uWFC_qr9ADGWoZQTGYKdEaHV38rcfejI8xYqstJdb89B8Ox_ajFIAaO7lMLY&_nc_zt=23&_nc_ht=scontent.fsrz1-2.fna&_nc_gid=gL1nV3UEDpOVKxrde5GR4Q&oh=00_AfJ3WoGizyvNrDU_9n2zzSGK0IkbGXP6i1bU2c-8bvR-fg&oe=683FA079",
      alt: "Voluntarios apagando un incendio forestal"
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-transparent to-gray-100/30" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-1000" />
          
          <div className="container px-6 md:px-8 mx-auto relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <Badge className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200 px-4 py-2 text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Compra con propósito
                  </Badge>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Cada compra ayuda a
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                      proteger nuestra tierra
                    </span>
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                    Descubre productos eco-amigables mientras apoyas proyectos que restauran la Tierra.
                    <span className="font-semibold text-orange-700"> El 100% de nuestras ganancias</span> se destinan directamente a la conservación ambiental.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg">
                    Comprar ahora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 px-8 py-4 text-lg transition-all duration-300">
                    Conoce nuestras fundaciones
                  </Button>
                </div>
                
                <div className="flex items-center gap-8 pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600 font-medium">100% transparente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600 font-medium">Impacto verificado</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-3xl transform rotate-3 opacity-10" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <ImageCarousel images={carouselImages} />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-orange-100">
                  <p className="text-lg font-bold text-orange-700">+1000 productos</p>
                  <p className="text-sm text-gray-500">Ayudando a 25+ fundaciones</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white relative">
          <div className="container px-6 md:px-8 mx-auto">
            <div className="text-center space-y-6 mb-20">
              <Badge className="bg-orange-100 text-orange-800 px-4 py-2">
                Proceso Simple
              </Badge>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Cómo funciona
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Un modelo simple que maximiza el impacto de cada compra, conectando tu consumo consciente con causas que transforman vidas
              </p>
            </div>
            
            <div className="grid gap-8 lg:gap-12 md:grid-cols-2 max-w-4xl mx-auto">
              {[
                {
                  icon: ShoppingBag,
                  title: "Compra productos",
                  description: "Explora nuestra cuidadosa selección de productos de alta calidad, sostenibles y éticos. Cada artículo ha sido elegido pensando en el impacto positivo que puede generar.",
                  number: "01"
                },
                {
                  icon: Heart,
                  title: "Genera impacto",
                  description: "El 100% de nuestras ganancias se destinan a fundaciones que transforman vidas. Tu compra se convierte en esperanza, oportunidades y cambio real.",
                  number: "02"
                }
              ].map((step, index) => (
                <Card key={index} className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100/10 to-gray-200/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors duration-500">
                    {step.number}
                  </div>
                  <CardContent className="p-8 md:p-10 relative z-10">
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-2xl shadow-inner w-fit">
                          <step.icon className="h-8 w-8 text-gray-600" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{step.description}</p>
                      </div>
                      <div className="w-full h-1 bg-gradient-to-r from-orange-300 to-amber-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

<section className="w-full py-20 md:py-32 bg-white">
  <div className="container px-6 md:px-8 mx-auto">
    <div className="text-center space-y-6 mb-20">
      <Badge className="bg-emerald-100 text-emerald-800 px-4 py-2">
        Nuestro Impacto
      </Badge>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold">
        <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
          Fundaciones que apoyamos
        </span>
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Conoce a las organizaciones bolivianas que están cambiando vidas gracias a tu apoyo
      </p>
    </div>
    
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto mb-12">
      {[
        {
          name: "Fundación Arco Iris",
          image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop&crop=center",
          description: "Trabaja por la protección integral de niños, niñas y adolescentes en situación de riesgo social en La Paz, brindando albergue, educación y oportunidades de desarrollo.",
          beneficiaries: "1,200+",
          years: "28",
          focus: "Protección infantil"
        },
        {
          name: "Fundación Sembrar",
          image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop&crop=center",
          description: "Promueve el desarrollo rural sostenible, la seguridad alimentaria y el fortalecimiento de capacidades productivas en comunidades campesinas e indígenas.",
          beneficiaries: "3,500+",
          years: "18",
          focus: "Desarrollo rural"
        },
        {
          name: "Fundación Amigos de la Naturaleza (FAN)",
          image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center",
          description: "Organización líder en conservación de la biodiversidad boliviana, manejo sostenible de recursos naturales y mitigación del cambio climático.",
          beneficiaries: "15,000+",
          years: "32",
          focus: "Conservación"
        },
        {
          name: "Fundación Construir",
          image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=600&fit=crop&crop=center",
          description: "Se dedica a mejorar las condiciones de vivienda y hábitat de familias de bajos recursos en El Alto y La Paz, promoviendo el desarrollo urbano sostenible.",
          beneficiaries: "2,800+",
          years: "22",
          focus: "Vivienda digna"
        },
        {
          name: "Fundación La Paz",
          image: "https://scontent.fsrz1-2.fna.fbcdn.net/v/t1.6435-9/198504846_4753659577994755_3286179989834862979_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=127cfc&_nc_ohc=AF_OPOfDsw0Q7kNvwHeQexV&_nc_oc=AdmJkYb9H2OkP5sypaMOE9MiF5_mhNSmbP3K4skhEvvxxDw9qxGhOb8067cEoUH3uCI&_nc_zt=23&_nc_ht=scontent.fsrz1-2.fna&_nc_gid=reXo5yBTX9mVha6ZlNBAQQ&oh=00_AfIPXBWgqp-76RLdTpu9SyOmYhvJvkS8qbyiobfxTpXGOw&oe=6867DDDF",
          description: "Trabaja en programas de salud comunitaria, educación y desarrollo social en barrios periurbanos de La Paz, con enfoque en mujeres y familias vulnerables.",
          beneficiaries: "4,200+",
          years: "25",
          focus: "Salud comunitaria"
        },
        {
          name: "Fundación Alalay",
          image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop&crop=center",
          description: "Pionera en la atención integral de niños y adolescentes trabajadores en Bolivia, ofreciendo educación, salud y oportunidades de desarrollo personal.",
          beneficiaries: "5,600+",
          years: "35",
          focus: "Niños trabajadores"
        }
      ].map((foundation, index) => (
        <Card key={index} className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 bg-white">
          <div className="aspect-video overflow-hidden relative">
            <img
              src={foundation.image}
              alt={foundation.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/90 text-gray-700 backdrop-blur-sm">
                {foundation.focus}
              </Badge>
            </div>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{foundation.name}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {foundation.description}
                </p>
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
              
              <Button variant="outline" className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300">
                Conocer más
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    <div className="text-center space-y-4">
      <Button size="lg" variant="outline" className="border-2 border-orange-200 text-orange-700 hover:bg-orange-50 px-8 py-4 text-lg">
        Ver todas las fundaciones
      </Button>
      <p className="text-sm text-gray-500 max-w-2xl mx-auto">
        Trabajamos con más de 50 organizaciones bolivianas comprometidas con el desarrollo social, 
        la conservación ambiental y la reducción de la pobreza en todo el país.
      </p>
    </div>
  </div>
</section>
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-gray-50 to-white">
          <div className="container px-6 md:px-8 mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-6">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  Mantente Conectado
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Únete a nuestra comunidad
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Suscríbete para recibir actualizaciones sobre nuevos productos y el impacto que estamos generando juntos
                </p>
              </div>
              
              <div className="max-w-md mx-auto">
                <form className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      className="flex-1 h-12 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 transition-all duration-300"
                    />
                    <Button type="submit" className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white px-6 py-3 h-12 rounded-xl transition-all duration-300">
                      Suscribirse
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Al suscribirte, aceptas nuestra{" "}
                    <Link to="#" className="text-orange-600 hover:text-orange-700 underline underline-offset-2 transition-colors duration-300">
                      Política de Privacidad
                    </Link>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container px-6 md:px-8 mx-auto py-16">
          <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-4 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CompraConCausa</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Transformando el comercio en impacto social positivo, un producto a la vez.
              </p>
            </div>
            
            {[
              {
                title: "Productos",
                links: ["Todos los productos", "Artesanías", "Ropa", "Accesorios"]
              },
              {
                title: "Fundaciones",
                links: ["Nuestras fundaciones", "Impacto social", "Historias de éxito", "Colabora con nosotros"]
              },
              {
                title: "Contacto",
                links: ["Sobre nosotros", "Preguntas frecuentes", "Contacto", "Política de privacidad"]
              }
            ].map((section, index) => (
              <div key={index} className="space-y-6">
                <h3 className="text-lg font-semibold">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to="#" className="text-gray-300 hover:text-white transition-colors duration-300">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-700 gap-6">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} CompraConCausa. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              {[
                {
                  path: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                },
                {
                  path: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.315zm-.081 1.802h-.078c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.078c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                }
              ].map((social, index) => (
                <Link key={index} to="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d={social.path} clipRule="evenodd" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}