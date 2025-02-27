import {
  setVerificationToken,
  getVerificationEmail,
  deleteVerificationToken,
} from "../src/utils/redis";

(async () => {
  console.log("🔹 Running Redis test script...");

  await setVerificationToken("test@example.com", "my-secret-token");

  const email = await getVerificationEmail("my-secret-token");
  console.log("✅ Retrieved email:", email); // צריך להיות "test@example.com"

  await deleteVerificationToken("my-secret-token");

  const deletedEmail = await getVerificationEmail("my-secret-token");
  console.log("✅ Deleted email:", deletedEmail); // צריך להיות null

  console.log("🎉 Redis test completed!");
  process.exit(0);
})();
