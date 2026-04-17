const products = [
    {
        id: "1",
        title: 'Hackathon Hoodie 2026',
        category: 'clothing',
        price: 59.99,
        rating: 4.8,
        description: 'Premium heavyweight hoodie for long coding sessions.',
        techStackTags: ['React', 'Node.js', 'Firebase'],
        image: 'assets/images/hoodie.png',
        type: 'physical',
        inventory: 150,
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "2",
        title: 'Code Powered T-Shirt',
        category: 'clothing',
        price: 29.99,
        rating: 4.5,
        description: 'Comfortable cotton t-shirt with a minimalist code design.',
        techStackTags: ['Frontend', 'UI/UX'],
        image: 'assets/images/tshirt.png',
        type: 'physical',
        inventory: 200,
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "3",
        title: 'Premium Dev Backpack',
        category: 'accessories',
        price: 89.99,
        rating: 4.9,
        description: 'Water-resistant backpack with dedicated laptop sleeve.',
        techStackTags: ['Mobile', 'Cloud'],
        image: 'assets/images/backpack.png',
        type: 'physical',
        inventory: 50,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "4",
        title: 'API Access Token (1Yr)',
        category: 'digital',
        price: 149.99,
        rating: 5.0,
        description: 'One year of unlimited access to our premium developer APIs.',
        techStackTags: ['API', 'Backend', 'Data'],
        image: 'assets/images/api_token.png',
        type: 'digital',
        downloadURL: 'https://example.com/download/api_token_license.pdf',
        inventory: 9999, // Digital products don't really run out
        featured: true,
        createdAt: new Date().toISOString()
    },
    {
        id: "5",
        title: 'BackForge Sticker Pack',
        category: 'accessories',
        price: 9.99,
        rating: 4.7,
        description: 'Vinyl stickers featuring popular dev tools and frameworks.',
        techStackTags: ['React', 'Vue', 'Angular', 'Svelte'],
        image: 'assets/images/stickers.png',
        type: 'physical',
        inventory: 300,
        featured: false,
        createdAt: new Date().toISOString()
    },
    {
        id: "6",
        title: 'Forge Coffee Mug',
        category: 'accessories',
        price: 14.99,
        rating: 4.6,
        description: 'Ceramic mug to hold your fuel for coding.',
        techStackTags: ['Java'], // A little dev humor
        image: 'assets/images/mug.png',
        type: 'physical',
        inventory: 120,
        featured: false,
        createdAt: new Date().toISOString()
    }
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
