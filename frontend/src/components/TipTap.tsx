'use client'
import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import Underline from '@tiptap/extension-underline'
import { useRouter } from 'next/navigation'
import { Label } from '@radix-ui/react-dropdown-menu'
import { myAppHook } from '@/context/AppProvider'
import axios from 'axios'


import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Pilcrow,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code2,
    Minus,
    RemoveFormatting,
    AlignLeft,
    UnderlineIcon,
} from "lucide-react";
import toast from 'react-hot-toast'


type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
const headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];


const TipTap = () => {
    const { authToken, isLoading: isAppLoading } = myAppHook();
    const router = useRouter();
    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

    useEffect(() => {
        if (!authToken) {
            router.push('/');
        }
    }, [authToken, router]);

    interface TagData {
        id: number;
        tag_name: string;
        short_description: string;
        image: string;
        user_id?: number;
    }

    const [tags, setTags] = useState<TagData[]>([]);


    useEffect(() => {
        const getTags = async () => {
            try {
                await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                    withCredentials: true,
                });

                const response = await axios.get(`${APP_URL}/api/auth/tag`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                });

                setTags(response.data.data.data);
            } catch (error) {
                console.error(error);
            }
        };

        getTags();
        console.log(tags);
    }, []);


    interface FormData {
        title: string;
        short_description?: string;
        content: string;
        tags?: number[];
        feature_image?: File | null;
    }


    const [formData, setFormData] = useState<FormData>({
        title: '',
        content: '<p>Hello World! 🌎️</p>',
        tags: [],
    })

    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: formData.content,
        onUpdate: ({ editor }) => {
            setFormData(prev => ({
                ...prev,
                content: editor.getHTML()
            }));
        },
    });

    if (!editor) {
        return null;
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleCheckboxChange = (tagId: number) => {
        setFormData(prev => {
            const tags = prev.tags ?? [];
            if (tags.includes(tagId)) {
                return { ...prev, tags: tags.filter(id => id !== tagId) };
            } else {
                return { ...prev, tags: [...tags, tagId] };
            }
        });
    };



    const handleSubmit = async () => {
        if (!authToken) return;

        if (
            formData.title.trim() === '' ||
            formData.content.trim() === '' ||
            (formData.tags && formData.tags.length === 0)
        ) {
            toast.error('Please fill in all required fields');
            return;
        }


        try {
            await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                withCredentials: true
            })

            const response = await axios.post(`${APP_URL}/api/auth/post`, {
                title: formData.title,
                content: formData.content,
                tags: formData.tags
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            })

            toast.success('post created successfully')

            console.log(response);

        } catch (error) {
            console.error(error);
        }
        // const response = await axios.post('') 
        console.log(formData);
    }
    // console.log(tags);

    return (
        <div className=''>
            <div className="flex items-center justify-between p-4 mx-[80px] my-6">
                <input
                    type="text"
                    className="flex-1 font-bold border-none outline-none h-10 text-2xl mr-4"
                    placeholder="Title..."
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                />
                <Button
                    className="whitespace-nowrap cursor-pointer"
                    onClick={handleSubmit}
                    disabled={isAppLoading}
                >
                    {isAppLoading ? 'Saving...' : 'Save'}
                </Button>
            </div>
            <div className='grid grid-cols-1 items-center md:grid-cols-3 gap-[80px] px-10 py-4'>
                {/* Text editor */}
                <div className='md:col-span-2'>
                    <div className="container m-10">
                        <div className="mt-4">
                            {/* buttons */}
                            <div className='bg-gray-300 dark:bg-gray-600 dark:text-white text-black'>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleBold().run()}
                                    disabled={!editor.can().chain().focus().toggleBold().run()}
                                    className={editor.isActive("bold") ? "bg-accent" : ""}
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleItalic().run()}
                                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                                    className={editor.isActive("italic") ? "bg-accent" : ""}
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>


                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                                    className={editor.isActive('underline') ? 'bg-accent' : ''}
                                    aria-label="Underline"
                                >
                                    <UnderlineIcon className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleStrike().run()}
                                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                                    className={editor.isActive("strike") ? "bg-accent" : ""}
                                >
                                    <Strikethrough className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleCode().run()}
                                    disabled={!editor.can().chain().focus().toggleCode().run()}
                                    className={editor.isActive("code") ? "bg-accent" : ""}
                                >

                                    <Code className="h-4 w-4" />
                                </Button>

                                {/* Paragraph & Headings */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().setParagraph().run()}
                                    className={editor.isActive("paragraph") ? "bg-accent" : ""}
                                >
                                    <Pilcrow className="h-4 w-4" />
                                </Button>

                                {headingLevels.map((level) => (
                                    <Button
                                        key={level}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            editor.chain().focus().toggleHeading({ level }).run()
                                        }
                                        className={
                                            editor.isActive("heading", { level }) ? "bg-accent" : ""
                                        }
                                    >
                                        {level === 1 && <Heading1 className="h-4 w-4" />}
                                        {level === 2 && <Heading2 className="h-4 w-4" />}
                                        {level === 3 && <Heading3 className="h-4 w-4" />}
                                        {level > 3 && `H${level}`}
                                    </Button>
                                ))}

                                {/* Lists */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                                    className={editor.isActive("bulletList") ? "bg-accent" : ""}
                                >
                                    <List className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                    className={editor.isActive("orderedList") ? "bg-accent" : ""}
                                >
                                    <ListOrdered className="h-4 w-4" />
                                </Button>

                                {/* Blocks */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                                    className={editor.isActive("codeBlock") ? "bg-accent" : ""}
                                >
                                    <Code2 className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                    className={editor.isActive("blockquote") ? "bg-accent" : ""}
                                >
                                    <Quote className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>

                                {/* Clear Formatting */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                                >
                                    <RemoveFormatting className="h-4 w-4" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().clearNodes().run()}
                                >
                                    <AlignLeft className="h-4 w-4" />
                                </Button>


                            </div>
                            {/* editor content */}
                            <div className='border border-gray-400 border-t-0'>
                                <EditorContent editor={editor} className='max-h-96 overflow-y-scroll' />
                            </div>
                        </div>
                    </div>
                </div>
                {/* tags */}
                <div className='space-y-4 sticky top-4 h-fit'>
                    <div className="space-y-2 bg-background p-4 rounded-lg border">

                        <Label className='font-bold'>Select Tags</Label>
                        {tags?.length > 0 ? (
                            tags.map(tag => (
                                <div key={tag.id} className="mb-3 flex items-center">
                                    <input
                                        type="checkbox"
                                        name="tags[]"
                                        id={`tag-${tag.id}`}
                                        checked={formData.tags?.includes(tag.id)}
                                        onChange={() => handleCheckboxChange(tag.id)}
                                        className="cursor-pointer"
                                    />
                                    <label
                                        htmlFor={`tag-${tag.id}`}
                                        className="text-sm font-medium cursor-pointer text-gray-700 dark:text-gray-300 ml-1"
                                    >
                                        {tag.tag_name}
                                    </label>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No tags available</p>
                        )}


                    </div>
                </div>
            </div >
        </div >
    )
}

export default TipTap