export default interface PostData {
    id: number;
    title: string;
    content: string;
    feature_image?: string | null | undefined;
    short_description?: string;
    created_at: string;
    likes_count: number;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string | null | undefined;
        username: string;
        created_at: string | undefined;

    }
    tags?: { id: string }[];
}



interface UserData {
    id: number;
    name: string;
    email: string;
    avatar?: string | null | undefined;
    username: string;
    created_at: string;
}