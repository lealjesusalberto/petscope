const STORAGE_KEY = 'qpet_pets_v1';

export const INITIAL_PETS = [
  {
    id: 'pet-max',
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    birthDate: '2026-01-15',
    age: '8 meses',
    gender: 'Macho',
    vaccinated: 'Sí, al día',
    vaccines: [
      {
        id: 'vac-max-1',
        name: 'Puppy Séxtuple / DHPPI-L (1ra y 2da Dosis)',
        date: '2026-03-20',
        nextDue: '2027-03-20',
        vet: 'Dra. Patricia Rivas • Vet Las Mercedes',
        status: 'applied'
      },
      {
        id: 'vac-max-2',
        name: 'Antirrábica Anual',
        date: '2026-05-18',
        nextDue: '2027-05-18',
        vet: 'Dra. Patricia Rivas • Vet Las Mercedes',
        status: 'applied'
      },
      {
        id: 'vac-max-3',
        name: 'Desparasitación Interna (Simparica Trio)',
        date: '2026-08-10',
        nextDue: '2026-11-10',
        vet: 'Dr. Alejandro Peña',
        status: 'applied'
      }
    ],
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
    birthDate: '2023-05-10',
    age: '3 años',
    gender: 'Macho',
    vaccinated: 'Sí, al día',
    vaccines: [
      {
        id: 'vac-bruno-1',
        name: 'Antirrábica Rabdomun',
        date: '2025-11-14',
        nextDue: '2026-11-14',
        vet: 'Dr. Carlos Suárez • Centro Canino Caracas',
        status: 'applied'
      },
      {
        id: 'vac-bruno-2',
        name: 'Séxtuple Refuerzo Anual',
        date: '2025-11-14',
        nextDue: '2026-11-14',
        vet: 'Dr. Carlos Suárez • Centro Canino Caracas',
        status: 'applied'
      },
      {
        id: 'vac-bruno-3',
        name: 'Bordetella (Tos de las Perreras)',
        date: '2026-02-05',
        nextDue: '2027-02-05',
        vet: 'Dra. Mónica Gil',
        status: 'applied'
      }
    ],
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
    birthDate: '2024-06-20',
    age: '2 años',
    gender: 'Hembra',
    vaccinated: 'Sí, al día',
    vaccines: [
      {
        id: 'vac-cleo-1',
        name: 'Triple Felina (Panleucopenia, Calicivirus, Rinotraqueitis)',
        date: '2026-04-12',
        nextDue: '2027-04-12',
        vet: 'Dra. Gabriela Torres • Felinos Vet',
        status: 'applied'
      },
      {
        id: 'vac-cleo-2',
        name: 'Antirrábica Felina',
        date: '2026-04-12',
        nextDue: '2027-04-12',
        vet: 'Dra. Gabriela Torres • Felinos Vet',
        status: 'applied'
      },
      {
        id: 'vac-cleo-3',
        name: 'Leucemia Felina (FeLV)',
        date: '2025-05-10',
        nextDue: '2026-05-10',
        vet: 'Dra. Gabriela Torres • Felinos Vet',
        status: 'applied'
      }
    ],
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
    birthDate: '2025-08-12',
    age: '1 año',
    gender: 'Hembra',
    vaccinated: 'Sí, al día',
    vaccines: [
      {
        id: 'vac-mimi-1',
        name: 'Triple Felina FVRCP',
        date: '2026-01-22',
        nextDue: '2027-01-22',
        vet: 'Clínica Veterinaria Los Palos Grandes',
        status: 'applied'
      },
      {
        id: 'vac-mimi-2',
        name: 'Antirrábica Felina',
        date: '2026-01-22',
        nextDue: '2027-01-22',
        vet: 'Clínica Veterinaria Los Palos Grandes',
        status: 'applied'
      }
    ],
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
    birthDate: '2024-03-08',
    age: '2 años',
    gender: 'Macho',
    vaccinated: 'Sí, al día',
    vaccines: [
      {
        id: 'vac-toby-1',
        name: 'Séxtuple Canina Anual',
        date: '2026-02-14',
        nextDue: '2027-02-14',
        vet: 'Hospital Veterinario Chacao',
        status: 'applied'
      },
      {
        id: 'vac-toby-2',
        name: 'Antirrábica Imrab 3',
        date: '2026-02-14',
        nextDue: '2027-02-14',
        vet: 'Hospital Veterinario Chacao',
        status: 'applied'
      },
      {
        id: 'vac-toby-3',
        name: 'Desparasitación NexGard Spectra',
        date: '2026-07-20',
        nextDue: '2026-10-20',
        vet: 'Hospital Veterinario Chacao',
        status: 'applied'
      }
    ],
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
    const parsed = JSON.parse(raw);
    let migrated = false;
    const enriched = parsed.map((pet) => {
      const defaultMatch = INITIAL_PETS.find((p) => p.id === pet.id);
      let updated = { ...pet };

      if (!updated.birthDate && defaultMatch?.birthDate) {
        migrated = true;
        updated.birthDate = defaultMatch.birthDate;
      }
      if ((!updated.vaccines || updated.vaccines.length === 0) && defaultMatch?.vaccines) {
        migrated = true;
        updated.vaccines = defaultMatch.vaccines;
      } else if (!Array.isArray(updated.vaccines)) {
        updated.vaccines = [];
      }
      return updated;
    });

    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    }
    return enriched;
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
