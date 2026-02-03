const { seedEnhancedCheckins } = require('./seed');

console.log('🌱 Starting seed process...\n');

seedEnhancedCheckins()
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });