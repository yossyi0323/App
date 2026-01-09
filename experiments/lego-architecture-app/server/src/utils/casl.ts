import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { db } from '../db/index.js';
import { policies } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function defineAbilitiesFor(role: string) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    // Fetch policies from DB for this role
    const policyRules = await db.select().from(policies).where(eq(policies.role, role));

    for (const rule of policyRules) {
        // Basic mapping. In real app, action/subject must be strictly typed or string
        const subject = rule.subject === 'all' ? 'all' : rule.subject;

        if (rule.conditions) {
            can(rule.action, subject, rule.conditions);
        } else {
            can(rule.action, subject);
        }
    }

    return build();
}
