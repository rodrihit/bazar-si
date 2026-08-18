import { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: '2',
    name: 'Vajilla Cerámica Oxford Black',
    description: 'Juego de mesa de 20 piezas con un acabado mate sofisticado. Diseñado para quienes buscan elegancia en lo cotidiano. Incluye 4 platos playos, 4 platos hondos, 4 platos de postre y 4 tazas con sus respectivos platos. Altamente resistente, apto para microondas y lavavajillas.',
    price: 42500,
    stock: 8,
    category: 'Mesa y Vajilla',
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&q=80&w=900'
    ],
    featured: true,
    installments: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Accesorios de Baño Cerámica Black',
    description: 'Set de 3 piezas de cerámica con acabado mate soft-touch. Incluye dispenser de jabón líquido con válvula cromada, porta cepillos y jabonera. Un diseño minimalista que aporta modernidad y orden a tu cuarto de baño.',
    price: 18900,
    discountPrice: 15200,
    stock: 30,
    category: 'Baño',
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1620626011761-9963d7b59a05?auto=format&fit=crop&q=80&w=900'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Set de Copas de Cristal Bohemia',
    description: 'Caja de 6 copas de cristal de Bohemia para vino tinto. Capacidad 450ml. Brillo excepcional y sonoridad única. El complemento perfecto para tus cenas más especiales. Vidrio de alta resistencia y borde cortado con láser.',
    price: 68000,
    discountPrice: 59900,
    stock: 5,
    category: 'Mesa y Vajilla',
    images: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=900',
      'https://images.unsplash.com/photo-1572442388796-11668ba67e53?auto=format&fit=crop&q=80&w=900'
    ],
    featured: true,
    installments: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Reloj de Pared Minimalista White',
    description: 'Reloj de pared de 30cm de diámetro con diseño nórdico. Marco de madera clara y fondo blanco con números grandes y legibles. Máquina silenciosa de barrido continuo, sin el molesto tic-tac. Ideal para living, cocina u oficina.',
    price: 12500,
    stock: 15,
    category: 'Decoración',
    images: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&q=80&w=900'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '15',
    name: 'Lámpara de Mesa Industrial Black',
    description: 'Lámpara con base de cemento y estructura de hierro negro mate. Diseño tipo Edison que aporta un toque industrial y rústico a cualquier ambiente. Incluye lámpara de filamento LED de luz cálida.',
    price: 14200,
    stock: 10,
    category: 'Decoración',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=900'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '25',
    name: 'Plato Té y Desayuno Verbano',
    description: 'Plato premium Verbano ideal para té, de línea recta minimalista en porcelana blanca brillante de alta densidad. Apto para uso diario comercial o familiar.',
    price: 5200,
    stock: 80,
    category: 'Cafetería y Té',
    images: [
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=900'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '27',
    name: 'Cacerola Gastronómica Tresso N° 24',
    description: 'Cacerola profesional reforzada en aluminio de gran conducción térmica. Bordes reforzados y asas remachadas de altísima confiabilidad profesional para gastronomía intensiva.',
    price: 45000,
    discountPrice: 38900,
    stock: 12,
    category: 'Cocina',
    images: [
      'https://images.unsplash.com/photo-1584990333910-fe907bc4aa76?auto=format&fit=crop&q=80&w=900'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '32',
    name: 'Compotera Multiuso Poli Nadir 170ml',
    description: 'Compotera de vidrio templado multiuso Nadir modelo Poli de 170ml. Excelente brillo, durabilidad y resistencia para postres, helados, ensaladas de frutas o copetín.',
    price: 1450,
    stock: 48,
    category: 'Mesa y Vajilla',
    images: [
      'https://i.postimg.cc/pXqbLdTy/compotera-multiuso-poli-nadir-170ml-x24-unidades-710-thumb.webp'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '33',
    name: 'Plato Tabla Algarrobo 24cm para Asado',
    description: 'Plato playo tipo tabla de algarrobo macizo torneado de 24cm de diámetro con canaleta para jugos. Madera seleccionada de alta resistencia ideal para asados y parrilladas.',
    price: 6800,
    stock: 30,
    category: 'Mesa y Vajilla',
    images: [
      'https://i.postimg.cc/PJMGZXMf/plato-tabla-algarrobo-madera-24cm-asado-reforzados-x1-unidad-marr-n-25507-thumb.webp'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '34',
    name: 'Tetera Cafetera Porcelana Tsuji 450 (1 L)',
    description: 'Tetera cafetera de porcelana blanca Tsuji modelo 450 con tapa. Capacidad de 1 litro (ideal 4 personas). Elegante acabado brillante, cuerpo térmico y pico vertedor anti-goteo.',
    price: 18500,
    stock: 15,
    category: 'Cafetería y Té',
    images: [
      'https://i.postimg.cc/mgnrhjD3/tetera-cafetera-porcelana-tsuji-450-tapa-4-personas-1-lts-blanco-15586-thumb.webp'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '35',
    name: 'Frasco Contenedor con Tapa 2500cc',
    description: 'Frasco tarro de vidrio de 2500cc (2.5 litros) con tapa plástica a rosca hermética. Capacidad superior para guardar galletitas, fideos, legumbres y conservas.',
    price: 4900,
    stock: 24,
    category: 'Organización',
    images: [
      'https://i.postimg.cc/LXL5cPms/frasco-tarro-con-tapa-de-pl-stico-2500-cc-contenedor-x-1-uni-color-al-azar-537-thumb.webp'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '36',
    name: 'Set Botellas y Frascos Herméticos Vintage',
    description: 'Juego de contenedores y frascos de vidrio con cierre hermético y estética vintage. Ideales para conservar aceites aromatizados, salsas, especias y organizar la mesada con estilo.',
    price: 9800,
    discountPrice: 8500,
    stock: 18,
    category: 'Cocina',
    images: [
      'https://i.postimg.cc/BZVjyJTw/chatgpt-image-20-jun-2026-01-35-10-p-m-1-4264d8cde2253b40c617819733160337-480-0.webp'
    ],
    createdAt: new Date().toISOString()
  }
];

export const categories = [
  { id: '1', name: 'Cocina', slug: 'cocina', icon: 'ChefHat' },
  { id: '2', name: 'Mesa y Vajilla', slug: 'vajilla', icon: 'Utensils' },
  { id: '3', name: 'Repostería', slug: 'reposteria', icon: 'Cake' },
  { id: '4', name: 'Cafetería y Té', slug: 'cafe', icon: 'Coffee' },
  { id: '5', name: 'Electro Hogar', slug: 'electro', icon: 'Zap' },
  { id: '6', name: 'Organización', slug: 'organizacion', icon: 'LayoutGrid' },
  { id: '7', name: 'Baño', slug: 'bano', icon: 'Bath' },
  { id: '8', name: 'Decoración', slug: 'deco', icon: 'Home' }
];
