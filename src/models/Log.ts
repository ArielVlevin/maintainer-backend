import mongoose, { Schema, Document } from "mongoose";

export interface ILog extends Document {
  user_id: mongoose.Types.ObjectId;
  actionType: "CREATE" | "UPDATE" | "DELETE" | "COMPLETE";
  entityType: "PRODUCT" | "TASK" | "USER";
  entityId: mongoose.Types.ObjectId;
  details: string;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  actionType: {
    type: String,
    enum: ["CREATE", "UPDATE", "DELETE", "COMPLETE"],
    required: true,
  },
  entityType: {
    type: String,
    enum: ["PRODUCT", "TASK", "USER"],
    required: true,
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Log = mongoose.model<ILog>("Log", LogSchema);
