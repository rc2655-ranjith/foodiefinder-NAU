import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { insertRestaurantSchema, insertMenuItemSchema, insertAdminSchema, insertUserSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { canAccessObject, ObjectPermission } from "./objectAcl";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    userId?: string;
    returnTo?: string;
  }
}

const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

const isUserAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  app.set("trust proxy", 1);
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl,
    },
  }));
  
  const stockImagesPath = path.join(__dirname, "..", "attached_assets", "stock_images");
  app.use("/stock-images", express.static(stockImagesPath, {
    maxAge: "1y",
    immutable: true,
  }));

  app.post("/api/user/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      res.status(201).json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error: any) {
      console.error("User registration error:", error);
      res.status(400).json({ message: error.message || "Failed to register user" });
    }
  });

  app.post("/api/user/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName
      });
    } catch (error: any) {
      console.error("User login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/user/logout", (req, res) => {
    delete req.session.userId;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user/check", async (req, res) => {
    if (req.session.userId) {
      const user = await storage.getUser(req.session.userId);
      if (user) {
        res.json({ 
          authenticated: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        });
      } else {
        res.json({ authenticated: false });
      }
    } else {
      res.json({ authenticated: false });
    }
  });

  app.post("/api/admin/register", async (req, res) => {
    try {
      const validatedData = insertAdminSchema.parse(req.body);
      const existingAdmin = await storage.getAdminByUsername(validatedData.username);
      
      if (existingAdmin) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const admin = await storage.createAdmin({
        ...validatedData,
        password: hashedPassword,
      });

      res.status(201).json({ id: admin.id, username: admin.username, email: admin.email });
    } catch (error: any) {
      console.error("Admin registration error:", error);
      res.status(400).json({ message: error.message || "Failed to register admin" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.adminId = admin.id;
      res.json({ id: admin.id, username: admin.username, email: admin.email });
    } catch (error: any) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    delete req.session.adminId;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/admin/check", (req, res) => {
    if (req.session.adminId) {
      res.json({ authenticated: true });
    } else {
      res.json({ authenticated: false });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/objects/:objectPath(*)", async (req: any, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      
      const userId = req.isAuthenticated() ? req.user?.claims?.sub : undefined;
      const hasAccess = await canAccessObject({
        userId,
        objectFile,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!hasAccess) {
        return res.sendStatus(403);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAdminAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.put("/api/images", isAdminAuthenticated, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: req.session.adminId!,
          visibility: "public",
        }
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/restaurants", async (req, res) => {
    try {
      const allRestaurants = await storage.getAllRestaurants();
      res.json(allRestaurants);
    } catch (error: any) {
      console.error("Get restaurants error:", error);
      res.status(500).json({ message: "Failed to fetch restaurants" });
    }
  });

  app.get("/api/restaurants/:id", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(req.params.id);
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
      res.json(restaurant);
    } catch (error: any) {
      console.error("Get restaurant error:", error);
      res.status(500).json({ message: "Failed to fetch restaurant" });
    }
  });

  app.post("/api/restaurants", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.createRestaurant(validatedData);
      res.status(201).json(restaurant);
    } catch (error: any) {
      console.error("Create restaurant error:", error);
      res.status(400).json({ message: error.message || "Failed to create restaurant" });
    }
  });

  app.put("/api/restaurants/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertRestaurantSchema.parse(req.body);
      const restaurant = await storage.updateRestaurant(req.params.id, validatedData);
      res.json(restaurant);
    } catch (error: any) {
      console.error("Update restaurant error:", error);
      res.status(400).json({ message: error.message || "Failed to update restaurant" });
    }
  });

  app.delete("/api/restaurants/:id", isAdminAuthenticated, async (req, res) => {
    try {
      await storage.deleteRestaurant(req.params.id);
      res.json({ message: "Restaurant deleted successfully" });
    } catch (error: any) {
      console.error("Delete restaurant error:", error);
      res.status(500).json({ message: "Failed to delete restaurant" });
    }
  });

  app.get("/api/restaurants/:id/menu", async (req, res) => {
    try {
      const menuItemsList = await storage.getMenuItemsByRestaurant(req.params.id);
      res.json(menuItemsList);
    } catch (error: any) {
      console.error("Get menu items error:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items", async (req, res) => {
    try {
      const allMenuItems = await storage.getAllMenuItems();
      res.json(allMenuItems);
    } catch (error: any) {
      console.error("Get all menu items error:", error);
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const menuItem = await storage.getMenuItem(req.params.id);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error: any) {
      console.error("Get menu item error:", error);
      res.status(500).json({ message: "Failed to fetch menu item" });
    }
  });

  app.post("/api/menu-items", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedData);
      res.status(201).json(menuItem);
    } catch (error: any) {
      console.error("Create menu item error:", error);
      res.status(400).json({ message: error.message || "Failed to create menu item" });
    }
  });

  app.put("/api/menu-items/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.updateMenuItem(req.params.id, validatedData);
      res.json(menuItem);
    } catch (error: any) {
      console.error("Update menu item error:", error);
      res.status(400).json({ message: error.message || "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", isAdminAuthenticated, async (req, res) => {
    try {
      await storage.deleteMenuItem(req.params.id);
      res.json({ message: "Menu item deleted successfully" });
    } catch (error: any) {
      console.error("Delete menu item error:", error);
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
