
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cfrqthnhpnvfpweiskpe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcnF0aG5ocG52ZnB3ZWlza3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDg5NDgsImV4cCI6MjA4MDI4NDk0OH0.hrvngQ0qHikdsEl_bh3tnecTVOl9AZUBoGcWkwTjR8k";
const supabase = createClient(supabaseUrl, supabaseKey);

const teachers = [
    { name: "John Anderson", email: "j.anderson@school.edu" },
    { name: "Dr. Emily Thompson", email: "e.thompson@school.edu" },
    { name: "Sarah Mitchell", email: "s.mitchell@school.edu" },
    { name: "Robert Davis", email: "r.davis@school.edu" },
    { name: "Lisa Chen", email: "l.chen@school.edu" },
    { name: "Michael Brown", email: "m.brown@school.edu" },
    { name: "Jennifer Garcia", email: "j.garcia@school.edu" },
    { name: "Carlos Rodriguez", email: "c.rodriguez@school.edu" }
];

async function createUsers() {
    console.log("Starting user creation...");

    for (const teacher of teachers) {
        console.log(`Creating user for ${teacher.name} (${teacher.email})...`);

        // 1. Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: teacher.email,
            password: "teacher123",
            options: {
                data: {
                    full_name: teacher.name,
                }
            }
        });

        if (authError) {
            console.error(`Error creating user ${teacher.email}:`, authError.message);
            if (!authError.message.includes("already registered")) {
                continue;
            }
        }

        let user = authData.user;

        if (!user && authError && authError.message.includes("already registered")) {
            console.log(`User exists, signing in to get ID...`);
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: teacher.email,
                password: "teacher123"
            });
            if (signInError) {
                console.error(`Could not sign in as ${teacher.email}:`, signInError.message);
                continue;
            }
            user = signInData.user;
        }

        if (!user) {
            console.error(`No user object available for ${teacher.email}`);
            continue;
        }

        console.log(`User ID: ${user.id}`);

        // 2. Link to Teachers Table
        console.log(`Attempting to link teacher record...`);
        const { error: updateError } = await supabase
            .from('teachers')
            .update({ user_id: user.id })
            .eq('email', teacher.email);

        if (updateError) {
            console.error(`Error linking teacher record for ${teacher.email}:`, updateError.message);
        } else {
            console.log(`Successfully linked teacher record for ${teacher.name}`);
        }

        await supabase.auth.signOut();
    }
}

createUsers();
