'use client'
import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import Underline from '@tiptap/extension-underline'
import { useRouter } from 'next/navigation'
import { Label } from '@radix-ui/react-dropdown-menu'
import { myAppHook } from '@/context/AppProvider'
import axios from 'axios'
import { AlignCenter, AlignRight, Image as ImageIcon, Link as LinkIcon } from 'lucide-react' // Renamed icons
import { Image as TiptapImage } from '@tiptap/extension-image' // Tiptap extension
import { Link as TiptapLink } from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'


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
import Image from 'next/image'
import { PostData } from '@/types'
import { EDIT_POST } from '@/lib/ApiEndPoints'


type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
const headingLevels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

interface TipTapProps {
    post?: PostData
    onCreate?: (content: string, title: string) => void
    onUpdate?: (content: string, title: string) => void
}


const TipTap = ({ post }: TipTapProps) => {


    const { authToken, isLoading: isAppLoading } = myAppHook();
    const router = useRouter();
    const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

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
                console.error('Error fetching tags:', error);
            }
        };

        if (authToken) {
            getTags();
        }
    }, [authToken]);


    useEffect(() => {
        if (!authToken) {
            router.push('/');
        }
    }, [authToken]);


    // updating post 
    useEffect(() => {
        const updatePost = async () => {
            try {
                await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
                    withCredentials: true,
                });

                const response = await axios.post(`${EDIT_POST}/${post?.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    data: {
                        title: post?.title,
                        content: post?.content,
                        tags: tags.map(tag => {
                            return tag.id
                        }),
                        feature_image: post?.feature_image
                    }
                });

                if (response.data.status === 'success') {
                    toast.success('Post Updated Successfully');
                }

            } catch (error) {
                console.error('Error updating post:', error);
            }
        }

        updatePost();
    },[authToken]);


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

    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [StarterKit, Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TiptapLink.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:underline',
                },
            }),
            TiptapImage.configure({
                inline: true,
                allowBase64: true,
                HTMLAttributes: {
                    class: 'rounded-lg border border-gray-200',
                },
            }),
        ],
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


    const handleImageUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                // Show loading state
                toast.loading('Uploading image...');

                try {
                    // Create preview while uploading
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const base64 = e.target?.result as string;
                        editor?.chain().focus().setImage({ src: base64 }).run();
                        toast.dismiss();
                        toast.success('Image added');
                    };
                    reader.readAsDataURL(file);
                } catch (error) {
                    toast.dismiss();
                    toast.error('Failed to upload image');
                }
            }
        };

        input.click();
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

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);
            if (formData.tags) {
                formData.tags.forEach(tag => formDataToSend.append('tags[]', tag.toString()));
            }
            if (formData.feature_image instanceof File) {
                formDataToSend.append('feature_image', formData.feature_image);
            }

            const response = await axios.post(`${APP_URL}/api/auth/post`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                withCredentials: true
            })


            setFormData({
                title: '',
                content: '<p>Hello World! 🌎️</p>',
                tags: [],
            });


            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            toast.success('post created successfully')

            router.push('/');


        } catch (error) {
            console.error(error);
        }
    }

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

                                {/* Left Alignment */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                    className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
                                >
                                    <AlignLeft className="h-4 w-4" />
                                </Button>

                                {/* Center Alignment */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                    className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
                                >
                                    <AlignCenter className="h-4 w-4" />
                                </Button>

                                {/* Right Alignment */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                    className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
                                >
                                    <AlignRight className="h-4 w-4" />
                                </Button>

                                {/* Image Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleImageUpload}
                                    className={editor.isActive('image') ? 'bg-accent' : ''}
                                >
                                    <ImageIcon className="h-4 w-4" />
                                </Button>

                                {/* Link Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const previousUrl = editor.getAttributes('link').href;
                                        const url = window.prompt('Enter URL', previousUrl);

                                        if (url === null) return;

                                        if (url === '') {
                                            editor.chain().focus().extendMarkRange('link').unsetLink().run();
                                            return;
                                        }

                                        editor
                                            .chain()
                                            .focus()
                                            .extendMarkRange('link')
                                            .setLink({ href: url })
                                            .run();
                                    }}
                                    className={editor.isActive('link') ? 'bg-accent' : ''}
                                >
                                    <LinkIcon className="h-4 w-4" />
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
                        <Label className='font-bold'>Feature Image</Label>
                        {formData.feature_image ? (
                            <div className="relative">
                                <Image
                                    src={URL.createObjectURL(formData.feature_image)}
                                    alt="Preview"
                                    height={200}
                                    width={200}
                                    className="rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, feature_image: null }))}
                                    className="cursor-pointer absolute top-1 right-[100px] bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed rounded-lg p-4 flex items-center justify-center">
                                <span className="text-gray-500">No image selected</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept='image/*'
                            ref={fileInputRef}
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setFormData(prev => ({
                                        ...prev,
                                        feature_image: e.target.files![0]
                                    }));
                                }
                            }}
                            className="mt-2 cursor-pointer"
                        />
                    </div>
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