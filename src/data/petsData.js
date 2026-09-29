// Initial pet database and local storage helper
const STORAGE_KEY = 'patitas_pass_pets_v2';

export const INITIAL_PETS = [
  {
    id: 'pet-max',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    age: '8 meses',
    gender: 'Macho',
    vaccinated: 'Sí, al día',
    weight: '24 kg',
    color: 'Dorado / Crema',
    microchip: '982-0192-VE',
    status: 'safe',
    photo: '/assets/puppy-hero.jpg',
    about: 'Max es un cachorro super juguetón, amigable y muy noble. Le encantan los paseos y los premios. Si lo encuentras solo, por favor contáctame de inmediato.',
    medicalNotes: 'Alérgico a comida con pollo. Esterilizado y con todas sus vacunas antirrábicas vigentes.',
    reward: 'Recompensa garantizada',
    owner: {
      name: 'Valentina Gómez',
      phone: '+584125551234',
      phoneFormatted: '+58 (412) 555-1234',
      altPhone: '+58 (414) 222-7890',
      address: 'Altamira, Caracas, Venezuela',
      email: 'valentina.pets@gmail.com'
    }
  },
  {
    id: 'pet-bruno',
    name: 'Bruno',
    species: 'dog',
    breed: 'Bulldog Francés',
    age: '3 años',
    gender: 'Macho',
    vaccinated: 'Sí, al día',
    weight: '13 kg',
    color: 'Beige / Leonado',
    microchip: '612-8821-VE',
    status: 'safe',
    photo: '/assets/frenchie.jpg',
    about: 'Bruno es tranquilo, cariñoso y le gusta descansar en lugares frescos. Es braquicéfalo por lo que no debe sofocarse con el calor.',
    medicalNotes: 'Sensible al calor extremo. Requiere hidratación constante.',
    reward: null,
    owner: {
      name: 'Daniel Morales',
      phone: '+584129988776',
      phoneFormatted: '+58 (412) 998-8776',
      altPhone: '+58 (414) 333-2211',
      address: 'El Cafetal, Caracas, Venezuela',
      email: 'daniel.morales@gmail.com'
    }
  },
  {
    id: 'pet-cleo',
    name: 'Cleo',
    species: 'cat',
    breed: 'Siamés',
    age: '2 años',
    gender: 'Hembra',
    vaccinated: 'Sí, al día',
    weight: '3.5 kg',
    color: 'Crema y Chocolate',
    microchip: '551-3094-VE',
    status: 'safe',
    photo: '/assets/siamese.jpg',
    about: 'Cleo es una gata siamesa muy vocal, curiosa y afectuosa. Sus ojos azules son su distintivo principal.',
    medicalNotes: 'Desparasitada recientemente. Alérgica a mariscos.',
    reward: null,
    owner: {
      name: 'Mariana Silva',
      phone: '+584241112233',
      phoneFormatted: '+58 (424) 111-2233',
      altPhone: '+58 (416) 444-5566',
      address: 'Los Palos Grandes, Caracas, Venezuela',
      email: 'mariana.silva@gmail.com'
    }
  },
  {
    id: 'pet-mimi',
    name: 'Mimi',
    species: 'cat',
    breed: 'Scottish Fold',
    age: '1 año',
    gender: 'Hembra',
    vaccinated: 'Sí, al día',
    weight: '3.8 kg',
    color: 'Arena / Beige',
    microchip: '883-9411-VE',
    status: 'safe',
    photo: '/assets/cat-hero.jpg',
    about: 'Mimi es una gatita tranquila y dulce pero tímida con personas desconocidas. Suele asustarse con bocinas y ruidos fuertes.',
    medicalNotes: 'Requiere dieta húmeda para control urinario. No automedicar.',
    reward: null,
    owner: {
      name: 'Carlos Mendoza',
      phone: '+584147779876',
      phoneFormatted: '+58 (414) 777-9876',
      altPhone: '+58 (412) 999-1122',
      address: 'Las Mercedes, Caracas, Venezuela',
      email: 'carlos.mendoza@gmail.com'
    }
  },
  {
    id: 'pet-toby',
    name: 'Toby',
    species: 'dog',
    breed: 'Welsh Corgi',
    age: '2 años',
    gender: 'Macho',
    vaccinated: 'Sí, al día',
    weight: '12 kg',
    color: 'Marrón y Blanco',
    microchip: '442-1104-VE',
    status: 'lost',
    photo: '/assets/corgi-hero.jpg',
    about: '¡Toby se extravió en el Parque del Este! Es muy cariñoso, responde a chasquidos y su nombre. Ayúdanos a traerlo a casa.',
    medicalNotes: 'Tiene tratamiento para articulaciones. Usa collar reflectivo azul.',
    reward: 'Excelente recompensa',
    owner: {
      name: 'Sofía Herrera',
      phone: '+584243334567',
      phoneFormatted: '+58 (424) 333-4567',
      altPhone: '+58 (416) 123-9988',
      address: 'Chacao, Caracas, Venezuela',
      email: 'sofia.herrera@gmail.com'
    }
  }
];

export function loadPets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PETS));
      return INITIAL_PETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading pets from storage:', err);
    return INITIAL_PETS;
  }
}

export function savePets(pets) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pets));
  } catch (err) {
    console.error('Error saving pets:', err);
  }
}
