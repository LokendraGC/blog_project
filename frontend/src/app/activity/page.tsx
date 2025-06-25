import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar"
import { Bookmark, Heart, MessageSquare, Pencil, Trash2 } from "lucide-react"


const Activity = () => {
    return (
        <div>
            <Tabs defaultValue="liked" className="w-full max-w-2xl mx-auto">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg h-12">
                    <TabsTrigger
                        value="liked"
                        className="cursor-pointer transition-all duration-300 
                data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 
                data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2
                text-gray-700 dark:text-gray-300"
                    >
                        <Heart className="w-4 h-4 text-pink-500 dark:text-pink-400" />
                        Liked Posts
                        <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-200 text-xs px-2 py-0.5 rounded-full ml-1">
                            24
                        </span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="saved"
                        className="cursor-pointer transition-all duration-300 
                data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 
                data-[state=active]:shadow-sm rounded-lg flex items-center justify-center gap-2
                text-gray-700 dark:text-gray-300"
                    >
                        <Bookmark className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                        Saved Posts
                        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-0.5 rounded-full ml-1">
                            12
                        </span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="liked" className="mt-6">
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="p-4 border rounded-xl hover:shadow-md transition-all 
                    bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`/avatars/${i + 1}.jpg`} />
                                        <AvatarFallback>U{i + 1}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-3 mb-2">
                                        
                                        <div>
                                            <h3 className="font-semibold dark:text-white">User {i + 1}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        This is a post you liked recently. The content would appear here...
                                    </p>
                                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                            <Pencil className="w-4 h-4" />
                                            <span>Edit</span>
                                        </button>
                                        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    This is a post you liked recently. The content would appear here...
                                </p>
                                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <button className="flex items-center gap-1 text-pink-500 dark:text-pink-400">
                                        <Heart className="w-4 h-4 fill-current" />
                                        <span>Liked</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Comment</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="saved" className="mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="p-4 border rounded-xl hover:shadow-md transition-all 
                    bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-semibold dark:text-white">Saved Post {i + 1}</h3>
                                    <Bookmark className="w-5 h-5 text-blue-500 dark:text-blue-400 fill-current" />
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">
                                    This is content you saved for later reference...
                                </p>
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Saved 3 days ago</span>
                                    <button className="text-xs text-blue-500 dark:text-blue-400 hover:underline">
                                        View Post
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Activity