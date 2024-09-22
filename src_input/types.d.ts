export interface TextSpace {
    _id: string;
    title: string;
    description: string;
    links: string[];
    views: number;
    secured: boolean;
    owner: string;
    password: string;
    autoDelete: boolean;
}