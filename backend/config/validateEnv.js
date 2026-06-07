const validateEnv = () => {
  const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'OPENROUTER_API_KEY'];
  const missingEnv = [];

  requiredEnv.forEach((key) => {
    if (!process.env[key]) {
      missingEnv.push(key);
    }
  });

  if (missingEnv.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing required environment variables:');
    missingEnv.forEach((env) => {
      console.error(`   - ${env}`);
    });
    console.error('Please configure them in your .env file before starting the application.\n');
    process.exit(1);
  }
};

module.exports = validateEnv;
