export interface PostData {
    id: number;
    title: string;
    content: string;
    feature_image?: string | null | undefined;
    short_description?: string;
    created_at: string | Date;
    user: {
        id: number;
        name: string;
        email: string;
        avatar?: string | null | undefined;
        username: string;
        created_at: string | undefined;

    }
}