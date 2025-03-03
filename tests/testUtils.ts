import { User } from "../src/models/User";
import { Product } from "../src/models/Product";
import { Task } from "../src/models/Task";
/**
 * Creates a test user if it doesn't exist.
 * @param email The email for the test user
 * @param name The name of the test user
 * @returns The created or existing user document
 */
export async function createTestUser(
  email: string,
  name: string = "Test User"
) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ email, name });
  }
  return user;
}

/**
 * Creates a test product associated with a user.
 * @param userId The ID of the user who owns the product
 * @param productData Additional product data
 * @returns The created product document
 */
export async function createTestProduct(
  userId: string,
  productData?: Partial<any>
) {
  const defaultProduct = {
    name: "Test Product",
    category: "Test Category",
    manufacturer: "Test Manufacturer",
    model: "T123",
    tags: ["tag1", "tag2"],
    purchaseDate: new Date(),
    ...productData, // Allows overriding default values
  };

  return await Product.create({ ...defaultProduct, user_id: userId });
}

/**
 * Creates a test maintenance task for a product.
 * @param userId The ID of the user who owns the task
 * @param productId The ID of the product associated with the task
 * @param taskData Additional task data
 * @returns The created task document
 */
export async function createTestTask(
  userId: string,
  productId: string,
  taskData?: Partial<any>
) {
  const defaultTask = {
    taskName: "Test Task",
    description: "Task Description",
    lastMaintenance: new Date(),
    frequency: 30,
    nextMaintenance: new Date(),
    status: "healthy",
    ...taskData, // Allows overriding default values
  };

  return await Task.create({
    ...defaultTask,
    user_id: userId,
    product_id: productId,
  });
}
