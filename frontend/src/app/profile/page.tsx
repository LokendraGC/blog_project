// app/change-password/page.tsx or wherever your page is

"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { myAppHook } from "@/context/AppProvider"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation";
import axios from "axios"
import Link from "next/link"


interface formData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

interface UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    username?: string;
    avatar?: string;
  };
  avatar?: string;
}

const ChangePassword = () => {
  const router = useRouter();
  const APP_URL = `${process.env.NEXT_PUBLIC_API_URL}`;


  const { authToken, changePassword } = myAppHook();
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);


  const [formData, setFormData] = useState<formData>({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });


  useEffect(() => {
    if (!authToken) {
      // Redirect if not logged in
      router.push("/");
    }
  }, [authToken, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.new_password !== formData.new_password_confirmation) {
      toast.error("New password and confirmation do not match");
      return;
    }


    // Additional validation
    if (!formData.current_password || !formData.new_password || !formData.new_password_confirmation) {
      toast.error('Please fill all fields')
      return
    }

    if (formData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }


    try {
      setIsSubmitting(true);
      await changePassword(
        formData.current_password,
        formData.new_password,
        formData.new_password_confirmation
      );

      // Clear form on success
      setFormData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });

    } catch (error) {
      console.error('Password change error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authToken) return;

      try {
        // 1. Ensure CSRF cookie is set
        await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
          withCredentials: true,
        });

        // 2. Make authenticated request with token
        const response = await axios.get(`${APP_URL}/api/auth/profile`, {
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        });

        // console.log(response.data.data.user.name);
        setUserProfile(response.data.data);
        setAvatar(response.data.avatar || response.data.user?.avatar || null);


      } catch (error) {
        if (axios.isAxiosError(error)) {

          console.error('Profile fetch error:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
          });
        }
      }
    };

    // Add small delay to ensure CSRF cookie is set
    const timer = setTimeout(() => {
      fetchProfile();
    }, 100);

    return () => clearTimeout(timer);
  }, [authToken, APP_URL]);


  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return '/default-avatar.png';
    return `${process.env.NEXT_PUBLIC_API_URL}/storage/avatars/${avatarPath}`;
  };

  return (
    <div className="flex min-h-screen bg-muted/50 p-6 gap-6">
      {/* Sidebar */}
      <Card className="w-80 p-6 flex flex-col items-center text-center">
        <Image
          src={getAvatarUrl(userProfile?.avatar)}
          alt="Profile Image"
          width={100}
          height={100}
          className="rounded-full border shadow-md"
          // Optional: Add a loader if you need custom URL construction
          loader={({ src }) => src}
        />
        <h2 className="text-xl font-semibold mt-4">{userProfile?.user.name}</h2>
        {/* <p className="text-muted-foreground text-sm">Full Stack Developer</p> */}
        <Separator className="my-4" />
        <Link href={'profile/edit-profile'}>
          <Button variant="outline" className="w-full cursor-pointer">Edit Profile</Button>
        </Link>
      </Card>

      {/* Main Content */}
      <Card className="flex-1 p-6">
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-muted-foreground">Name</Label>
            <p className="font-medium">{userProfile?.user.name}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Email</Label>
            <p className="font-medium">{userProfile?.user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Username</Label>
            <p className="font-medium">{userProfile?.user.username}</p>
          </div>


          <Separator className="my-4" />


          <div>
            {/* <Label className="text-muted-foreground">Change Password</Label> */}

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-3 gap-4">

                <div className="grid gap-3 mt-4">
                  <Label className="text-muted-foreground" htmlFor="password">Old Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-3 mt-4">
                  <Label className="text-muted-foreground" htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-3 mt-4">
                  <Label className="text-muted-foreground" htmlFor="new_password_confirmation">Confirm Password</Label>
                  <Input
                    id="new_password_confirmation"
                    type="password"
                    name="new_password_confirmation"
                    value={formData.new_password_confirmation}
                    onChange={handleChange}
                  />
                </div>

              </div>
              <Button className="mt-4 cursor-pointer">Update Password</Button>
            </form>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChangePassword
