import { storage } from "./storage";
import bcrypt from "bcrypt";

async function seed() {
  try {
    const existingAdmin = await storage.getAdminByUsername("admin");
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = await storage.createAdmin({
        username: "admin",
        password: hashedPassword,
        email: "admin@foodiefinder.com",
      });
      console.log("✓ Default admin created:");
      console.log("  Username: admin");
      console.log("  Password: admin123");
      console.log("  Email:", admin.email);
    } else {
      console.log("✓ Admin account already exists");
    }

    const restaurantCount = await storage.getAllRestaurants();
    if (restaurantCount.length === 0) {
      const restaurant1 = await storage.createRestaurant({
        name: "La Bella Italia",
        description: "Authentic Italian cuisine with fresh pasta and wood-fired pizzas. Family-owned restaurant serving traditional recipes passed down through generations.",
        cuisine: "Italian",
        priceRange: "$$",
        address: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        phone: "(415) 555-0123",
        hours: "Mon-Thu: 11am-10pm\nFri-Sat: 11am-11pm\nSun: 12pm-9pm",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
        imageGallery: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
          "https://images.unsplash.com/photo-1555992336-fb0d29498b13?w=400"
        ],
        latitude: "37.7749",
        longitude: "-122.4194",
      });

      const restaurant2 = await storage.createRestaurant({
        name: "Sakura Sushi Bar",
        description: "Premium sushi and Japanese cuisine featuring the freshest seafood and traditional techniques. Omakase menu available.",
        cuisine: "Japanese",
        priceRange: "$$$",
        address: "456 Market Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103",
        phone: "(415) 555-0456",
        hours: "Tue-Sun: 5pm-11pm\nClosed Monday",
        imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
        imageGallery: [
          "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
          "https://images.unsplash.com/photo-1564489563601-c53cfc451e93?w=400"
        ],
        latitude: "37.7849",
        longitude: "-122.4094",
      });

      const restaurant3 = await storage.createRestaurant({
        name: "The Burger Joint",
        description: "Classic American burgers made with locally sourced beef and fresh ingredients. Craft beer selection and homemade milkshakes.",
        cuisine: "American",
        priceRange: "$",
        address: "789 Castro Street",
        city: "San Francisco",
        state: "CA",
        zipCode: "94114",
        phone: "(415) 555-0789",
        hours: "Daily: 11am-10pm",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        imageGallery: [
          "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400"
        ],
        latitude: "37.7609",
        longitude: "-122.4350",
      });

      await storage.createMenuItem({
        restaurantId: restaurant1.id,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, fresh mozzarella, and basil",
        price: "16.99",
        category: "Pizza",
      });

      await storage.createMenuItem({
        restaurantId: restaurant1.id,
        name: "Spaghetti Carbonara",
        description: "Traditional Roman pasta with eggs, pecorino cheese, and guanciale",
        price: "18.99",
        category: "Pasta",
      });

      await storage.createMenuItem({
        restaurantId: restaurant2.id,
        name: "Chef's Omakase",
        description: "12-piece chef's selection of premium sushi and sashimi",
        price: "85.00",
        category: "Omakase",
      });

      await storage.createMenuItem({
        restaurantId: restaurant2.id,
        name: "Spicy Tuna Roll",
        description: "Fresh tuna with spicy mayo and cucumber",
        price: "14.50",
        category: "Rolls",
      });

      await storage.createMenuItem({
        restaurantId: restaurant3.id,
        name: "Classic Cheeseburger",
        description: "8oz beef patty with cheddar, lettuce, tomato, and special sauce",
        price: "12.99",
        category: "Burgers",
      });

      await storage.createMenuItem({
        restaurantId: restaurant3.id,
        name: "Truffle Fries",
        description: "Hand-cut fries with truffle oil and parmesan",
        price: "8.99",
        category: "Sides",
      });

      console.log("✓ Sample restaurants and menu items created");
    } else {
      console.log("✓ Restaurants already exist");
    }

    console.log("\n✓ Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
  process.exit(0);
}

seed();
