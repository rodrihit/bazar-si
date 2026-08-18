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
  },
  {
    id: '40',
    name: 'Juego de Toallas Algodón Egipcio 4 Piezas',
    description: 'Set de 4 toallas de algodón egipcio 100% de 550g/m². Incluye 2 toallones de baño y 2 toallas de mano. Máxima absorción, suavidad excepcional y colores que no destiñen. Un lujo cotidiano para tu baño.',
    price: 24900,
    discountPrice: 19900,
    stock: 22,
    category: 'Textiles y Blanquería',
    images: [
      '/images/products/toallas-algodon.png'
    ],
    featured: true,
    installments: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: '41',
    name: 'Juego de Sábanas 400 Hilos Queen',
    description: 'Juego de sábanas de percal 400 hilos para cama Queen. Incluye sábana ajustable, sábana encimera y 2 fundas de almohada. Tacto sedoso, frescas en verano y cálidas en invierno. Costuras reforzadas de alta durabilidad.',
    price: 38500,
    stock: 14,
    category: 'Textiles y Blanquería',
    images: [
      '/images/products/sabanas-400-hilos.png'
    ],
    installments: 12,
    createdAt: new Date().toISOString()
  },
  {
    id: '42',
    name: 'Set de Macetas de Cerámica Trío',
    description: 'Trío de macetas de cerámica esmaltada en tonos neutros con plato incluido. Medidas escalonadas (10, 14 y 18 cm) con orificio de drenaje. Ideales para suculentas, cactus y plantas de interior. Diseño moderno que decora cualquier ambiente.',
    price: 13200,
    discountPrice: 10900,
    stock: 26,
    category: 'Jardín y Exterior',
    images: [
      '/images/products/macetas-ceramica.png'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '43',
    name: 'Farol Solar LED para Exterior',
    description: 'Farol solar de metal negro con panel fotovoltaico integrado y luz LED cálida. Carga durante el día y se enciende automáticamente al anochecer. Resistente al agua (IP44), ideal para jardín, patio o balcón. No consume electricidad.',
    price: 15800,
    stock: 40,
    category: 'Jardín y Exterior',
    images: [
      '/images/products/farol-solar.png'
    ],
    featured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '44',
    name: 'Comedero Doble Acero Inoxidable para Mascotas',
    description: 'Comedero doble con bowls de acero inoxidable desmontables sobre soporte elevado antideslizante. Facilita la digestión de tu mascota y mantiene el piso limpio. Apto para lavavajillas. Ideal para perros y gatos medianos.',
    price: 9600,
    discountPrice: 7900,
    stock: 35,
    category: 'Mascotas',
    images: [
      '/images/products/comedero-mascotas.png'
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '45',
    name: 'Guirnalda de Luces LED Cálida 10m',
    description: 'Guirnalda de 100 luces LED de luz cálida sobre cable transparente de 10 metros. 8 modos de iluminación y función de memoria. Uso interior y exterior. Perfecta para ambientar patios, habitaciones, eventos y fiestas.',
    price: 6900,
    stock: 60,
    category: 'Iluminación',
    images: [
      '/images/products/guirnalda-led.png'
    ],
    dailyPromo: true,
    createdAt: new Date().toISOString()
  },
  {
    id: '46',
    name: 'Velador Táctil Regulable',
    description: 'Velador de mesa de luz con control táctil y 3 niveles de intensidad. Diseño minimalista con base metálica y luz LED cálida de bajo consumo. Sin botones ni perillas: solo tocá la base para encender y regular. Ideal para lectura y ambientes relajados.',
    price: 11400,
    stock: 18,
    category: 'Iluminación',
    images: [
      '/images/products/velador-tactil.png'
    ],
    installments: 6,
    createdAt: new Date().toISOString()
  },
  {
    id: '47',
    name: 'Set de Cuchillos Acero Inox 6 Piezas con Taco',
    description: 'Juego de 6 cuchillos de acero inoxidable con taco de madera. Incluye cuchillo cocinero, deshuesador, pan, multiuso, verduras y chaira. Hoja de alta dureza con filo duradero y mangos ergonómicos. Indispensable en toda cocina.',
    price: 32900,
    discountPrice: 26900,
    stock: 11,
    category: 'Cocina',
    images: [
      '/images/products/set-cuchillos.png'
    ],
    featured: true,
    installments: 12,
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
  { id: '8', name: 'Decoración', slug: 'deco', icon: 'Home' },
  { id: '9', name: 'Textiles y Blanquería', slug: 'textiles', icon: 'Bed' },
  { id: '10', name: 'Jardín y Exterior', slug: 'jardin', icon: 'Flower2' },
  { id: '11', name: 'Iluminación', slug: 'iluminacion', icon: 'Lightbulb' },
  { id: '12', name: 'Mascotas', slug: 'mascotas', icon: 'PawPrint' }
];
