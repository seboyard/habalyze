import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await db.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { identifier } = await req.json();

        if (!identifier) {
            return Response.json({ error: 'Missing identifier' }, { status: 400 });
        }

        let foundUsers = await db.asServiceRole.entities.User.filter({ username: identifier });
        if (foundUsers.length === 0) {
            foundUsers = await db.asServiceRole.entities.User.filter({ email: identifier });
        }

        if (foundUsers.length > 0) {
            return Response.json({ user: foundUsers[0] });
        } else {
            return Response.json({ user: null });
        }
    } catch (error) {
        console.error('Error fetching user by identifier:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});