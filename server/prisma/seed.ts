
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All 30 mock profiles
const profiles = [
  ["Aarav", 23, "Chennai", "Love coding and late-night coffee.", "Coding, Coffee, Gaming"],
  ["Diya", 22, "Bengaluru", "Books, music and meaningful conversations.", "Reading, Music, Travel"],
  ["Rohan", 24, "Mumbai", "Fitness enthusiast and weekend explorer.", "Gym, Hiking, Movies"],
  ["Ananya", 21, "Chennai", "Always looking for new adventures.", "Travel, Photography, Art"],
  ["Vikram", 23, "Hyderabad", "Tech enthusiast and football fan.", "Technology, Football, Gaming"],
  ["Meera", 22, "Coimbatore", "Coffee, sunsets and good music.", "Coffee, Music, Nature"],
  ["Arjun", 24, "Pune", "Building apps and exploring places.", "Coding, Travel, Fitness"],
  ["Priya", 21, "Chennai", "Dancer and aspiring designer.", "Dance, Design, Fashion"],
  ["Karthik", 23, "Bengaluru", "Foodie who loves road trips.", "Food, Driving, Movies"],
  ["Sneha", 22, "Mumbai", "Finding happiness in little things.", "Art, Reading, Music"],
  ["Rahul", 24, "Delhi", "Gym, startups and good conversations.", "Fitness, Business, Travel"],
  ["Nisha", 21, "Chennai", "Passionate about photography.", "Photography, Nature, Art"],
  ["Aditya", 23, "Hyderabad", "AI enthusiast and gamer.", "AI, Gaming, Coding"],
  ["Kavya", 22, "Bengaluru", "Music makes everything better.", "Singing, Music, Travel"],
  ["Sanjay", 24, "Coimbatore", "Cricket and weekend adventures.", "Cricket, Fitness, Travel"],
  ["Ishita", 21, "Pune", "Dreamer, reader and explorer.", "Books, Art, Travel"],
  ["Varun", 23, "Chennai", "Always learning something new.", "Technology, Gaming, Music"],
  ["Pooja", 22, "Delhi", "Loves painting and peaceful places.", "Painting, Nature, Yoga"],
  ["Harish", 24, "Mumbai", "Software developer and movie buff.", "Coding, Cinema, Travel"],
  ["Tara", 21, "Bengaluru", "Collecting memories and photographs.", "Photography, Music, Food"],
  ["Naveen", 23, "Chennai", "Football, fitness and fun.", "Football, Gym, Gaming"],
  ["Riya", 22, "Hyderabad", "Explorer with a creative mind.", "Travel, Design, Music"],
  ["Akash", 24, "Pune", "Love startups and technology.", "Startups, Coding, Fitness"],
  ["Divya", 21, "Coimbatore", "Dancing through life.", "Dance, Music, Fashion"],
  ["Manoj", 23, "Delhi", "Weekend traveler and foodie.", "Travel, Food, Photography"],
  ["Swetha", 22, "Chennai", "Books and coffee are my favorites.", "Reading, Coffee, Art"],
  ["Pranav", 24, "Bengaluru", "Tech geek with a love for music.", "Technology, Music, Gaming"],
  ["Aisha", 21, "Mumbai", "Artist who loves exploring cultures.", "Art, Travel, Food"],
  ["Deepak", 23, "Hyderabad", "Fitness and outdoor adventures.", "Gym, Hiking, Sports"],
  ["Keerthi", 22, "Chennai", "Positive vibes and endless curiosity.", "Music, Reading, Travel"],
] as const;

// Fixed portrait IDs for consistent mock profiles
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

// Six profiles have already liked the demo user.
// Their identities remain private until a mutual match.
const incomingLikeIndices = [2, 5, 9, 14, 20, 27];

async function main() {
  console.log("Starting Coy Discover database seed...");

  // Create or update the demo user without deleting existing data.
  const demoUser = await prisma.user.upsert({
    where: { id: 1 },
    update: {
      name: "Demo User",
      age: 23,
      photo: "https://i.pravatar.cc/400?img=12",
      bio: "Exploring meaningful connections.",
      city: "Chennai",
      college: "Demo College",
      interests: JSON.stringify([
        "Technology",
        "Music",
        "Travel",
      ]),
    },
    create: {
      id: 1,
      name: "Demo User",
      age: 23,
      photo: "https://i.pravatar.cc/400?img=12",
      bio: "Exploring meaningful connections.",
      city: "Chennai",
      college: "Demo College",
      interests: JSON.stringify([
        "Technology",
        "Music",
        "Travel",
      ]),
    },
  });

  console.log(`Demo user ready: ID ${demoUser.id}`);

  const createdProfiles: { id: number }[] = [];

  for (let i = 0; i < profiles.length; i++) {
    const [name, age, city, bio, interests] = profiles[i];

    const imageId = profilePhotos[name];

    if (imageId === undefined) {
      throw new Error(`Missing photo for profile: ${name}`);
    }

    // IDs 2 through 31 belong to the 30 mock profiles.
    const profileId = i + 2;

    const user = await prisma.user.upsert({
      where: { id: profileId },
      update: {
        name,
        age,
        city,
        bio,
        college: "Demo College",
        photo: `https://i.pravatar.cc/400?img=${imageId}`,
        interests: JSON.stringify(
          interests.split(",").map((item) => item.trim())
        ),
      },
      create: {
        id: profileId,
        name,
        age,
        city,
        bio,
        college: "Demo College",
        photo: `https://i.pravatar.cc/400?img=${imageId}`,
        interests: JSON.stringify(
          interests.split(",").map((item) => item.trim())
        ),
      },
    });

    createdProfiles.push(user);
  }

  // Preserve existing swipes and create missing incoming likes.
  for (const index of incomingLikeIndices) {
    const fromUserId = createdProfiles[index].id;

    await prisma.swipe.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId: demoUser.id,
        },
      },
      update: {},
      create: {
        fromUserId,
        toUserId: demoUser.id,
        action: "LIKE",
      },
    });
  }

  console.log(`Ready: ${createdProfiles.length} profiles.`);
  console.log(`Ensured ${incomingLikeIndices.length} incoming likes.`);
  console.log("Existing swipes and matches preserved.");
  console.log("Database seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
