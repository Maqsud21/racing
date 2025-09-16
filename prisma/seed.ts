import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create initial config
  const config = await prisma.config.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      pointsPerCorrect: 1,
      enableStreaks: true,
      lastRaceNumber: 0
    }
  })

  console.log('✅ Config created:', config)

  // Create a sample race for development
  const now = new Date()
  const endTime = new Date(now.getTime() + 10 * 60 * 1000) // 10 minutes from now

  const race = await prisma.race.create({
    data: {
      id: `race_${Date.now()}`,
      startAt: now,
      endAt: endTime,
      status: 'OPEN',
      uniqueIdx: 1
    }
  })

  console.log('✅ Sample race created:', race)

  // Update config with race number
  await prisma.config.update({
    where: { id: 1 },
    data: { lastRaceNumber: 1 }
  })

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
