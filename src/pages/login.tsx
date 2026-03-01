import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Film, User, Loader2, Mail, Phone, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import bgImage from '@/assets/images/cinema-bg.png';
import api from '@/lib/api';
import { useUserStore } from '@/stores/user.store';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const fetchMe = useUserStore((state) => state.fetchMe);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (currentUser) {
      currentUser.role === 'ADMIN' ? navigate('/admin') : navigate('/booking');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific error when user starts typing again
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[e.target.name];
        return newErrs;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Username: 3-20 chars
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 characters required';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Maximum 20 characters allowed';
    }

    // Password: Min 6 chars
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Registration Only fields
    if (!isLogin) {
      // Email check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email format';
      }

      // Phone check (Optional field logic: only validate if provided)
      if (formData.phone) {
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Phone must be 10 to 15 digits';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return; // Stop if validation fails
    }

    setIsLoading(true);

    try {
      const payload = isLogin 
        ? { username: formData.username, password: formData.password } 
        : formData;

      const res = await api.post(`/auth/${isLogin ? 'login' : 'register'}`, payload);

      if (res.data.success === false) {
        toast.error(res.data.message || 'Operation failed');
        return;
      }

      if (isLogin) {
        toast.success('Welcome back!');
        await fetchMe();
        const user = res.data.data;
        user.role === 'ADMIN' ? navigate('/admin') : navigate('/booking');
      } else {
        toast.success('Registration successful! Please login.');
        setIsLogin(true);
        setFormData({ username: '', password: '', email: '', phone: '' });
        setErrors({});
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Server connection failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen relative bg-background'>
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      {/* Background Layer */}
      <div className='hidden lg:block absolute inset-0 -z-10'>
        <img src={bgImage} className='w-full h-full object-cover opacity-90' alt="cinema-bg" />
        <div className='absolute inset-0 bg-background/80' />
      </div>

      {/* Branding for Mobile */}
      <div className='lg:hidden flex items-center justify-center py-6'>
        <Film className='w-10 h-10 text-primary mr-2' />
        <h1 className='text-2xl font-bold'>
          ABC <span className='text-primary'>Cinema</span>
        </h1>
      </div>

      <div className='flex min-h-screen lg:grid lg:grid-cols-2'>
        {/* Branding for Desktop */}
        <div className='hidden lg:flex flex-col justify-center px-20 text-white'>
          <Film className='w-16 h-16 text-primary mb-6' />
          <h1 className='text-5xl font-bold mb-4'>
            ABC <span className='text-primary'>Cinema</span>
          </h1>
          <p className='text-lg text-muted-foreground max-w-md'>
            Premium seatings, unforgettable experiences.
          </p>
        </div>

        {/* Form Container */}
        <div className='flex items-center justify-center w-full px-4'>
          <Card className='w-full max-w-md bg-black/50 backdrop-blur-xl border-white/10'>
            <CardHeader className='text-center'>
              <CardTitle className='text-2xl'>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </CardTitle>
              <CardDescription>
                {isLogin ? 'Login to your account' : 'Join us to start booking'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4' noValidate>
                {/* Username Field */}
                <div className='space-y-1.5'>
                  <Label className={errors.username ? 'text-red-500' : ''}>Username</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      name='username'
                      className={`pl-9 ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.username && <p className='text-xs text-red-500 font-medium'>{errors.username}</p>}
                </div>

                {!isLogin && (
                  <>
                    {/* Email Field */}
                    <div className='space-y-1.5'>
                      <Label className={errors.email ? 'text-red-500' : ''}>Email</Label>
                      <div className='relative'>
                        <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <Input
                          name='email'
                          type='email'
                          className={`pl-9 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.email && <p className='text-xs text-red-500 font-medium'>{errors.email}</p>}
                    </div>

                    {/* Phone Field */}
                    <div className='space-y-1.5'>
                      <Label className={errors.phone ? 'text-red-500' : ''}>Phone</Label>
                      <div className='relative'>
                        <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                        <Input
                          name='phone'
                          className={`pl-9 ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>
                      {errors.phone && <p className='text-xs text-red-500 font-medium'>{errors.phone}</p>}
                    </div>
                  </>
                )}

                {/* Password Field */}
                <div className='space-y-1.5'>
                  <Label className={errors.password ? 'text-red-500' : ''}>Password</Label>
                  <div className='relative'>
                    <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      name='password'
                      type='password'
                      className={`pl-9 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.password && <p className='text-xs text-red-500 font-medium'>{errors.password}</p>}
                </div>

                <Button
                  type='submit'
                  className='w-full h-11 mt-2 transition-all duration-200'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    isLogin ? 'Login' : 'Register'
                  )}
                </Button>

                <div className='text-center pt-2'>
                  <button
                    type='button'
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ username: '', password: '', email: '', phone: '' });
                      setErrors({});
                    }}
                    className='text-sm text-primary hover:underline transition-colors'
                  >
                    {isLogin
                      ? "Don't have an account? Register"
                      : 'Already have an account? Login'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}