export type Product = {
  id: string;
  no: string;
  name: string;
  short: string;
  notes: string[];
  pairings: string[];
  heat: number; // 1–10
  shu: number; // Scoville heat units of the finished sauce
  price: number;
  size: string;
  sauce: string; // sauce colour used by the 3D jar and illustrations
  description: string;
};

export const products: Product[] = [
  {
    id: "smoked-habanero",
    no: "01",
    name: "Smoked Habanero",
    short: "Habanero",
    notes: ["Applewood smoke", "Burnt honey", "Lime zest"],
    pairings: ["Grilled chicken", "Tacos al pastor", "Mezcal margarita"],
    heat: 7,
    shu: 12000,
    price: 18,
    size: "250 ml",
    sauce: "#E8430A",
    description:
      "Our first sauce and still the one we reach for most. Habaneros smoked for 14 hours, fermented for 90 days, then finished with honey we caramelise until it nearly burns.",
  },
  {
    id: "black-garlic-crisp",
    no: "02",
    name: "Black Garlic Chili Crisp",
    short: "Chili Crisp",
    notes: ["Aged black garlic", "Toasted sesame", "Crunchy shallot"],
    pairings: ["Fried eggs", "Dumplings", "Vanilla ice cream"],
    heat: 4,
    shu: 3000,
    price: 22,
    size: "200 g",
    sauce: "#8E2A12",
    description:
      "A spoonable crisp built on garlic aged for 40 days until it turns sweet and balsamic. More crunch than burn, and dangerously easy to eat straight from the jar.",
  },
  {
    id: "charred-ghost",
    no: "03",
    name: "Charred Ghost Pepper",
    short: "Ghost",
    notes: ["Blistered ghost pepper", "Mango", "Black lime"],
    pairings: ["Brisket", "Fried chicken", "Bloody Mary"],
    heat: 10,
    shu: 95000,
    price: 24,
    size: "150 ml",
    sauce: "#FF7A1A",
    description:
      "Ghost peppers charred over open flame and balanced with ripe mango and dried black lime. Fruity on the first second, relentless after the third.",
  },
];

export const formatShu = (n: number) => n.toLocaleString("en-US");
