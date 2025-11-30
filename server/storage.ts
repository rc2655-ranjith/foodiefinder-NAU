import {
  users,
  admins,
  restaurants,
  menuItems,
  type User,
  type UpsertUser,
  type InsertUser,
  type Admin,
  type InsertAdmin,
  type Restaurant,
  type InsertRestaurant,
  type MenuItem,
  type InsertMenuItem,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  getAllRestaurants(): Promise<Restaurant[]>;
  getRestaurant(id: string): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  updateRestaurant(id: string, restaurant: InsertRestaurant): Promise<Restaurant>;
  deleteRestaurant(id: string): Promise<void>;
  
  getAllMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, menuItem: InsertMenuItem): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(adminData).returning();
    return admin;
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.select().from(restaurants).orderBy(restaurants.name);
  }

  async getRestaurant(id: string): Promise<Restaurant | undefined> {
    const [restaurant] = await db.select().from(restaurants).where(eq(restaurants.id, id));
    return restaurant;
  }

  async createRestaurant(restaurantData: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db.insert(restaurants).values(restaurantData).returning();
    return restaurant;
  }

  async updateRestaurant(id: string, restaurantData: InsertRestaurant): Promise<Restaurant> {
    const [restaurant] = await db
      .update(restaurants)
      .set({ ...restaurantData, updatedAt: new Date() })
      .where(eq(restaurants.id, id))
      .returning();
    return restaurant;
  }

  async deleteRestaurant(id: string): Promise<void> {
    await db.delete(restaurants).where(eq(restaurants.id, id));
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).orderBy(menuItems.name);
  }

  async getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.restaurantId, restaurantId))
      .orderBy(menuItems.category, menuItems.name);
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem;
  }

  async createMenuItem(menuItemData: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db.insert(menuItems).values(menuItemData).returning();
    return menuItem;
  }

  async updateMenuItem(id: string, menuItemData: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .update(menuItems)
      .set(menuItemData)
      .where(eq(menuItems.id, id))
      .returning();
    return menuItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  }
}

export const storage = new DatabaseStorage();
