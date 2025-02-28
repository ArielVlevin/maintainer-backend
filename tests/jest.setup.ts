import { connectDB, disconnectDB } from "../src/config/db";

// לפני כל הבדיקות - התחברות למסד נתונים וירטואלי
beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await connectDB();
});

// אחרי כל הבדיקות - ניתוק מסד הנתונים כדי למנוע זליגה
afterAll(async () => {
  await disconnectDB();
});
