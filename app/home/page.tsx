import Link from "next/link";

export default function HomePage() {
    const directories = [
        {
            name: "Tango (単語リスト)",
            description: "Pick which words you want to learn",
            path: "/vocabulary",
            color: "bg-pink-500",
        },
        {
            name: "Moji (文字)",
            description: "Reading practice with hiragana, katakana, and kanji",
            path: "/reading",
            color: "bg-red-500",
        },
        {
            name: "Shosha (書写)",
            description: "Writing practice and character formation",
            path: "/writing",
            color: "bg-blue-500",
        },
        {
            name: "Kaiwa (会話)",
            description: "Speaking exercises and pronunciation guides",
            path: "/speaking",
            color: "bg-green-500",
        },
        {
            name: "Chokai (聴解)",
            description: "Listening comprehension and audio materials",
            path: "/listening",
            color: "bg-yellow-500",
        },
        {
            name: "Eizou (映像)",
            description: "Video content and visual learning resources",
            path: "/viewing",
            color: "bg-purple-500",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-4xl w-full mx-auto text-center" style={{ padding: "0 1rem", alignContent: "center", justifyContent: "center"}}>
                <header className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        日本語を学ぼう
                    </h1>
                    <p className="text-xl text-gray-600">Let's Learn Japanese</p>
                </header>
    
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
                    {directories.map((dir) => (
                        <Link href={dir.path} key={dir.name} className="w-full flex justify-center">
                            <div 
                                className={`${dir.color} rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer text-white text-center w-full max-w-xs`}
                            >
                                <h2 className="text-2xl font-bold mb-2">{dir.name}</h2>
                                <p className="opacity-90">{dir.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                
                <footer className="mt-16 text-gray-500 text-sm text-center">
                    <p>Your journey to Japanese fluency starts here.</p>
                </footer>
            </div>
        </div>
    );
}
