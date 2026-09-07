import "dotenv/config";
import {
  PrismaClient,
  RequestPriority,
  RequestStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Starting database seed...");

  // Clean development data in dependency order.
  await prisma.request.deleteMany();
  await prisma.serviceType.deleteMany();
  await prisma.technician.deleteMany();

  const technicians = await Promise.all([
    prisma.technician.create({
      data: {
        name: "Pedro Pérez",
        email: "pedro.perez@interactuar.local",
      },
    }),
    prisma.technician.create({
      data: {
        name: "Laura Gómez",
        email: "laura.gomez@interactuar.local",
      },
    }),
    prisma.technician.create({
      data: {
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@interactuar.local",
      },
    }),
    prisma.technician.create({
      data: {
        name: "Ana Martínez",
        email: "ana.martinez@interactuar.local",
      },
    }),
  ]);

  const [
    hardwareService,
    softwareService,
    networkService,
    accessService,
    maintenanceService,
  ] = await Promise.all([
    prisma.serviceType.create({
      data: {
        name: "Mantenimiento de equipos",
        description: "Diagnóstico y mantenimiento preventivo o correctivo de equipos.",
      },
    }),
    prisma.serviceType.create({
      data: {
        name: "Instalación de software",
        description: "Instalación, configuración y actualización de software.",
      },
    }),
    prisma.serviceType.create({
      data: {
        name: "Soporte de red",
        description: "Atención de problemas relacionados con conectividad y red.",
      },
    }),
    prisma.serviceType.create({
      data: {
        name: "Gestión de accesos",
        description: "Creación, modificación o recuperación de accesos a sistemas.",
      },
    }),
    prisma.serviceType.create({
      data: {
        name: "Mantenimiento de impresoras",
        description: "Soporte y mantenimiento de impresoras y dispositivos de impresión.",
      },
    }),
  ]);

  await prisma.request.createMany({
    data: [
      {
        title: "Impresora no imprime",
        description:
          "La impresora del área administrativa presenta errores al enviar documentos.",
        priority: RequestPriority.HIGH,
        status: RequestStatus.ASSIGNED,
        technicianId: technicians[0].id,
        serviceTypeId: maintenanceService.id,
      },
      {
        title: "Instalación de Microsoft Office",
        description:
          "Se requiere instalar y configurar Microsoft Office en un equipo nuevo.",
        priority: RequestPriority.MEDIUM,
        status: RequestStatus.PENDING,
        serviceTypeId: softwareService.id,
      },
      {
        title: "Equipo sin conexión a internet",
        description:
          "El equipo de recepción perdió la conexión a la red corporativa.",
        priority: RequestPriority.CRITICAL,
        status: RequestStatus.IN_PROGRESS,
        technicianId: technicians[1].id,
        serviceTypeId: networkService.id,
      },
      {
        title: "Restablecimiento de contraseña",
        description:
          "El usuario no puede ingresar al sistema corporativo y solicita recuperación de acceso.",
        priority: RequestPriority.HIGH,
        status: RequestStatus.RESOLVED,
        technicianId: technicians[2].id,
        serviceTypeId: accessService.id,
      },
      {
        title: "Equipo presenta lentitud",
        description:
          "El computador presenta bajo rendimiento durante las actividades diarias.",
        priority: RequestPriority.MEDIUM,
        status: RequestStatus.ASSIGNED,
        technicianId: technicians[3].id,
        serviceTypeId: hardwareService.id,
      },
      {
        title: "Actualización de antivirus",
        description:
          "Se requiere actualizar el antivirus instalado en el equipo del usuario.",
        priority: RequestPriority.LOW,
        status: RequestStatus.PENDING,
        serviceTypeId: softwareService.id,
      },
      {
        title: "Revisión de impresora de contabilidad",
        description:
          "La impresora presenta atascos frecuentes de papel.",
        priority: RequestPriority.MEDIUM,
        status: RequestStatus.IN_PROGRESS,
        technicianId: technicians[0].id,
        serviceTypeId: maintenanceService.id,
      },
      {
        title: "Configuración de acceso VPN",
        description:
          "Se requiere configurar el acceso VPN para trabajo remoto.",
        priority: RequestPriority.HIGH,
        status: RequestStatus.PENDING,
        serviceTypeId: accessService.id,
      },
    ],
  });

  const [technicianCount, serviceTypeCount, requestCount] = await Promise.all([
    prisma.technician.count(),
    prisma.serviceType.count(),
    prisma.request.count(),
  ]);

  console.log(`✅ Technicians: ${technicianCount}`);
  console.log(`✅ Service types: ${serviceTypeCount}`);
  console.log(`✅ Requests: ${requestCount}`);
  console.log("🌱 Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
