"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function ProfileCreate() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!username.trim() || !name.trim()) {
            setError("Username and name are required");
            setLoading(false);
            return;
        }

        try {
            // Here you would typically send data to your API
            // For example: await fetch('/api/profile', { method: 'POST', body: JSON.stringify({ username, name }) })
            
            // For now, we'll just simulate success
            setTimeout(() => {
                router.push("/home/profile");
            }, 1000);
        } catch (err) {
            setError("Failed to create profile");
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Profile</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your username"
                        disabled={loading}
                    />
                </div>
                
                <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your full name"
                        disabled={loading}
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Create Profile"}
                </button>
            </form>
        </div>
    );
}