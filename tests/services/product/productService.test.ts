import { createUserIfNotExists } from "../../../src/services/authService";
import {
  createProduct,
  findProductById,
  updateProduct,
  deleteProduct,
} from "../../../src/services/productService";
import { id } from "../../../src/types/MongoDB";

describe("🛠 Product Service Tests", () => {
  let product_id: id;
  let user_id: id;

  beforeAll(async () => {
    const user = await createUserIfNotExists("test@example.com", "Test User");
    user_id = user._id;
  });

  it("✅ Should create a new product", async () => {
    const product = await createProduct(user_id, {
      name: "Test Product",
      category: "Test Category",
      manufacturer: "Test Manufacturer",
      model: "T123",
      tags: ["tag1", "tag2"],
      purchaseDate: new Date(),
    });
    expect(product).toBeDefined();
    expect(product.name).toBe("Test Product");
    product_id = product._id;
  });

  it("✅ Should find product by ID", async () => {
    const product = await findProductById(product_id);
    expect(product).toBeDefined();
    expect(product?.name).toBe("Test Product");
  });

  it("✅ Should update product details", async () => {
    const updatedProduct = await updateProduct(product_id, {
      name: "Updated Product",
    });
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.name).toBe("Updated Product");
  });

  it("✅ Should delete product", async () => {
    const result = await deleteProduct(product_id, user_id);
    expect(result.message).toBe("Product deleted successfully");
  });
});
