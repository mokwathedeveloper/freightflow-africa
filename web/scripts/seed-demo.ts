/**
 * Demo seed script — creates 3 test accounts with known credentials.
 *
 * Usage:
 *   node --experimental-strip-types --env-file=.env.local scripts/seed-demo.ts
 *
 * Demo accounts:
 *   Admin:        +254700000001  /  Admin1234
 *   Shipper:      +254700000002  /  Shipper1234
 *   Transporter:  +254700000003  /  Transport1234
 */

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Run with --env-file=.env.local');
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_USERS = [
  { name: 'Demo Admin',        phone: '+254700000001', password: 'Admin1234',     role: 'ADMIN'       as const },
  { name: 'Demo Shipper',      phone: '+254700000002', password: 'Shipper1234',   role: 'SHIPPER'     as const, company: 'Demo Logistics Ltd' },
  { name: 'Demo Transporter',  phone: '+254700000003', password: 'Transport1234', role: 'TRANSPORTER' as const, vehicleType: '10-Ton Truck', numberPlate: 'KCA 001D' },
];

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: { name: 'FreightFlow', slug: 'default' },
  });

  console.log(`Tenant: ${tenant.name} (${tenant.id})\n`);

  for (const u of DEMO_USERS) {
    const passwordHash = bcrypt.hashSync(u.password, 12);

    const user = await prisma.user.upsert({
      where: { phone: u.phone },
      update: { passwordHash, isVerified: true, isActive: true },
      create: {
        tenantId: tenant.id,
        phone: u.phone,
        name: u.name,
        passwordHash,
        role: u.role,
        isVerified: true,
        isActive: true,
        company:     'company'     in u ? u.company     : undefined,
        vehicleType: 'vehicleType' in u ? u.vehicleType : undefined,
        numberPlate: 'numberPlate' in u ? u.numberPlate : undefined,
      },
    });

    console.log(`[${user.role.padEnd(11)}] ${user.phone}  /  ${u.password}  →  ${user.id}`);
  }

  console.log('\nDone. Log in at http://localhost:3000/auth/login');
}

main()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
