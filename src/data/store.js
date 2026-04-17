const products = [
    {
        id: 1,
        name: 'Forge Alpha Mechanical Keyboard',
        category: 'Accessories',
        price: 89.99,
        rating: 4.7,
        description: 'Compact 75% keyboard with hot-swappable switches.',
        image: '/assets/keyboard.jpg',
        inventory: 30,
        featured: true,
    },
    {
        id: 2,
        name: 'Forge Pulse Gaming Mouse',
        category: 'Accessories',
        price: 49.99,
        rating: 4.5,
        description: 'Ergonomic mouse with customizable RGB profiles.',
        image: '/assets/mouse.jpg',
        inventory: 45,
        featured: true,
    },
    {
        id: 3,
        name: 'Forge Nova Ultrawide Monitor',
        category: 'Displays',
        price: 399.99,
        rating: 4.8,
        description: '34-inch ultrawide monitor with 144Hz refresh rate.',
        image: '/assets/monitor.jpg',
        inventory: 12,
        featured: false,
    },
    {
        id: 4,
        name: 'Forge Air Wireless Headset',
        category: 'Audio',
        price: 129.99,
        rating: 4.4,
        description: 'Low-latency headset with 30-hour battery life.',
        image: '/assets/headset.jpg',
        inventory: 24,
        featured: false,
    },
    {
        id: 5,
        name: 'Forge Titan Desk Mat',
        category: 'Accessories',
        price: 19.99,
        rating: 4.3,
        description: 'Extended desk mat with anti-fray stitched edges.',
        image: '/assets/deskmat.jpg',
        inventory: 80,
        featured: true,
    },
];

const carts = new Map();
const orders = [];

let nextOrderId = 1001;

const getCartByUserId = (userId) => {
    if (!carts.has(userId)) {
        carts.set(userId, []);
    }

    return carts.get(userId);
};

const generateOrderId = () => {
    const id = nextOrderId;
    nextOrderId += 1;
    return id;
};

module.exports = {
    products,
    carts,
    orders,
    getCartByUserId,
    generateOrderId,
};
