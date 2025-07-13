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


export interface User {
    user: {
        id: number;
        name: string | null;
        email: string;
        username: string;
        avatar?: string;
    };
    avatar?: string;
}



export interface TagData {
    id: number;
    tag_name: string;
    short_description: string;
    image: string;
    user_id?: number;
}



export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    body: string;
    created_at: string;
    updated_at: string;
    user: User;
}