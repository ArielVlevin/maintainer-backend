import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../src/config/db";
import redisClient, {
  connectRedis,
  disconnectRedis,
} from "../src/config/redis";

import {
  jest,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await connectDB();
  await connectRedis();
});

beforeEach(async () => {
  while (!mongoose.connection.db)
    await new Promise((resolve) => setTimeout(resolve, 50));

  // const collections = await mongoose.connection.db.collections();
  //for (let collection of collections) await collection.deleteMany({});
});

afterAll(async () => {
  await disconnectDB();
  await disconnectRedis();
});
