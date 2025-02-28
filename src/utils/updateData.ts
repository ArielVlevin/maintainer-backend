import { Document } from "mongoose";
import { DBError } from "./CustomError";
import { id } from "../types/MongoDB";

/**
 * Updates a Mongoose document by merging new data and saving it.
 *
 * @param {T} document - The existing Mongoose document.
 * @param {Partial<T>} updatedData - The updated fields to merge.
 * @returns {Promise<T>} - The updated document after saving.
 *
 * @example
 * const updatedProduct = await updateDocument(product, updatedData);
 */
export async function updateData<T extends Document>(
  document: T,
  updatedData: Partial<T>
): Promise<T> {
  if (!document) throw new DBError("Document not found");
  try {
    Object.assign(document, updatedData);
    await document.save();
    return document;
  } catch (error) {
    throw new DBError("Error updating document");
  }
}

/**
 * Updates a document in the database by finding it first and applying the updates.
 *
 * @template T - The Mongoose model type.
 * @param {Function} findFunction - The function to find the document (e.g., findTaskById, findProductById).
 * @param {string | id} entity_id - The ID of the document to update.
 * @param {any} updatedData - The new data to apply to the document.
 * @returns {Promise<T>} - The updated document.
 * @throws {DBError} - If the document is not found or the update fails.
 *
 * @example
 * const updatedTask = await updateEntity(findTaskById, "task_id", { status: "completed" });
 * const updatedProduct = await updateEntity(findProductById, "product_id", { name: "New Name" });
 */
export const updateEntity = async <T extends Document>(
  findFunction: (id: string | id) => Promise<T>,
  entity_id: string | id,
  updatedData: any
): Promise<T> => {
  try {
    const entity = await findFunction(entity_id);
    return await updateData(entity, updatedData);
  } catch (error) {
    throw new DBError((error as Error).message);
  }
};
