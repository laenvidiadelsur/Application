// Mock data for foundations
const foundations = [
  {
    id: 1,
    name: "Fundación Arco Iris",
    image: "/foundations/arco-iris.jpg",
    description: "Dedicada a la protección y desarrollo integral de niños, niñas y adolescentes en situación de calle en La Paz.",
    beneficiaries: "2000+",
    years: "30"
  },
  {
    id: 2,
    name: "Fundación Sembrar",
    image: "/foundations/sembrar.jpg",
    description: "Promueve el desarrollo sostenible y la seguridad alimentaria en comunidades rurales de Bolivia.",
    beneficiaries: "5000+",
    years: "15"
  },
  {
    id: 3,
    name: "Fundación Amigos de la Naturaleza",
    image: "/foundations/fan.jpg",
    description: "Trabaja en la conservación de la biodiversidad y el desarrollo sostenible en Bolivia.",
    beneficiaries: "10000+",
    years: "25"
  }
];

export const getFoundations = () => {
  // In a real application, this would be an API call
  return Promise.resolve(foundations);
}; 