
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Explicitly selected demo portrait IDs.
// These are fixed URLs, not randomly assigned images.
const profilePhotos: Record<string, number> = {
  Aarav: 11,
  Diya: 47,
  Rohan: 12,
  Ananya: 44,
  Vikram: 13,
  Meera: 45,
  Arjun: 14,
  Priya: 46,
  Karthik: 15,
  Sneha: 48,
  Rahul: 16,
  Nisha: 49,
  Aditya: 17,
  Kavya: 50,
  Sanjay: 18,
  Ishita: 51,
  Varun: 19,
  Pooja: 52,
  Harish: 20,
  Tara: 53,
  Naveen: 21,
  Riya: 54,
  Akash: 22,
  Divya: 55,
  Manoj: 23,
  Swetha: 56,
  Pranav: 24,
  Aisha: 57,
  Deepak: 25,
  Keerthi: 58,
};

async function main() {
  console.log("Updating Coy Discover profile photos...");

  let updated = 0;

  for (const [name, imageId] of Object.entries(profilePhotos)) {
    const result = await prisma.user.updateMany({
      where: { name },
      data: {
        photo: `https://i.pravatar.cc/400?img=${imageId}`,
      },
    });

    updated += result.count;
  }

  console.log(`Updated ${updated} profile photos.`);
  console.log("Swipe history and matches were preserved.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
