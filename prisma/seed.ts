import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "src/generated/prisma/client";

const prisma = new PrismaClient({
    adapter:new PrismaPg({
        connectionString:"postgresql://user:admin@localhost:5432/userdb?schema=public"
    })
});

async function main() {
  console.log("🌱 Seeding database...");

  // -----------------------
  // Roles
  // -----------------------

  await prisma.roles.createMany({
    data: [
      {
        name: "OWNER",
        description: "Organization owner with full access",
      },
      {
        name: "ADMIN",
        description: "Administrator with management privileges",
      },
      {
        name: "MEMBER",
        description: "Regular organization member",
      },
      {
        name: "VIEWER",
        description: "Read-only access",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Roles seeded");

  // -----------------------
  // Permissions
  // -----------------------

  await prisma.permissions.createMany({
    data: [
      {
        name: "CREATE_ORGANIZATION",
        description: "Create organization",
      },
      {
        name: "UPDATE_ORGANIZATION",
        description: "Update organization",
      },
      {
        name: "DELETE_ORGANIZATION",
        description: "Delete organization",
      },
      {
        name: "VIEW_ORGANIZATION",
        description: "View organization",
      },

      {
        name: "INVITE_MEMBER",
        description: "Invite organization members",
      },
      {
        name: "REMOVE_MEMBER",
        description: "Remove members",
      },
      {
        name: "UPDATE_MEMBER_ROLE",
        description: "Change member roles",
      },
      {
        name: "VIEW_MEMBERS",
        description: "View members",
      },

      {
        name: "CREATE_PROJECT",
        description: "Create project",
      },
      {
        name: "UPDATE_PROJECT",
        description: "Update project",
      },
      {
        name: "DELETE_PROJECT",
        description: "Delete project",
      },
      {
        name: "VIEW_PROJECT",
        description: "View projects",
      },

      {
        name: "VIEW_AUDIT_LOGS",
        description: "View audit logs",
      },
    ],
    skipDuplicates: true,
  });

  const roles = await prisma.roles.findMany();
  const permissions = await prisma.permissions.findMany();

  const roleMap = new Map (roles.map(role=>[role.name,role.id]));

  const permissionsMap = new Map(
    permissions.map(permission=>[permission.name,permission.id])
  );

  const ROLE_PERMISSIONS = {
    OWNER: [
      "CREATE_ORGANIZATION",
      "UPDATE_ORGANIZATION",
      "DELETE_ORGANIZATION",
      "VIEW_ORGANIZATION",
  
      "INVITE_MEMBER",
      "REMOVE_MEMBER",
      "UPDATE_MEMBER_ROLE",
      "VIEW_MEMBERS",
  
      "CREATE_PROJECT",
      "UPDATE_PROJECT",
      "DELETE_PROJECT",
      "VIEW_PROJECT",
  
      "VIEW_AUDIT_LOGS",
    ],
  
    ADMIN: [
      "UPDATE_ORGANIZATION",
      "VIEW_ORGANIZATION",
  
      "INVITE_MEMBER",
      "REMOVE_MEMBER",
      "VIEW_MEMBERS",
  
      "CREATE_PROJECT",
      "UPDATE_PROJECT",
      "DELETE_PROJECT",
      "VIEW_PROJECT",
    ],
  
    MEMBER: [
      "VIEW_ORGANIZATION",
  
      "VIEW_MEMBERS",
  
      "CREATE_PROJECT",
      "UPDATE_PROJECT",
      "VIEW_PROJECT",
    ],
  
    VIEWER: [
      "VIEW_ORGANIZATION",
      "VIEW_MEMBERS",
      "VIEW_PROJECT",
    ],
  };

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const roleId = roleMap.get(roleName);
  
    if (!roleId) continue;
  
    for (const permissionName of permissions) {
      const permissionId = permissionsMap.get(permissionName);
  
      if (!permissionId) continue;
  
      await prisma.role_permissions.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log("✅ Permissions seeded");

  console.log("🎉 Seed completed successfully");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });