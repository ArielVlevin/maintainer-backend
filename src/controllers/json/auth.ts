import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { IUser } from "../types";

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

export const verifyUser = async (req: Request, res: Response) => {
  try {
    const { _id, name, email } = req.body;
    if (!_id || !email || !name) {
      res.status(400).json({ error: "Missing required user data" });
      return;
    }

    const data = loadJsonData();
    let user =
      data.users.find((u: IUser) => u._id === _id) ||
      data.users.find((u: IUser) => u.email === email);

    if (user) {
      Object.assign(user, {
        name: name || user.name,
        role: user.role || "user",
        createdAt: user.createdAt || new Date().toISOString(),
        emailVerified: user.emailVerified ?? false,
        profileCompleted: true,
      });
      saveJsonData(data);
      res.status(200).json({ message: "User profile completed", user });
      return;
    }

    res.status(404).json({ error: "User not found in database." });
  } catch (error) {
    console.error("❌ Error verifying user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { _id } = req.user!;
    const data = loadJsonData();
    const user = data.users.find((u: IUser) => u._id === _id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
