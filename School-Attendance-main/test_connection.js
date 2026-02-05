
const url = "https://cfrqthnhpnvfpweiskpe.supabase.co/rest/v1/";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmcnF0aG5ocG52ZnB3ZWlza3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MDg5NDgsImV4cCI6MjA4MDI4NDk0OH0.hrvngQ0qHikdsEl_bh3tnecTVOl9AZUBoGcWkwTjR8k";

console.log("Testing connection with ANON key to:", url);

fetch(url, {
    headers: {
        "apikey": key,
        "Authorization": "Bearer " + key
    }
}).then(res => {
    console.log("Status:", res.status);
    if (res.ok) {
        console.log("Connection successful!");
    } else {
        console.log("Connection failed with status:", res.status);
    }
    return res.text();
}).then(text => {
    // console.log("Body:", text.substring(0, 100));
})
    .catch(err => {
        console.error("Fetch Error:", err.message);
        if (err.cause) console.error("Cause:", err.cause);
    });
