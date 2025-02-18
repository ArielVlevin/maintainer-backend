import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { IProduct } from "../../types";

const jsonFilePath = path.join(__dirname, "../data/sample_data.json");

const loadJsonData = () => {
  if (fs.existsSync(jsonFilePath)) {
    return JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));
  }
  return { users: [], products: [], tasks: [] };
};

const saveJsonData = (data: any) => {
  fs.writeFileSync(jsonFilePath, JSON.stringify(data, null, 4), "utf-8");
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      manufacturer,
      model,
      tags,
      purchaseDate,
      iconUrl,
      user_id,
    } = req.body;
    if (!user_id) {
      res.status(400).json({ error: "Missing user ID" });
      return;
    }

    const data = loadJsonData();
    const newProduct = {
      _id: Date.now().toString(),
      name,
      user_id,
      category,
      manufacturer,
      model,
      tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
      purchaseDate,
      taskIds: [],
      iconUrl: iconUrl || "/uploads/default-product.png",
    };
    data.products.push(newProduct);
    saveJsonData(data);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({
      error: "Error creating product",
      details: (error as Error).message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching products",
      details: (error as Error).message,
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    const product = data.products.find(
      (p: IProduct) => p._id === req.params.product_id
    );
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching product",
      details: (error as Error).message,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    const productIndex = data.products.findIndex(
      (p: IProduct) => p._id === req.params.product_id
    );
    if (productIndex === -1) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    data.products[productIndex] = {
      ...data.products[productIndex],
      ...req.body,
    };
    saveJsonData(data);
    res.json(data.products[productIndex]);
  } catch (error) {
    res.status(500).json({
      error: "Error updating product",
      details: (error as Error).message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    data.products = data.products.filter(
      (p: IProduct) => p._id !== req.params.product_id
    );
    saveJsonData(data);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Error deleting product",
      details: (error as Error).message,
    });
  }
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const data = loadJsonData();
    const categories = [
      ...new Set(
        data.products.map((p: IProduct) => p.category).filter(Boolean)
      ),
    ];
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      error: "Error fetching categories",
      details: (error as Error).message,
    });
  }
};
