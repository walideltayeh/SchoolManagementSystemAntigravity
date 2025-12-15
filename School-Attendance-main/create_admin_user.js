
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://cfrqthnhpnvfpweiskpe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcnF0aG5ocG52ZnB3ZWlza3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDg5NDgsImV4cCI6MjA4MDI4NDk0OH0.hrvngQ0qHikdsEl_bh3tnecTVOl9AZUBoGcWkwTjR8k";
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
    console.log("Creating admin user...");

    const email = "admin@school.com";
    const password = "admin123";

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: {
                full_name: "School Admin",
                role: "admin" // Trying to set a role metadata, just in case
            }
        }
    });

    if (error) {
        console.error("Error creating admin user:", error.message);
    } else {
        console.log("Admin user created/retrieved successfully:", data.user?.id);
        console.log("Email:", email);
        console.log("Password:", password);
    }
}

createAdminUser();
