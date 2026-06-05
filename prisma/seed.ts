import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("demo123");

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@palco.com" },
    update: {},
    create: {
      email: "demo@palco.com",
      name: "Usuário Demo",
      passwordHash,
      subscriptionTier: "free",
      proposalsUsed: 0,
      proposalsLimit: 2,
    },
  });

  const bandOwner = await prisma.user.upsert({
    where: { email: "banda@palco.com" },
    update: {},
    create: {
      email: "banda@palco.com",
      name: "Lucas Banda",
      passwordHash,
      proposalsLimit: 10,
    },
  });

  const venueOwner = await prisma.user.upsert({
    where: { email: "bar@palco.com" },
    update: {},
    create: {
      email: "bar@palco.com",
      name: "Ana Contratante",
      passwordHash,
      proposalsLimit: 10,
    },
  });

  const musicianOwner = await prisma.user.upsert({
    where: { email: "musico@palco.com" },
    update: {},
    create: {
      email: "musico@palco.com",
      name: "Marina Músico",
      passwordHash,
      proposalsLimit: 10,
    },
  });

  const bandsData = [
    {
      userId: bandOwner.id,
      name: "The Violet Cats",
      genre: "Rock/Indie",
      description: "Banda de rock alternativo com influências de indie e pop.",
      location: "São Paulo - SP",
      members: 4,
      priceRange: "R$ 600 - R$ 1.200",
      rating: 4.8,
      totalShows: 23,
    },
    {
      userId: bandOwner.id,
      name: "Samba da Vila",
      genre: "Samba/Pagode",
      description: "Grupo de samba enredo e pagode para bares e eventos.",
      location: "Rio de Janeiro - RJ",
      members: 6,
      priceRange: "R$ 400 - R$ 900",
      rating: 4.6,
      totalShows: 45,
    },
    {
      userId: bandOwner.id,
      name: "Trio Jazz&Co",
      genre: "Jazz",
      description: "Trio instrumental de jazz para restaurantes e eventos corporativos.",
      location: "Belo Horizonte - MG",
      members: 3,
      priceRange: "R$ 700 - R$ 1.500",
      rating: 4.9,
      totalShows: 18,
    },
    {
      userId: bandOwner.id,
      name: "MPB Roots",
      genre: "MPB",
      description: "Voz e violão com repertório de MPB clássica e contemporânea.",
      location: "São Paulo - SP",
      members: 2,
      priceRange: "R$ 350 - R$ 800",
      rating: 4.7,
      totalShows: 31,
    },
    {
      userId: bandOwner.id,
      name: "Eletronic Pulse",
      genre: "Eletrônica",
      description: "DJ set e live eletrônica para casas noturnas.",
      location: "Curitiba - PR",
      members: 2,
      priceRange: "R$ 800 - R$ 2.000",
      rating: 4.5,
      totalShows: 12,
    },
  ];

  const bandProfiles: { bandId: string; profileId: string; userId: string }[] = [];

  for (const data of bandsData) {
    const existing = await prisma.band.findFirst({
      where: { name: data.name, userId: data.userId },
    });
    const band =
      existing ??
      (await prisma.band.create({ data }));

    let profile = await prisma.profile.findFirst({
      where: { entityId: band.id, type: "banda" },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          userId: data.userId,
          type: "banda",
          entityId: band.id,
        },
      });
    }

    bandProfiles.push({
      bandId: band.id,
      profileId: profile.id,
      userId: data.userId,
    });
  }

  await prisma.user.update({
    where: { id: bandOwner.id },
    data: { activeProfileId: bandProfiles[0]?.profileId },
  });

  const musiciansData = [
    {
      userId: musicianOwner.id,
      name: "Diego Martins",
      instruments: ["Bateria"],
      genres: ["Rock", "Pop"],
      location: "São Paulo - SP",
      bio: "Baterista profissional com 10 anos de experiência.",
      experience: "profissional" as const,
      availability: "disponivel" as const,
      lookingFor: "ambos" as const,
      pricePerGig: "R$ 200 - R$ 400",
      rating: 4.8,
      totalGigs: 56,
    },
    {
      userId: musicianOwner.id,
      name: "Carla Nunes",
      instruments: ["Voz", "Violão"],
      genres: ["MPB", "Samba"],
      location: "Rio de Janeiro - RJ",
      bio: "Vocalista e compositora para gigs solo e bandas.",
      experience: "intermediario" as const,
      availability: "parcial" as const,
      lookingFor: "freelance" as const,
      pricePerGig: "R$ 250 - R$ 500",
      rating: 4.9,
      totalGigs: 34,
    },
    {
      userId: musicianOwner.id,
      name: "Rafael Costa",
      instruments: ["Guitarra"],
      genres: ["Blues", "Rock"],
      location: "Belo Horizonte - MG",
      bio: "Guitarrista session player disponível para substituições.",
      experience: "profissional" as const,
      availability: "disponivel" as const,
      lookingFor: "banda" as const,
      pricePerGig: "R$ 180 - R$ 350",
      rating: 4.6,
      totalGigs: 42,
    },
    {
      userId: musicianOwner.id,
      name: "Julia Freitas",
      instruments: ["Teclado"],
      genres: ["Jazz", "MPB"],
      location: "São Paulo - SP",
      bio: "Tecladista para bandas de casamento e eventos corporativos.",
      experience: "intermediario" as const,
      availability: "disponivel" as const,
      lookingFor: "freelance" as const,
      pricePerGig: "R$ 300 - R$ 600",
      rating: 4.7,
      totalGigs: 28,
    },
  ];

  for (const data of musiciansData) {
    const existing = await prisma.musician.findFirst({
      where: { name: data.name, userId: data.userId },
    });
    const musician =
      existing ??
      (await prisma.musician.create({ data }));

    const profileExists = await prisma.profile.findFirst({
      where: { entityId: musician.id, type: "artista_independente" },
    });

    if (!profileExists) {
      const profile = await prisma.profile.create({
        data: {
          userId: data.userId,
          type: "artista_independente",
          entityId: musician.id,
        },
      });
      if (!musicianOwner.activeProfileId) {
        await prisma.user.update({
          where: { id: musicianOwner.id },
          data: { activeProfileId: profile.id },
        });
      }
    }
  }

  const establishmentsData = [
    {
      userId: venueOwner.id,
      name: "Bar Aurora",
      type: "Bar",
      description: "Bar de rock e pop no coração da Vila Madalena.",
      location: "São Paulo - SP",
      capacity: 150,
      averageBudget: "R$ 900 - R$ 1.200",
      rating: 4.7,
      totalEvents: 18,
    },
    {
      userId: venueOwner.id,
      name: "Rest. Varanda",
      type: "Restaurante",
      description: "Restaurante com música ao vivo às sextas e sábados.",
      location: "Curitiba - PR",
      capacity: 90,
      averageBudget: "R$ 700 - R$ 1.000",
      rating: 4.5,
      totalEvents: 12,
    },
    {
      userId: venueOwner.id,
      name: "Pub Noite Feliz",
      type: "Pub",
      description: "Pub temático com palco amplo e PA completa.",
      location: "Florianópolis - SC",
      capacity: 200,
      averageBudget: "R$ 1.000 - R$ 1.500",
      rating: 4.8,
      totalEvents: 24,
    },
  ];

  let venueProfileId: string | undefined;

  for (const data of establishmentsData) {
    const existing = await prisma.establishment.findFirst({
      where: { name: data.name, userId: data.userId },
    });
    const establishment =
      existing ??
      (await prisma.establishment.create({ data }));

    const profileExists = await prisma.profile.findFirst({
      where: { entityId: establishment.id, type: "contratante" },
    });

    if (!profileExists) {
      const profile = await prisma.profile.create({
        data: {
          userId: data.userId,
          type: "contratante",
          entityId: establishment.id,
        },
      });
      venueProfileId = profile.id;
    } else {
      venueProfileId = profileExists.id;
    }
  }

  if (venueProfileId) {
    await prisma.user.update({
      where: { id: venueOwner.id },
      data: { activeProfileId: venueProfileId },
    });
  }

  const demoProfile = await prisma.profile.findFirst({
    where: { userId: demoUser.id },
  });

  if (!demoProfile && bandProfiles[0]) {
    await prisma.profile.create({
      data: {
        userId: demoUser.id,
        type: "banda",
        entityId: bandProfiles[0].bandId,
        role: "member",
      },
    });
  }

  await prisma.user.update({
    where: { id: demoUser.id },
    data: {
      activeProfileId:
        demoProfile?.id ??
        (
          await prisma.profile.findFirst({ where: { userId: demoUser.id } })
        )?.id,
    },
  });

  const existingProposal = await prisma.proposal.findFirst({
    where: { fromUserId: venueOwner.id, toUserId: bandOwner.id },
  });

  if (!existingProposal && bandProfiles[0] && venueProfileId) {
    const venueProfile = await prisma.profile.findFirst({
      where: { userId: venueOwner.id, type: "contratante" },
    });
    const bandProfile = bandProfiles[0];

    if (venueProfile) {
      const pendingProposal = await prisma.proposal.create({
        data: {
          fromProfileId: venueProfile.id,
          toProfileId: bandProfile.profileId,
          fromUserId: venueOwner.id,
          toUserId: bandOwner.id,
          eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          message: "Show de sexta-feira — repertório rock/pop, 3 horas.",
          amount: 900,
          status: "pending",
        },
      });

      await prisma.notification.create({
        data: {
          userId: bandOwner.id,
          type: "proposal_received",
          title: "Nova proposta recebida",
          body: "Ana Contratante enviou uma proposta de R$ 900,00",
          proposalId: pendingProposal.id,
        },
      });

      const acceptedProposal = await prisma.proposal.create({
        data: {
          fromProfileId: bandProfile.profileId,
          toProfileId: venueProfile.id,
          fromUserId: bandOwner.id,
          toUserId: venueOwner.id,
          eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          message: "Disponíveis para sábado — repertório MPB e samba.",
          amount: 1100,
          status: "accepted",
        },
      });

      await prisma.notification.create({
        data: {
          userId: venueOwner.id,
          type: "proposal_accepted",
          title: "Proposta aceita!",
          body: "Sua proposta foi aceita",
          proposalId: acceptedProposal.id,
        },
      });
    }
  }

  console.log("Seed concluído!");
  console.log("Contas demo:");
  console.log("  demo@palco.com / demo123");
  console.log("  banda@palco.com / demo123");
  console.log("  bar@palco.com / demo123");
  console.log("  musico@palco.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
